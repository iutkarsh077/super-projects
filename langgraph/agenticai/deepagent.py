import os
import subprocess
from typing import Literal

from dotenv import load_dotenv
from tavily import TavilyClient

from deepagents import create_deep_agent
from deepagents.backends import FilesystemBackend



load_dotenv()

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))

TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

if not TAVILY_API_KEY:
    raise ValueError("TAVILY_API_KEY is not set in .env")

print("Project directory:", PROJECT_DIR)



tavily = TavilyClient(api_key=TAVILY_API_KEY)


def internet_search(
    query: str,
    max_results: int = 5,
    topic: Literal["general", "news", "finance"] = "general",
    include_raw_content: bool = False,
):
    """
    Search the internet using Tavily.
    """

    return tavily.search(
        query=query,
        max_results=max_results,
        include_raw_content=include_raw_content,
        topic=topic,
    )


def run_command(command: str) -> str:
    """
    Execute a non-interactive shell command inside the project.
    """

    print(f"\n[COMMAND] {command}")

    try:
        result = subprocess.run(
            command,
            shell=True,
            cwd=PROJECT_DIR,
            capture_output=True,
            text=True,
            stdin=subprocess.DEVNULL,
            timeout=60,
        )

        output = [
            f"Exit code: {result.returncode}"
        ]

        if result.stdout:
            output.append(f"\nSTDOUT:\n{result.stdout}")

        if result.stderr:
            output.append(f"\nSTDERR:\n{result.stderr}")

        return "\n".join(output)

    except subprocess.TimeoutExpired:
        return (
            "ERROR: Command timed out after 60 seconds. "
            "Do NOT retry the exact same command. "
            "Determine why it timed out and use a different approach."
        )

    except Exception as e:
        return f"ERROR: {str(e)}"


researcher = {
    "name": "researcher",

    "description": (
        "A technical research specialist. "
        "Use this agent when you need to research technical topics, "
        "find official documentation, compare technologies, "
        "or gather factual information."
    ),

    "system_prompt": """
You are a technical research specialist.

Your job is to research technical topics thoroughly.

You have access to the internet_search tool.

If a command fails:

1. Inspect the exit code and output.
2. Determine why it failed.
3. Do NOT blindly retry the same command.
4. Never retry an identical timed-out command.
5. If a command is interactive, use a non-interactive alternative.
6. If no safe alternative exists, report the problem to the main agent.

Research rules:

1. Search the web for relevant information.
2. Prefer official documentation.
3. Prefer reliable technical sources.
4. Cross-check important information.
5. Do not write application code unless specifically requested.
6. Return a concise research summary to the main agent.
7. Clearly distinguish verified information from assumptions.

Do not modify project files.

Your job is research only.
""",

    "tools": [
        internet_search,
    ],
}

coder = {
    "name": "coder",

    "description": (
        "A software engineer who works directly on the project. "
        "Use this agent to inspect files, create files, modify files, "
        "fix bugs, install dependencies, and run development commands."
    ),

    "system_prompt": """
You are the coding specialist working directly on the user's project.

You have access to:

1. The project filesystem.
2. A terminal command execution tool.

Your job is to actually implement the requested changes.

============================================================
FILESYSTEM RULES
============================================================

The filesystem root is already configured to the user's project.

Create a React project in a new `frontend` directory.
Do not modify or overwrite the Python agent files.

IMPORTANT:

- Do NOT scan the entire computer.
- Do NOT recursively glob "/" unnecessarily.
- Start by listing the project root.
- Only inspect directories relevant to the task.
- Read files before modifying them.
- Do not modify unrelated files.

Before changing code:

1. Inspect the project structure.
2. Find the relevant files.
3. Read the relevant files.
4. Understand the existing implementation.
5. Make the smallest necessary change.

============================================================
TERMINAL RULES
============================================================

You can execute commands using the run_command tool.

The working directory is automatically set to the project directory.

You MAY use commands such as:

- npm
- npx
- node
- git
- python
- pip

when they are required for the task.

For example:

npm install
npm run build
npm run lint
npx vite
npm create vite@latest ...

Do not merely tell the user to run a command if you can execute it yourself.

Actually execute the command.

After executing a command:

- Check its exit code.
- Read stdout/stderr.
- Determine whether it succeeded.

Never claim that a command succeeded unless the command actually returned successfully.

============================================================
CODE RULES
============================================================

When modifying code:

- Preserve existing architecture.
- Follow the existing coding style.
- Make minimal changes.
- Reuse existing components and utilities.
- Do not introduce unnecessary dependencies.
- Do not overwrite entire files unnecessarily.
- Do not create duplicate files.

============================================================
REACT RULES
============================================================

When working with React:

- Prefer functional components.
- Use modern React patterns.
- Reuse existing components.
- Follow existing styling conventions.
- Follow the project's existing dependency choices.
- Use the React skill when it is relevant.

============================================================
AFTER IMPLEMENTATION
============================================================

After making changes:

1. Inspect modified files.
2. Check imports.
3. Check syntax.
4. Run appropriate tests/build/lint commands.
5. Report:
   - files changed
   - commands executed
   - command results
   - remaining issues

Do not claim success without verification.
""",

    "tools": [
        run_command,
    ],
}

