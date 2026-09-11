from langgraph.graph import START, END, StateGraph
from typing import TypedDict, Annotated
import operator
from langgraph.runtime import Runtime
from dataclasses import dataclass


class State(TypedDict):
    messages: Annotated[list, operator.add]


@dataclass
class Context:
    name: str
    username: str


def Story(state: State):
    return {"messages": ["I watched the story"]}


def Profile(state: State):
    return {"messages": ["Then i went to his profile"]}


graph = StateGraph(State, context_schema=Context)

graph.add_node("story", Story)
graph.add_node("profile", Profile)

graph.add_edge(START, "story")
graph.add_edge("story", "profile")
graph.add_edge("profile", END)

workflow = graph.compile()

result = workflow.invoke(
    {
        "messages": [],
    },
    context=Context(name="Utkarsh", username="maiutkarshoon")
)



for chunk in workflow.stream(
    {
            "messages": [],
    },
    context=Context(name="Utkarsh", username="maiutkarshoon"),
    stream_mode="values"
):
    print(chunk)
    
    

# print("Result is: ", result)