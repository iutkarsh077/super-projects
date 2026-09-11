from langgraph.graph import START, END, StateGraph
from typing import TypedDict, Annotated
import operator
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
from langchain_tavily import TavilySearch
import os
from langgraph.prebuilt import ToolNode

load_dotenv()

tavily_key = os.getenv("TAVILY_API_KEY")


class State(TypedDict):
    question: Annotated[list, operator.add]
    answer: Annotated[list, operator.add]
    messages: Annotated[list, operator.add]


tavily_tool = TavilySearch(max_results=5, topic="general")


@tool
def WebSearch(query):
    """Used to do web search to find things online"""
    print("In the web search tool: ", query)

    result = tavily_tool.invoke({"query": query})
    print("The result is: ", result)
    return result


llm = ChatOpenAI(model="gpt-5.4-mini")

all_tools = [WebSearch]

llm_with_tools = llm.bind_tools(all_tools)


def should_continue(state: State):
    last_message = state["answer"][-1]

    if last_message.tool_calls:
        return "tools"

    return "end"


def AgentCall(state: State):
    query = state["messages"]
    response = llm_with_tools.invoke(query)

    print("agent calls happen: ", response)
    return {"answer": [response], "messages": [response]}


graph = StateGraph(State)

graph.add_node("query_resolver", AgentCall)
graph.add_node("tools", ToolNode(all_tools))

graph.add_edge(START, "query_resolver")

graph.add_conditional_edges(
    "query_resolver", should_continue, {"tools": "tools", "end": END}
)

graph.add_edge("tools", "query_resolver")

workflow = graph.compile()


def main():
    query = input("What is your query?")

    result = workflow.invoke({"messages": [query], "question": [query]})
    print(result["messages"][-1].content)


main()

#  what is the current weather of new york?
