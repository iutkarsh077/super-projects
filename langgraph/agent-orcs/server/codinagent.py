from langgraph.graph import START, END, StateGraph
from typing import TypedDict, Annotated
from dotenv import load_dotenv
import operator
import os
from contextvars import ContextVar

from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from langgraph.prebuilt import ToolNode

load_dotenv()

workspace_ctx: ContextVar[str] = ContextVar("workspace", default=os.getcwd())


class State(TypedDict):
    messages: Annotated[list, operator.add]


llm = ChatOpenAI(model="gpt-5.4-mini")

HTML_CSS_JS_STACK = """
TECH STACK (mandatory for every project):
- Always build a static web app using HTML, CSS, and JavaScript only.
- Do NOT use React, Vue, Angular, Next.js, build tools, or backend/server code unless the user explicitly overrides this (they will not).
- Use plain .html, .css, and .js files (organize CSS/JS in folders like css/ and js/ when helpful).
- Load third-party libraries from a CDN in index.html when needed (e.g. marked.js, chart.js).
- The app must open in a browser via index.html with no compile step.
"""


def _resolve_path(path: str) -> str:
    if not path:
        return workspace_ctx.get()
    normalized = path.replace("\\", "/")
    if os.path.isabs(normalized):
        return os.path.normpath(normalized)
    return os.path.normpath(os.path.join(workspace_ctx.get(), normalized))


def CreateDirectory(directoryName):
    target = _resolve_path(directoryName)
    os.makedirs(target, exist_ok=True)
    return f"Created directory: {target}"


def CreateFile(directoryName, fileName):
    directory = _resolve_path(directoryName)
    os.makedirs(directory, exist_ok=True)
    filePath = os.path.join(directory, fileName)
    with open(filePath, "w", encoding="utf-8") as f:
        pass
    return f"Created file: {filePath}"


def ReadFile(filePath):
    target = _resolve_path(filePath)
    with open(target, "rt", encoding="utf-8") as file:
        return file.read()


def WriteFile(filePath, data):
    target = _resolve_path(filePath)
    directory = os.path.dirname(target)
    if directory:
        os.makedirs(directory, exist_ok=True)
    with open(target, "w", encoding="utf-8") as file:
        file.write(data)
    return f"File written successfully: {target}"


def GetCurrentDirectory():
    return workspace_ctx.get()


@tool
def CreateDirectoryTool(directoryName: str):
    """Create a new directory."""
    return CreateDirectory(directoryName)


@tool
def CreateFileTool(directoryName: str, fileName: str):
    """Create a new file inside a directory."""
    return CreateFile(directoryName, fileName)


@tool
def ReadFileTool(filePath: str):
    """Read the contents of a file."""
    return ReadFile(filePath)


@tool
def WriteFileTool(filePath: str, data: str):
    """Write or overwrite data inside a file."""
    return WriteFile(filePath, data)


@tool
def GetCurrentDirectoryTool():
    """Get the current working directory."""
    return GetCurrentDirectory()


all_tools = [
    CreateDirectoryTool,
    CreateFileTool,
    ReadFileTool,
    WriteFileTool,
    GetCurrentDirectoryTool,
]

planningLLM = llm.bind_tools(all_tools)


def PlanningAgent(state: State):
    response = planningLLM.invoke(
        [
            {
                "role": "system",
                "content": """
You are a software planning agent.

Your job is to understand the user's software requirement
and create a detailed implementation plan.

You should decide:

1. Project structure
2. Required folders
3. Required files
4. Technologies to use
5. What each file should contain
6. Implementation steps

{HTML_CSS_JS_STACK}

IMPORTANT:
You are ONLY responsible for creating the plan.

Do NOT implement the project.
Do NOT write code into files.
Always plan for HTML, CSS, and JavaScript only—never another stack.
""".format(HTML_CSS_JS_STACK=HTML_CSS_JS_STACK),
            },
            *state["messages"],
        ]
    )
    return {"messages": [response]}


def ShouldPlanningContinue(state: State):
    last_message = state["messages"][-1]
    if last_message.tool_calls:
        return "tools"
    return "end"


planningGraph = StateGraph(State)
planningGraph.add_node("planningAgent", PlanningAgent)
planningGraph.add_node("planningTools", ToolNode(all_tools))
planningGraph.add_edge(START, "planningAgent")
planningGraph.add_conditional_edges(
    "planningAgent", ShouldPlanningContinue, {"tools": "planningTools", "end": END}
)
planningGraph.add_edge("planningTools", "planningAgent")
planningWorkflow = planningGraph.compile()

