from openai import OpenAI
from dotenv import load_dotenv
from mem0 import MemoryClient
import os
from typing import TypedDict, Annotated, List
from operator import add
from langgraph.graph import StateGraph, START, END

load_dotenv()
client = OpenAI()

memo_api_key = os.environ.get("MEM0_API_KEY")
memo = MemoryClient(api_key=memo_api_key)

class State(TypedDict):
    messages: Annotated[List[dict], add]
    

def Teacher(state: State):
    user_query = state["messages"][-1]["content"]

    memories = memo.search(user_query, filters={"user_id": "utkarsh"})

    context = ""
    if isinstance(memories[0], str):
        context = "\n".join(memories)
    else:
        context = "\n".join([m.get("memory", "") for m in memories])

   
    messages = [
        {"role": "system", "content": f"Use this memory if relevant:\n{context}"},
        {"role": "user", "content": user_query}
    ]

    result = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=messages
    )
    
    msg = result.choices[0].message.content

   
    memo.add(
        [{"role": "user", "content": user_query}],
        user_id="utkarsh"
    )

    return {
        "messages": [{
            "role": "assistant",
            "content": msg
        }]
    }
    

workflow = StateGraph(State)

workflow.add_node("teacher", Teacher)

workflow.add_edge(START, "teacher")
workflow.add_edge("teacher", END)

graph = workflow.compile()


while True:
    query = input("Ask any question? ")
    if query == "0":
        break

    result = graph.invoke(
        {"messages": [{"role": "user", "content": query}]}
    )

    print(result["messages"][-1]["content"])
    print("\n------------------------------------------\n")