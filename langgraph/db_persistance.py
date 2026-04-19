from langgraph.graph import START, END, StateGraph
from openai import OpenAI
from dotenv import load_dotenv
from typing import List, Annotated
from typing_extensions import TypedDict
import os
from operator import add
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from langchain_openai import OpenAIEmbeddings
from pymongo import MongoClient
from qdrant_client.models import (
    FieldCondition,
    Filter,
    MatchValue,
    PayloadSchemaType,
)

load_dotenv()

client = OpenAI()


qdrant_api_key = os.environ.get("QDRANT_API_KEY")
cluster_endpoint = os.environ.get("CLUSTER_ENDPOINT")
mongo_key= os.environ.get("MONGODB_URI")

qdrant_client = QdrantClient(
     url=cluster_endpoint, 
    api_key=qdrant_api_key,
)

mongo_client = MongoClient(mongo_key)
db = mongo_client["chat_ui"]
collection = db["messages"]


try:
    qdrant_client.create_collection(
        collection_name="chat_collection",
        vectors_config={"size": 3072, "distance": "Cosine"} 
    )
except Exception as e:
    print("Collection already exists, skipping...")

try:
    qdrant_client.create_payload_index(
        collection_name="chat_collection",
        field_name="metadata.thread_id",
        field_schema=PayloadSchemaType.KEYWORD
    )
except Exception as e:
    print("Payload index creation skipped:", e)

embeddings = OpenAIEmbeddings(model="text-embedding-3-large")

vector_store = QdrantVectorStore(
    client=qdrant_client,
    collection_name="chat_collection",
    embedding=embeddings,
) 

class State(TypedDict):
    messages: Annotated[List[dict], add]
    
workflow = StateGraph(State)

def QueryResolver(state: State, config):
    result = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=state["messages"]
    )
    user_query = state["messages"][-1]["content"]
    thread_id = config["configurable"]["thread_id"]
     
    msg = result.choices[0].message
    
    data = {
        "thread_id": thread_id,
        "query": user_query,
        "assistant_response": msg.content
        
    }
    
    collection.insert_one(data)
    
    vector_store.add_texts(
        texts=[user_query],
        metadatas=[{
            "thread_id": thread_id,
            "type": "user"
        }]
    )
    
    vector_store.add_texts(
        texts=[msg.content],
        metadatas=[{
            "thread_id": thread_id,
            "type": "assistant"
        }]
    )
    
    return {
        "messages": [{
                "role": "assistant",
                "content": msg.content
        }]
    }
    
def RetrivalData(state: State, config):
    print("Retrival data node start point")
    threadId = config["configurable"]["thread_id"]
    user_query = state["messages"][-1]["content"]
    print("user query is: ", user_query)
    thread_filter = Filter(
        must=[
            FieldCondition(
                key="metadata.thread_id",
                match=MatchValue(value=str(threadId))
            )
        ]
    )
    try:
        print("Retrival data node Try block")
        result = vector_store.similarity_search(
            query=user_query,
            k=5,
            filter=thread_filter
        )
        print("Data from qdrant: ", result)
        if not result:
            print("Semantic search returned no matches. Falling back to thread scroll.")
            points, _ = qdrant_client.scroll(
                collection_name="chat_collection",
                limit=10,
                with_payload=True,
                with_vectors=False,
            )
            result = [
                point.payload.get("page_content", "")
                for point in points
                if point.payload
                and point.payload.get("page_content")
                and point.payload.get("metadata", {}).get("thread_id") == str(threadId)
            ]
            print("Fallback data from qdrant: ", result)
    except Exception as e:
        print("Retrival data node except block")
        print("Retrival error: ", e)
        result = []
    
    if result and hasattr(result[0], "page_content"):
        context = "\n".join([doc.page_content for doc in result])
    else:
        context = "\n".join(result) if result else ""
    return {
        "messages": [{
            "role": "system",
            "content":  (context + "\n\n" + user_query) if context else user_query
        }]
    }
    
workflow.add_node("query_resolver", QueryResolver)
workflow.add_node("qdrant_data", RetrivalData)

workflow.add_edge(START, "qdrant_data")
workflow.add_edge("qdrant_data", "query_resolver")
workflow.add_edge("query_resolver", END)

graph = workflow.compile()

while True:
    threadId = input("From which thread you want to start: ")
    config = { "configurable": { "thread_id": threadId } }
    query = input("Ask any question?")
    if(query == "0"):
        break
    result = graph.invoke({"messages": [{"role": "user", "content": query}]},config=config)
    print(result)
    print("\n-----------------------------------------------------------------------------------\n")
