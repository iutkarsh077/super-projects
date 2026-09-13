from langgraph.graph import START, END, StateGraph
from typing import TypedDict, Annotated
import operator
from langchain_core.tools import tool
from langgraph.prebuilt import ToolNode
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_tavily import TavilySearch
import os
import httpx
from pymongo import AsyncMongoClient
import asyncio

load_dotenv()

mongodb_uri = os.getenv("MONGODB_URL")

dbClient = AsyncMongoClient(mongodb_uri)

db = dbClient["whatsappweb"]
collections = db["users"]


class State(TypedDict):
    query: Annotated[list, operator.add]
    answer: Annotated[list, operator.add]
    messages: Annotated[list, operator.add]


# tavily_api_key = os.getenv("TAVILY_API_KEY")
tavily_tool = TavilySearch(max_results=5, topic="general")


@tool
def WebSearch(query: str):
    """It do the web search and find the general answers"""
    result = tavily_tool.invoke(query)
    print("Tavily answer is: ", result)
    return result


llm = ChatOpenAI(model="gpt-5.4-mini")


@tool
async def GithubUserInformation(username: str):
    """It calls the github api and get the github public user information by using Github username"""
    url = f"https://api.github.com/users/{username}"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)

    print("Github response is: ", response)
    return response.json()


@tool
async def GetDatabaseUserByEmail(email: str):
    """It is used to find the users in the mongodb database. The return values strictly should follow this schema { "name": "Utkarsh", "email": "utkarsh@example.com", "role": "admin" } only and not other text"""
    result = await collections.find_one({"email": email})
    return result


all_tools = [GithubUserInformation, GetDatabaseUserByEmail, WebSearch]

llm_with_tools = llm.bind_tools(all_tools)


def QueryResolverAgent(state: State):
    query = state["messages"]

    result = llm_with_tools.invoke(query)

    return {"messages": [result]}


def ShouldContinue(state: State):
    last_messages = state["messages"][-1]

    if last_messages.tool_calls:
        return "tools"
    return "end"


graph = StateGraph(State)

graph.add_node("query_resolver_agent", QueryResolverAgent)
graph.add_node("tools", ToolNode(all_tools))

graph.add_edge(START, "query_resolver_agent")
graph.add_conditional_edges(
    "query_resolver_agent", ShouldContinue, {"tools": "tools", "end": END}
)

graph.add_edge("tools", "query_resolver_agent")

workflow = graph.compile()



