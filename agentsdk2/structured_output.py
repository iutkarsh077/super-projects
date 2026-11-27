from openai import OpenAI
from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv()

client = OpenAI()


class CalenderEvent(BaseModel):
    name: str
    date: str
    participants: list[str]


response = client.chat.completions.parse(
    model="gpt-5.4-mini",
    messages=[
        {"role": "system", "content": "Extract the event information."},
        {"role": "user", "content": "Utkarsh and Bob are going to a science fair"},
    ],
    response_format=CalenderEvent,
)


event = response.choices[0].message.parsed
print(event)


res2 = client.chat.completions.create(
    model="gpt-5.4-mini",
    messages=[
        {"role": "user", "content": "Say hello and explain tool use in 3 sentences."}
    ],
    stream=True,
)


for chunk in res2:
    content = chunk.choices[0].delta.content
    if content:
        print(content, end="", flush=True)
