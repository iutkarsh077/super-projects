from calendar import c
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from typing import TypedDict, Annotated
from langchain_tavily import TavilySearch
from langchain_core.tools import tool
from langchain_core.messages import BaseMessage
from langgraph.prebuilt import ToolNode
import os
import asyncio
from pymongo import MongoClient
from langgraph.checkpoint.mongodb import MongoDBSaver
from langgraph.types import Interrupt, Command, interrupt

load_dotenv()

client = MongoClient(os.getenv("MONGODB_URI"))



llm = ChatOpenAI(model="gpt-5.4-mini", temperature=0)

tavily = TavilySearch(
    max_results=5,
    topic="general",
    api_key=os.getenv("TAVILY_API_KEY"),
)


class State(TypedDict):
    query: str
    messages: Annotated[list[BaseMessage], add_messages]
    approval: bool


@tool
def WebSearchTool(query: str) -> str:
    """Search the web for information."""
    return str(tavily.invoke(query))


all_tools = [WebSearchTool]
llm_with_tools = llm.bind_tools(all_tools)


def ElaborateQuery(state: State):
    """Generate a response or request a tool."""
    result = llm_with_tools.invoke(state["messages"])
    return {"messages": [result]}


def ApproveAnswer(state: State):
    """Approve a sufficiently detailed answer."""
    last_message = state["messages"][-1]
    decision = interrupt({
        "question": "Is the answer sufficiently detailed?",
        "answer": last_message.content
    })

    print("Interrupt: ", decision)

    return {"approval": decision["approved"]}


graph = StateGraph(State)

graph.add_node("ElaborateQuery", ElaborateQuery)
graph.add_node("tools", ToolNode(all_tools))
graph.add_node("ApproveAnswer", ApproveAnswer)

graph.add_edge(START, "ElaborateQuery")

graph.add_edge(
    "ElaborateQuery",
    "tools"
)

graph.add_edge("tools", "ApproveAnswer")

graph.add_conditional_edges(
    "ApproveAnswer",
    lambda state: state["approval"],
    {
        True: END,
        False: "ElaborateQuery",
    },
)

checkpointer = MongoDBSaver(client, db_name="long_running_agents", collection_name="checkpoints")

workflow = graph.compile(checkpointer=checkpointer)


config = {
    "configurable": {
        "thread_id": "1"
    }
}

async def main():
    result = await workflow.ainvoke(
        {
            "query": "What is the capital of France?",
            "messages": [
                {
                    "role": "user",
                    "content": "What is the capital of France?",
                }
            ],
            "approval": False,
        },
        config=config,
    )

    while result.get("__interrupt__"):
        for interrupt_data in result["__interrupt__"]:
            print(interrupt_data.value)

            human_input = input("Approve? (yes/no): ").strip().lower()
            decision = human_input == "yes"

            result = await workflow.ainvoke(
                Command(resume={"approved": decision}),
                config=config,
            )

    print("Final answer:")
    print(result["messages"][-1].content)


asyncio.run(main())
