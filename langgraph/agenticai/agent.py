import os
from typing import Literal

from dotenv import load_dotenv
from tavily import TavilyClient
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.types import Command
from langchain.tools import tool
from deepagents import create_deep_agent
from deepagents.backends import FilesystemBackend

checkpointer = InMemorySaver()


load_dotenv()

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))

TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

if not TAVILY_API_KEY:
    raise ValueError("TAVILY_API_KEY is not set in .env")


tavily = TavilyClient(api_key=TAVILY_API_KEY)

def internet_search(
    query: str,
    max_results: int = 5,
    topic: Literal["general", "news", "finance"] = "general",
    include_raw_content: bool = False,
):
    """
    Search the internet using Tavily.
    """

    return tavily.search(
        query=query,
        max_results=max_results,
        include_raw_content=include_raw_content,
        topic=topic,
    )

@tool
def addition(a: int, b: int) -> int:
    """
    Add two numbers.
    """
    return a + b

agent = create_deep_agent(
    model="openai:gpt-5.4-mini",
    tools=[
        internet_search,
        addition
    ],
    system_prompt="""
    You are a helpful assistant.
    """,
    backend=FilesystemBackend(
        root_dir=PROJECT_DIR,
        virtual_mode=True,
    ),
    checkpointer=checkpointer,
    interrupt_on={
        "internet_search": True,
    }
)

config = {
        "configurable": {
            "thread_id": "1"
        }
    }

result = agent.stream(
    {
        "messages": [
            {
                "role": "user",
                "content": "Tell me the current weather of New York and then write that weather in a text file and after that tell me the addition of 56 and 456"
            }
        ]
    },
    config,
    stream_mode="values",
)


for chunk in result:
    print(chunk)

state = agent.get_state(config)

# print(state)
if state.interrupts:

    human_approval = input("Do you want to continue? (yes/no): ")
    if human_approval.lower() == "no":
        decision = {
            "decisions": [
                {
                    "type": "reject",
                    "message": (
                        "The user rejected the internet_search "
                        "tool call. Do not continue."
                    ),
                }
            ]
        }
    else:
        decision = {
            "decisions": [
                {
                    "type": "approve",
                }
            ]
        }

    result = agent.stream(
        Command(resume=decision),
        config=config,
        stream_mode="values",
    )

    for chunk in result:
        print(chunk)


print("\n================================")
print("FINISHED")
print("================================")