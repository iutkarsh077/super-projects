from langgraph.graph import START, END, StateGraph
from typing import TypedDict, Annotated
import operator


class State(TypedDict):
    messages: Annotated[list, operator.add]


def get_news(state: State):
    return {"messages": ["Today news is very good"]}


def get_weather(state: State):
    return {"messages": ["Delhi weather is 30 degree Celsius"]}


def get_cars(state: State):
    return {"messages": ["Porsche 911 GT RS3"]}


graph = StateGraph(State)

graph.add_node("news", get_news)
graph.add_node("weather", get_weather)
graph.add_node("cars", get_cars)

graph.add_edge(START, "news")
graph.add_edge(START, "cars")
graph.add_edge(START, "weather")

graph.add_edge("news", END)
graph.add_edge("cars", END)
graph.add_edge("weather", END)

workflow = graph.compile()


app = workflow.invoke({"messages": []})

print("Final result: ", app)