codingLLM = llm.bind_tools(all_tools)


def CodingAgent(state: State):
    response = codingLLM.invoke(
        [
            {
                "role": "system",
                "content": """
You are an autonomous coding agent.

You will receive a software implementation plan.

Your job is to IMPLEMENT the plan.

You MUST actually modify the filesystem.

Follow these steps:

1. Understand the implementation plan.
2. Check the current working directory.
3. Create required directories.
4. Create required files.
5. Write the actual code into the files.
6. Read files when necessary.
7. Make sure the implementation matches the plan.

IMPORTANT:

- Do NOT just explain the code.
- Do NOT return code only in your response.
- You MUST use the filesystem tools.
- Create the files and write the code into them.
- If a file already exists, read it before modifying it.
- Put the main entry file at index.html in the workspace root.
- Use relative paths only; stay inside the current working directory.

{HTML_CSS_JS_STACK}

You MUST implement using HTML, CSS, and JavaScript files only. Never create package.json, frameworks, or server code.
""".format(HTML_CSS_JS_STACK=HTML_CSS_JS_STACK),
            },
            *state["messages"],
        ]
    )
    return {"messages": [response]}


def ShouldCodingContinue(state: State):
    last_message = state["messages"][-1]
    if last_message.tool_calls:
        return "tools"
    return "end"


codingGraph = StateGraph(State)
codingGraph.add_node("codingAgent", CodingAgent)
codingGraph.add_node("codingTools", ToolNode(all_tools))
codingGraph.add_edge(START, "codingAgent")
codingGraph.add_conditional_edges(
    "codingAgent", ShouldCodingContinue, {"tools": "codingTools", "end": END}
)
codingGraph.add_edge("codingTools", "codingAgent")
codingWorkflow = codingGraph.compile()


def _set_workspace(workspace: str):
    return workspace_ctx.set(os.path.abspath(workspace))


def run_planning(user_query: str, workspace: str) -> str:
    token = _set_workspace(workspace)
    try:
        planning_result = planningWorkflow.invoke(
            {
                "messages": [
                    {
                        "role": "user",
                        "content": f"{user_query.strip()}\n\n{HTML_CSS_JS_STACK}",
                    }
                ]
            }
        )
        return planning_result["messages"][-1].content or ""
    finally:
        workspace_ctx.reset(token)


def run_coding(user_query: str, plan: str, workspace: str) -> str:
    token = _set_workspace(workspace)
    try:
        coding_result = codingWorkflow.invoke(
            {
                "messages": [
                    {
                        "role": "user",
                        "content": f"""
The user requested:

{user_query}

The planning agent created the following implementation plan:

================ PLAN ================

{plan}

========================================

Now implement this plan.

Actually create the folders and files
and write the complete code into them.

{HTML_CSS_JS_STACK}
""",
                    }
                ]
            }
        )
        return coding_result["messages"][-1].content or ""
    finally:
        workspace_ctx.reset(token)


def find_entry_html(workspace: str) -> str | None:
    workspace = os.path.abspath(workspace)
    preferred = os.path.join(workspace, "index.html")
    if os.path.isfile(preferred):
        return "index.html"

    for root, _, files in os.walk(workspace):
        if "index.html" in files:
            full = os.path.join(root, "index.html")
            rel = os.path.relpath(full, workspace).replace("\\", "/")
            return rel
    return None


def list_workspace_files(workspace: str) -> list[str]:
    workspace = os.path.abspath(workspace)
    paths: list[str] = []
    for root, _, files in os.walk(workspace):
        for name in files:
            full = os.path.join(root, name)
            rel = os.path.relpath(full, workspace).replace("\\", "/")
            paths.append(rel)
    return sorted(paths)


if __name__ == "__main__":
    demo_query = """
Create a markdown editor using HTML, CSS and JavaScript.

The app should have live preview, toolbar, localStorage autosave, and a clean UI.
Use marked.js from a CDN. Create an appropriate file and folder structure.
"""
    demo_workspace = os.path.join(os.getcwd(), "_demo_build")
    os.makedirs(demo_workspace, exist_ok=True)
    plan = run_planning(demo_query, demo_workspace)
    print("\n================ PLAN ================\n")
    print(plan)
    summary = run_coding(demo_query, plan, demo_workspace)
    print("\n================ CODING AGENT ================\n")
    print(summary)
