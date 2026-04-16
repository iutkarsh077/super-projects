from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import InMemorySaver
from typing import Annotated, List
from typing_extensions import TypedDict
from operator import add
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

openai = OpenAI()

class State(TypedDict):
     messages: Annotated[List[dict], add]
    
def chatbot_openai(state: State):
    response = openai.chat.completions.create(
        model="gpt-4.1-mini",
        messages=state["messages"]
    )
    
    return {
        "messages": [
            response.choices[0].message.model_dump()
        ]
    }


workflow = StateGraph(State)
workflow.add_node("chatbot", chatbot_openai)
workflow.add_edge(START, "chatbot")
workflow.add_edge("chatbot", END)

checkpointer = InMemorySaver()
graph = workflow.compile(checkpointer=checkpointer)
config = {"configurable": {"thread_id": "1"}}

while True:
    query = input("Ask any question?")
    if(query == "0"):
        break
    result = graph.invoke({"messages": [{"role": "user", "content": query}]},config=config)
    print(result)