from langgraph.graph import START, END, StateGraph
from typing import TypedDict, Annotated
from dotenv import load_dotenv
import operator
import os

from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from langgraph.prebuilt import ToolNode

load_dotenv()


class State(TypedDict):
    messages: Annotated[list, operator.add]


llm = ChatOpenAI(model="gpt-5.4-mini")


def CreateDirectory(directoryName):
    os.makedirs(directoryName, exist_ok=True)
    return f"Created directory: {directoryName}"


def CreateFile(directoryName, fileName):
    os.makedirs(directoryName, exist_ok=True)

    filePath = os.path.join(directoryName, fileName)

    with open(filePath, "w", encoding="utf-8") as f:
        pass

    return f"Created file: {filePath}"


def ReadFile(filePath):
    with open(filePath, "rt", encoding="utf-8") as file:
        return file.read()


def WriteFile(filePath, data):
    directory = os.path.dirname(filePath)

    if directory:
        os.makedirs(directory, exist_ok=True)

    with open(filePath, "w", encoding="utf-8") as file:
        file.write(data)

    return f"File written successfully: {filePath}"


def GetCurrentDirectory():
    return os.getcwd()


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

IMPORTANT:
You are ONLY responsible for creating the plan.

Do NOT implement the project.
Do NOT write code into files.
""",
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
""",
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


user_query = """
Create a todo app using HTML, CSS and JavaScript.

The app should have:

- Add todo
- Delete todo
- Mark todo as completed
- Display all todos
- Clean UI

Create an appropriate file and folder structure.
"""


planningResult = planningWorkflow.invoke(
    {"messages": [{"role": "user", "content": user_query}]}
)


plan = planningResult["messages"][-1].content


print("\n================ PLAN ================\n")
print(plan)


codingResult = codingWorkflow.invoke(
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
""",
            }
        ]
    }
)


print("\n================ CODING AGENT ================\n")
print(codingResult["messages"][-1].content)
