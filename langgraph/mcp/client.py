import asyncio
import sys

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

from langchain_mcp_adapters.tools import load_mcp_tools

from langchain_openai import ChatOpenAI
from langchain.agents import create_agent
from dotenv import load_dotenv

load_dotenv()


async def main():

    server = StdioServerParameters(
        command=sys.executable,
        args=["server.py"],
    )

    # Connect to MCP server
    async with stdio_client(server) as (read, write):

        async with ClientSession(read, write) as session:

        
            await session.initialize()

            tools = await load_mcp_tools(session)

            print("Loaded tools:")

            for tool in tools:
                print(tool.name)

            model = ChatOpenAI(
                model="gpt-5.4-mini"
            )

            agent = create_agent(
                model=model,
                tools=tools,
            )

            response = await agent.ainvoke(
                {
                    "messages": [
                        {
                            "role": "user",
                            "content": (
                                "Read hello.txt and "
                                "tell me what it says."
                            ),
                        }
                    ]
                }
            )

            print("\nAgent:")
            print(response["messages"][-1].content)


asyncio.run(main())