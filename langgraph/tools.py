from langgraph.graph import START, END, StateGraph, add_messages
from typing import Annotated, TypedDict
from langchain_core.messages import HumanMessage, AIMessage
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from langgraph.prebuilt import ToolNode
from dotenv import load_dotenv

load_dotenv()


class State(TypedDict):
    messages: Annotated[list, add_messages]
    
    
llm = ChatOpenAI(model="gpt-5.4-mini")

@tool
def Weathertool(question: str) -> str:
    """A tool to answer weather questions."""
    return "Weather of Delhi is 45 celcius"



tools = [Weathertool]

llm_with_Tools = llm.bind_tools(tools)


def AgentCall(state):
    msg = state["messages"]
    print("Message is: ", msg, "\n")
    response = llm_with_Tools.invoke(msg)
    return {
        "messages": [response]
    }    


def should_continue(state: State):
    last_message = state["messages"][-1]
    print("Last message is: ", last_message, "\n")
    
    if last_message.tool_calls:
        return "tools"
    
    return "end"

graph = StateGraph(State)

graph.add_node("weather_agent", AgentCall)

graph.add_node("tools", ToolNode(tools))

graph.add_edge(START, "weather_agent")

graph.add_conditional_edges("weather_agent", should_continue, {
    "tools": "tools",
    "end": END
})

graph.add_edge("tools", "weather_agent")

app = graph.compile()

result = app.stream({
    "messages": [
        {
            "role": "user",
            "content": "What is the weather of delhi?"
        }
    ]
})


for data in result:
    print(data)