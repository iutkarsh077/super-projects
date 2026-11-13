from langgraph.graph import START, END, StateGraph
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.types import interrupt, Command
from typing import TypedDict

class MyState(TypedDict):
    action: str
    approved: bool
    
    
graph = StateGraph(MyState)


def HumanApproval(state: MyState):
    """Take human approval"""
    print("In human approval function")
    user_answer = interrupt({
        "question": "Do you allow this purchase?"
    })
    return { "approved": user_answer == "yes" or user_answer == "y" or user_answer == "yeah" }

def ExecutePurchase(state: MyState):
    """Execute purchase"""
    print("Purchase the Gucci and one porshe 911 GT RS3")
    return { 
            "action": "Purchased"}
    

def shouldContinue(state: MyState):
    if state["approved"] == True:
        return "execute"
    return "cancel"
    
graph.add_node("human", HumanApproval)
graph.add_node("execute", ExecutePurchase)

graph.add_edge(START, "human")
graph.add_conditional_edges("human", shouldContinue, {
    "execute": "execute",
    "cancel": END
})
graph.add_edge("execute", END)

checkpointer = InMemorySaver()

config = { "configurable": { "thread_id": "1" } }

workflow = graph.compile(checkpointer=checkpointer)

result = workflow.invoke({"action": "", "approval": False}, config=config)

# print(result["__interrupt__"][0].value)

question = result["__interrupt__"][0].value

human_answer = input(question["question"])

ans = workflow.invoke(Command(resume=human_answer), config)

print(ans)