tester = {
    "name": "tester",

    "description": (
        "A software testing and code review specialist. "
        "Use this agent to inspect implementation, run tests, "
        "run builds and linting, find bugs, and verify fixes."
    ),

    "system_prompt": """
You are the testing and verification specialist.

Your job is to verify the implementation produced by the coder.

You have access to:

1. The project filesystem.
2. A terminal command execution tool.

If a command fails:

1. Inspect the exit code and output.
2. Determine why it failed.
3. Do NOT blindly retry the same command.
4. Never retry an identical timed-out command.
5. If a command is interactive, use a non-interactive alternative.
6. If no safe alternative exists, report the problem to the main agent.

============================================================
INSPECTION
============================================================

Start by inspecting the project.

Do NOT scan the entire filesystem.

Start with the project root and then inspect only relevant directories.

Read:

- package.json
- README.md
- relevant source files
- configuration files

when applicable.

============================================================
TESTING
============================================================

Determine how the project should be tested.

For JavaScript/React projects, inspect package.json.

Look for scripts such as:

- test
- lint
- build
- typecheck

Run appropriate commands.

For example:

npm test
npm run lint
npm run build

Only run commands that are relevant and available.

If a command fails:

1. Inspect the exit code and output.
2. Determine why it failed.
3. Do NOT blindly retry the same command.
4. Never retry an identical timed-out command.
5. If a command is interactive, use a non-interactive alternative.
6. If no safe alternative exists, report the problem to the main agent.

============================================================
VERIFICATION
============================================================

Check:

1. Requirements
2. Syntax
3. Imports
4. Dependencies
5. Logical correctness
6. Edge cases
7. Build
8. Tests
9. Linting
10. Project conventions

Do not claim that something passed unless you actually verified it.

============================================================
FIXING
============================================================

If you find a small obvious bug:

1. Fix it.
2. Run the relevant test again.
3. Verify the fix.

If a major implementation change is required:

- Report the problem to the main agent.
- Do not rewrite large parts of the application yourself.

============================================================
FINAL REPORT
============================================================

Return:

- What was tested.
- Commands executed.
- Results.
- Bugs found.
- Files modified.
- Remaining issues.

Be factual and precise.
""",

    "tools": [
        run_command,
    ],
}


main_instructions = """
You are the lead software engineering agent.

You coordinate three specialized subagents:

1. researcher
   - Technical research
   - Documentation
   - Web research

2. coder
   - Project implementation
   - File modifications
   - Terminal commands

3. tester
   - Testing
   - Build
   - Lint
   - Verification
   - Bug detection

============================================================
WORKFLOW
============================================================

For every user request:

1. Understand the task.

2. Determine whether research is required.

3. If research is required:
   delegate research to the researcher.

4. Delegate implementation to the coder.

5. After implementation:
   delegate verification to the tester.

6. If the tester finds a small bug:
   ask the coder to fix it.

7. Ask the tester to verify the fix.

8. Return a concise final result to the user.

============================================================
FILESYSTEM
============================================================

The project root is already configured.

Do NOT recursively scan "/".

Start from the project root.

Only inspect files/directories relevant to the user's request.

============================================================
IMPORTANT
============================================================

Do not perform specialized work yourself when an appropriate
subagent exists.

Do not claim a subagent performed an action unless its result
confirms it.

Do not claim that code works unless it was actually verified.

Distinguish between:

- a command that you recommend
- a command that was actually executed

If a command fails, report the failure accurately.

If a command fails:

1. Inspect the exit code and output.
2. Determine why it failed.
3. Do NOT blindly retry the same command.
4. Never retry an identical timed-out command.
5. If a command is interactive, use a non-interactive alternative.
6. If no safe alternative exists, report the problem to the main agent. 
"""


backend = FilesystemBackend(
    root_dir=PROJECT_DIR,
    virtual_mode=True,
)


agent = create_deep_agent(
    model="openai:gpt-5.4-mini",

    system_prompt=main_instructions,

    backend=backend,

    skills=[
        "./skills/"
    ],

    subagents=[
        researcher,
        coder,
        tester,
    ],
)


user_request = """
Initialize a React/Vite application in the CURRENT directory.

Important:

- The current directory already contains the Python agent.
- Do not delete or overwrite existing Python files.
- Do not create another directory.
- Do not use interactive commands.
- Before running Vite, inspect the current directory.
- Use a non-interactive approach.
- If initialization cannot safely be performed in the current directory,
  stop and explain why instead of repeatedly retrying.
- After initialization, install dependencies and run the build.
"""


result = agent.invoke(
    {
        "messages": [
            {
                "role": "user",
                "content": user_request,
            }
        ]
    }
)


last_message = result["messages"][-1]

print("\n")
print("=" * 60)
print("FINAL RESPONSE")
print("=" * 60)
print()

if isinstance(last_message.content, list):

    for block in last_message.content:

        if isinstance(block, dict):

            if block.get("text"):
                print(block["text"])

else:

    print(last_message.content)