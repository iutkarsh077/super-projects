from dotenv import load_dotenv
from langgraph.graph import START, END, StateGraph
from langchain_openai import ChatOpenAI
from langchain.tools import tool
from langgraph.prebuilt import ToolNode
from langchain_tavily import TavilySearch
from typing import TypedDict, Annotated
import operator
import os

load_dotenv()


class State(TypedDict):
    messages: Annotated[list, operator.add]


tavily_key = os.getenv("TAVILY_API_KEY")

tavily_tool = TavilySearch(max_results=5, topic="general")


@tool
def WebSearch(query: str):
    """It Searchs on the internet and find relevent content"""
    result = tavily_tool.invoke(query)

    return result


all_tools = [WebSearch]

llm = ChatOpenAI(model="gpt-5.4-mini")
llm_with_tools = llm.bind_tools(all_tools)


def QueryResolverAgent(state: State):
    messages = state["messages"]
    response = llm_with_tools.invoke(messages)

    return {"messages": [response]}


def shouldContinue(state: State):
    last_messages = state["messages"][-1]

    if last_messages.tool_calls:
        return "tools"
    return "end"


graph = StateGraph(State)

graph.add_node("query_resolver", QueryResolverAgent)
graph.add_node("tools", ToolNode(all_tools))

graph.add_edge(START, "query_resolver")
graph.add_conditional_edges("query_resolver", shouldContinue, {"tools": "tools", "end": END})

graph.add_edge("tools", "query_resolver")

workflow = graph.compile()


def main():
    query = input("What is your query? ")
    result = workflow.invoke({"messages": [query]})

    print(result["messages"][-1].content)


main()


# What is the weather in California