from dotenv import load_dotenv
import json
import os
from langchain_openai import ChatOpenAI
from langchain.messages import SystemMessage, AIMessage, HumanMessage
from pydantic import BaseModel, Field

load_dotenv()

messages = [
    SystemMessage("You are a Python tutor."),
    HumanMessage("What is a list?"),
    AIMessage("A list stores multiple values."),
    HumanMessage("Give me an example.")
]

class Place(BaseModel):
    name: str = Field(description="Name of the place")
    location: str = Field(description="Location of the place")
    built_by: str
    age: int


client = ChatOpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    temperature=0.7,
    max_completion_tokens=800,
    max_retries=2,
    model="gpt-5.4-mini",
)

messages = []
while True:
    user_input = input("Ask your query: ")
    # messages.append({
    #     "role": "user",
    #     "content": user_input,
    # })
    structured_output = client.with_structured_output(Place)
    result = structured_output.invoke(user_input)
    # messages.append({
    #         "role": "assistant",
    #         "content": result.content
    #     })
    print(result)