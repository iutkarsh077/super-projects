from langgraph.graph import StateGraph, MessagesState, START, END

def mock_llm(state: MessagesState):
    return {"message": [{ "role": "assistant", "content": "This is a mock response." }]}

graph = StateGraph(MessagesState)

graph.add_node(mock_llm)
graph.add_edge(START, "mock_llm")
graph.add_edge("mock_llm", END)

graph = graph.compile()

graph.invoke({"messages": [{ "role": "user", "content": "Hello, how are you?" }]})
# print(MessagesState.get_messages(graph.state))