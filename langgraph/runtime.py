from langgraph.graph import START, END, StateGraph
from langgraph.runtime import Runtime
from typing import Annotated, TypedDict
import operator

from dataclasses import dataclass

class State(TypedDict):
    messages: Annotated[list, operator.add]

@dataclass 
class Context:
    user_id: str
    name: str
    
def GetUserDetails(state: State, runtime: Runtime[Context]):
    print("Runtime data is: ", runtime)
    return {
        "messages": [f"Nice to have you back {runtime.context.name}"]
    }
    
    
graph = StateGraph(State, context_schema=Context)

graph.add_node("user_details", GetUserDetails)

graph.add_edge(START, "user_details")
graph.add_edge("user_details", END)


workflow = graph.compile()

result = workflow.invoke(
    {"messages": []},
    context=Context(user_id="user-id123", name= "Utkarsh"))

print(result)

print(workflow.get_graph().draw_ascii())