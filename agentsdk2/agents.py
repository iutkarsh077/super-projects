
from langgraph.graph import START, END, StateGraph
from typing import Annotated
from typing_extensions import TypedDict
from langchain_core.messages import AnyMessage, HumanMessage, AIMessage
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode, tools_condition
from dotenv import load_dotenv
import os

load_dotenv()


class MyState(TypedDict):
    messages: Annotated[list[AnyMessage], add_messages]


client = ChatOpenAI(
    model="gpt-5.4-mini",
    api_key=os.getenv("OPENAI_API_KEY")
)


@tool
def addition(a: int, b: int) -> int:
    """Add two numbers."""
    return a + b


@tool
def subtract(a: int, b: int) -> int:
    """Subtract the second number from the first."""
    return a - b


@tool
def multiply(a: int, b: int) -> int:
    """Multiply two numbers."""
    return a * b


all_tools = [addition, subtract, multiply]


llm_with_tools = client.bind_tools(all_tools)


def chatbot(state: MyState):
    response = llm_with_tools.invoke(state["messages"])
    return {"messages": [response]}


def shouldContinue(state: MyState):
    last_message = state["messages"][-1]

    if isinstance(last_message, AIMessage) and last_message.tool_calls:
        return "tools"

    return END

builder = StateGraph(MyState)

builder.add_node("chatbot", chatbot)
builder.add_node("tools", ToolNode(all_tools))

builder.add_edge(START, "chatbot")

builder.add_conditional_edges(
    "chatbot",
    shouldContinue,
    {
        "tools": "tools",
        END: END
    }
)

builder.add_edge("tools", "chatbot")


workflow = builder.compile()


result = workflow.invoke({
    "messages": [
        HumanMessage(content="Multiply 3 and 5")
    ]
})

print(result["messages"][-1].content)
