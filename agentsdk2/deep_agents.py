from deepagents import create_deep_agent
from dotenv import load_dotenv
from deepagents.backends import FilesystemBackend

load_dotenv()

agent = create_deep_agent(
    model="gpt-5.4-mini",
    tools=[],
    system_prompt="You are a careful research assistant.",
    backend=FilesystemBackend(root_dir="./projects", virtual_mode=True),
)

result = agent.invoke({
    "messages": [
        {
            "role": "user",
            "content": "Plan a 3-step study guide for LangGraph."
        }
    ]
})

output = result["messages"][-1].content

with open("study_guide.md", "w", encoding="utf-8") as file:
    file.write(output)

print("Output saved to study_guide.md")