from langgraph.graph import START, END, StateGraph
from langgraph.graph.message import add_messages
from typing import TypedDict, Annotated
from langchain_core.messages import AIMessage

class State(TypedDict):
    question: str
    answer: Annotated[list, add_messages]
    
def Search(state):
    return {
        "answer": [AIMessage(content="This is my answer")]
    }
    
graph = StateGraph(State)

graph.add_node("Web_Search", Search)

graph.add_edge(START, "Web_Search")
graph.add_edge("Web_Search", END)


workflow = graph.compile()

result = workflow.invoke({"question": "Why elon musk"})

print(result)