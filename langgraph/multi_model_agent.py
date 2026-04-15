from langgraph.graph import StateGraph, MessagesState, START, END
from langchain_openai import ChatOpenAI
from typing import TypedDict

from dotenv import load_dotenv

load_dotenv()

class GraphState(TypedDict):
    input: str
    output: str

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

def llm_node(state: GraphState):
    response = llm.invoke(state["input"])
    
    return {
        "output": response.content
    }
    

def checker(state: GraphState):
    response = llm.invoke(f"Is the following answer correct? {state['output']}")
    return {
        "output": response.content
    }

builder = StateGraph(GraphState)
builder.add_node("llm_node", llm_node)
builder.add_node("checker", checker)
builder.add_edge(START, "llm_node")
builder.add_edge("llm_node", "checker")
builder.add_edge("checker", END)

graph = builder.compile()
result = graph.invoke({"input": "What is the capital of France?"})    
print(result["output"])