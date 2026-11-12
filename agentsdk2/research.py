from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langgraph.graph import START, END, StateGraph
from typing_extensions import TypedDict
from typing import Annotated, List
from langchain_core.messages import AnyMessage, HumanMessage, AIMessage
from langgraph.graph.message import add_messages
from tavily import TavilyClient
from langchain_core.tools import tool
from langgraph.prebuilt import ToolNode

import os

load_dotenv()

client = ChatOpenAI(
    model="gpt-5.4-mini", temperature=0.6, api_key=os.getenv("OPENAI_API_KEY")
)
tavily_client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))


class MyState(TypedDict):
    messages: Annotated[List[AnyMessage], add_messages]


@tool
def Internet_Search(query: str):
    """It do web search on the internet"""
    answers = tavily_client.search(query)
    return answers


all_tools = [Internet_Search]
llm_with_tools = client.bind_tools(all_tools)


def shouldContinue(state: MyState):
    last_message = state["messages"][-1]

    if isinstance(last_message, AIMessage) and last_message.tool_calls:
        return "tools"

    return END


def ResearchAgent(state: MyState):
    response = llm_with_tools.invoke(state["messages"])
    return {"messages": [response]}


builder = StateGraph(MyState)

builder.add_node("research_agent", ResearchAgent)
builder.add_node("tools", ToolNode(all_tools))


builder.add_edge(START, "research_agent")

builder.add_conditional_edges(
    "research_agent",
    shouldContinue,
    {
        "tools": "tools",
        END: END
    }
)

builder.add_edge("tools", "research_agent")

workflow = builder.compile()

result = workflow.invoke({
    "messages": [
        HumanMessage(content="Can you research about text are converted into tokens and evaluated in Chatgpt?")
    ]
})

print(result["messages"][-1].content)