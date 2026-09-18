from fastapi import FastAPI
from pydantic import BaseModel
from graph import workflow
from langgraph.types import Command
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = ["http://localhost:3000"]


class ChatRequest(BaseModel):
    message: str
    thread_id: str


class ResumeRequest(BaseModel):
    thread_id: str
    decision: str


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/chat")
def chat(request: ChatRequest):

    config = {"configurable": {"thread_id": request.thread_id}}

    result = workflow.invoke(
        {"messages": [{"role": "user", "content": request.message}]}, config=config
    )

    if "__interrupt__" in result:

        interrupt_data = result["__interrupt__"][0].value

        return {"status": "waiting_for_approval", "interrupt": interrupt_data}
    
    print(result["messages"][-1].content)

    return {"status": "completed", "message": result["messages"][-1].content}


@app.post("/resume")
def resume(request: ResumeRequest):

    config = {"configurable": {"thread_id": request.thread_id}}

    result = workflow.invoke(Command(resume=request.decision), config=config)

    if "__interrupt__" in result:

        interrupt_data = result["__interrupt__"][0].value

        return {"status": "waiting_for_approval", "interrupt": interrupt_data}

    return {"status": "completed", "message": result["messages"][-1].content}
