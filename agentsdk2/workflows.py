from langgraph.graph import START, END, StateGraph
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from typing import Annotated, TypedDict
from langchain.tools import tool
from langgraph.prebuilt import ToolNode, tools_condition
from langchain_core.messages import SystemMessage, HumanMessage
from langgraph.graph.message import add_messages
import os

load_dotenv()

llm = ChatOpenAI(
    model="gpt-5.4-mini",
    api_key=os.getenv("OPENAI_API_KEY")
)

class CurrentState(TypedDict):
    messages: Annotated[list, add_messages]
    
@tool
def getWeather(city: str):
    """Give the weather of a city in the whole world"""
    return f"weather of {city} is 34 degree celcius"

@tool
def addition(a: int, b: int):
    """adds two numbers"""
    return a + b


all_tools = [getWeather, addition]
llm_with_tools = llm.bind_tools(all_tools)

def call_model(state: CurrentState):
    last_message = state["messages"]
    response = llm_with_tools.invoke(last_message)
    return { "messages":  [response] }


builder = StateGraph(CurrentState)
builder.add_node("agent", call_model)
builder.add_node("tools", ToolNode(all_tools))

builder.add_edge(START, "agent")
builder.add_conditional_edges("agent", tools_condition)
builder.add_edge("tools", "agent")


graph = builder.compile()

result = graph.invoke({
    "messages": [
        SystemMessage(content="You are a careful assistant. Use tools when needed."),
        HumanMessage(content="What is the weather of London city?")
    ]
})

print(result["messages"][-3])