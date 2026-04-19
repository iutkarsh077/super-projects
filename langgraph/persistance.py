from langgraph.graph import START, END, StateGraph
from langgraph.checkpoint.memory import InMemorySaver
from typing import List, Annotated
from typing_extensions import TypedDict
from dotenv import load_dotenv
from openai import OpenAI
from operator import add

load_dotenv()

client = OpenAI()

class State(TypedDict):
    messages: Annotated[List[dict], add]
    
def QueryResolver(state: State):
    result = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=state["messages"]
    )
    
    # print("The query res is: ", result.choices[0].message.model_dump())
    
    msg = result.choices[0].message
    
    return {
        "messages": [{
                "role": "assistant",
                "content": msg.content
        }]
    }
    

workflow= StateGraph(State)

workflow.add_node("resolver", QueryResolver)


workflow.add_edge(START, "resolver")
workflow.add_edge("resolver", END)

checkpointer = InMemorySaver()
graph = workflow.compile(checkpointer=checkpointer)


while True:
    threadId = input("From which thread you want to start: ")
    config = { "configurable": { "thread_id": threadId } }
    query = input("Ask any question?")
    if(query == "0"):
        break
    result = graph.invoke({"messages": [{"role": "user", "content": query}]},config=config)
    print(result)