from dotenv import load_dotenv
import json
import os
from langchain_openai import ChatOpenAI
from langchain.messages import SystemMessage, AIMessage, HumanMessage
from pydantic import BaseModel, Field
from langchain_core.tools import tool
from langchain.agents import create_agent, AgentState

load_dotenv()


client = ChatOpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    temperature=0.7,
    max_completion_tokens=800,
    max_retries=2,
    model="gpt-5.4-mini",
)


@tool
def add(a: int, b: int) -> int:
    """Add two numbers."""
    return a + b


@tool
def subtract(a: int, b: int) -> int:
    """Subtract two numbers."""
    return a - b


@tool
def multiply(a: int, b: int) -> int:
    """Multiply two numbers."""
    return a * b


class MyState(BaseModel):
    answer: int = Field(description="Calculation result")
    tool_name: str = Field(description="Name of the tool used")


agent = create_agent(
    model=client,
    tools=[add, subtract, multiply],
    system_prompt="""
    You are a calculator assistant.

    1. Always use the appropriate tool for calculations.
    2. Do not calculate manually.
    3. Return the final result using the required structured format.
    """,
    response_format=MyState
)

result = agent.invoke({
    "messages": [
        {"role": "user", "content": "Multiply 3 and 6"}
    ]
})

print(result["structured_response"])