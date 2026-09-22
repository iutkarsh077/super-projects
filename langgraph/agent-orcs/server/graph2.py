from langgraph.graph import StateGraph, START, END
from dotenv import load_dotenv
from typing import TypedDict
from langgraph.types import RetryPolicy
from langgraph.checkpoint.memory import MemorySaver

load_dotenv()


class State(TypedDict):
    message: str


attempts = 0


def process(state: State):
    global attempts
    attempts += 1

    if attempts < 9:
        raise Exception("agent crashed in mid")

    return {"message": f"Processed the request after {attempts} attempts"}


checkpointer = MemorySaver()

config = {"configurable": {"thread_id": "761576hgj"}}
graph = StateGraph(State)

graph.add_node("process", process, retry_policy=RetryPolicy(max_attempts=9))

graph.add_edge(START, "process")
graph.add_edge("process", END)


workflow = graph.compile(checkpointer=checkpointer)

# result = workflow.invoke(
#     {"message": "Hello"},
#     config
# )

for chunk in workflow.stream(
    {"message": "Hello"}, config=config
):
    print("chunk is: ", chunk)
