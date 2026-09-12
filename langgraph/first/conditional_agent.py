from langgraph.graph import StateGraph, MessagesState, START, END
from openai import OpenAI
from typing import TypedDict, Literal
from dotenv import load_dotenv

load_dotenv()

openai = OpenAI()

class State(TypedDict):
    user_query: str
    output: str
    isValid: bool

def chatbot(state: State):
    print("state in chatbot_openai: ", state)
    llm = openai.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {"role": "user", "content": state.get("user_query")}
        ]
    )
    
    state["output"] = llm.choices[0].message.content
    return state

def evaluate_response(state: State) -> Literal["end_node", "gemini_chatbot"]:
    print("state in evaluate_response: ", state)
    if(len(state["output"]) > 100):
        return "end_node"
    return "gemini_chatbot"

def gemini_chatbot(state: State):
    print("state in gemini_chatbot: ", state)
    llm = openai.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {"role": "user", "content": f"Is it correct {state.get("output")}"}
        ]
    )
    
    state["output"] = llm.choices[0].message.content
    return state

def endNode(state):
    return state

graph_builder = StateGraph(State)
graph_builder.add_node("chatbot_openai", chatbot)
graph_builder.add_node("gemini_chatbot", gemini_chatbot)
graph_builder.add_node("evaluate_response", evaluate_response)
graph_builder.add_node("end_node", endNode)

graph_builder.add_edge(START, "chatbot_openai")
graph_builder.add_conditional_edges("chatbot_openai", evaluate_response)
graph_builder.add_edge("gemini_chatbot", "end_node")
graph_builder.add_edge("end_node", END)

graph = graph_builder.compile()

result = graph.invoke(State({"user_query": "Do Hitler really started world war 2?"}))
print(result)