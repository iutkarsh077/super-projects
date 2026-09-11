from typing import TypedDict
from langgraph.graph import START, END, StateGraph
from langgraph.types import interrupt, Command
from langgraph.checkpoint.memory import InMemorySaver


class State(TypedDict):
    amount: str
    approval: bool


def ApprovalNode(state: State):
    price = state["amount"]

    decision = interrupt(f"Approve request for amont {price} Rs.?")

    if decision.lower() == "yes":
        return {"approval": True}

    return {"approval": False}


def execute_node(state: State):

    if state["approval"]:
        print("\n✅ Expense approved and processed.")
    else:
        print("\n❌ Expense rejected.")

    return {}


graph = StateGraph(State)

graph.add_node("approval", ApprovalNode)
graph.add_node("execute", execute_node)

graph.add_edge(START, "approval")
graph.add_edge("approval", "execute")
graph.add_edge("execute", END)

checkpointer = InMemorySaver()

app = graph.compile(checkpointer=checkpointer)

config = {
    "configurable": {
        "thread_id": "expense-001"
    }
}


result = app.invoke({
    "approval": False,
    "amount": "700000"
}, config=config)


human_input = input("\nEnter your decision (yes/no): ")

result = app.invoke(
    Command(resume=human_input),
    config
)

print("\nFinal State:")
print(result)