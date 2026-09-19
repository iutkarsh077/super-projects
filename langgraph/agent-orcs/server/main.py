import os
import uuid

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from graph import workflow
from langgraph.types import Command
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from codinagent import (
    find_entry_html,
    list_workspace_files,
    run_coding,
    run_planning,
)

app = FastAPI()

origins = ["http://localhost:3000", "http://localhost:3004"]

GENERATED_DIR = os.path.join(os.path.dirname(__file__), "generated")
os.makedirs(GENERATED_DIR, exist_ok=True)

app.mount(
    "/preview",
    StaticFiles(directory=GENERATED_DIR, html=True),
    name="preview",
)


class ChatRequest(BaseModel):
    message: str
    thread_id: str


class ResumeRequest(BaseModel):
    thread_id: str
    decision: str


class BuildPlanRequest(BaseModel):
    query: str


class BuildImplementRequest(BaseModel):
    build_id: str
    query: str
    plan: str


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def workspace_for_build(build_id: str) -> str:
    safe_id = build_id.replace("\\", "").replace("/", "").replace("..", "")
    if safe_id != build_id:
        raise HTTPException(status_code=400, detail="Invalid build id")
    return os.path.join(GENERATED_DIR, safe_id)


@app.post("/api/build/plan")
def build_plan(request: BuildPlanRequest):
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query is required")

    build_id = str(uuid.uuid4())
    workspace = workspace_for_build(build_id)
    os.makedirs(workspace, exist_ok=True)

    plan = run_planning(request.query.strip(), workspace)

    return {"build_id": build_id, "plan": plan}


@app.post("/api/build/implement")
def build_implement(request: BuildImplementRequest):
    workspace = workspace_for_build(request.build_id)
    if not os.path.isdir(workspace):
        raise HTTPException(status_code=404, detail="Build not found")

    if not request.query.strip() or not request.plan.strip():
        raise HTTPException(status_code=400, detail="Query and plan are required")

    summary = run_coding(
        request.query.strip(), request.plan.strip(), workspace
    )

    entry = find_entry_html(workspace)
    preview_url = (
        f"/preview/{request.build_id}/{entry}" if entry else None
    )

    return {
        "build_id": request.build_id,
        "message": summary,
        "preview_url": preview_url,
        "files": list_workspace_files(workspace),
    }


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
