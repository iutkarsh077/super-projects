from ollama import chat
from ollama import ChatResponse
from ollama import Client
from fastapi import FastAPI

app = FastAPI()

client = Client(
    host='http://localhost:11434',
)


@app.get("/health")
def HealthCheck():
    return {'status': True, 'message': 'Everything is fine'}


@app.post("/chat")
def ChatUser(msg: str):
    response = client.chat(model='gemma:2b', messages=[
        {"role": "user", "content": msg}
    ])
    print(response.message)
    return {'status': True, 'message': 'We got your message', "res": response.message.content}


