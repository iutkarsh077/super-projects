from langgraph.graph import START, END, StateGraph
from typing import TypedDict

class State(TypedDict):
    question: str
    answer: str

def Search(state):
    print("Current state is: ", state)
    return {
        "answer": "This is the second answer approach graph"
    }
    
graph = StateGraph(State)

graph.add_node("web_search", Search)

graph.add_edge(START, "web_search")
graph.add_edge("web_search", END)

app = graph.compile()

result = app.stream({
    "question": "Who is Elon musk"
})
