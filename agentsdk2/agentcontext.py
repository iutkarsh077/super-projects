import json
from openai import OpenAI
from dotenv import load_dotenv

client = OpenAI()
MODEL = "gpt-4o-mini" 
MAX_STEPS = 8


TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "calculator",
            "description": "Evaluate a basic arithmetic expression, e.g. '12 * (3 + 4)'.",
            "parameters": {
                "type": "object",
                "properties": {"expression": {"type": "string"}},
                "required": ["expression"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "big_lookup",
            "description": (
                "Look up verbose raw data about a topic. Returns a large block of "
                "text, on purpose, so you can watch the context window grow."
            ),
            "parameters": {
                "type": "object",
                "properties": {"topic": {"type": "string"}},
                "required": ["topic"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "remember",
            "description": "Save one short fact to long-term memory (persists across runs).",
            "parameters": {
                "type": "object",
                "properties": {"fact": {"type": "string"}},
                "required": ["fact"],
            },
        },
    },
]

MEMORY_FILE = "agent_memory.json"


def run_tool(name: str, tool_input: dict) -> str:
    if name == "calculator":
        try:
            return str(eval(tool_input["expression"], {"__builtins__": {}}))
        except Exception as e:
            return f"error: {e}"

    if name == "big_lookup":
        topic = tool_input["topic"]
        return f"[verbose simulated data about '{topic}']\n" + ("lorem ipsum data row. " * 400)

    if name == "remember":
        fact = tool_input["fact"]
        try:
            with open(MEMORY_FILE, "r") as f:
                memory = json.load(f)
        except FileNotFoundError:
            memory = []
        memory.append(fact)
        with open(MEMORY_FILE, "w") as f:
            json.dump(memory, f, indent=2)
        return f"saved: {fact}"

    return f"unknown tool: {name}"


def load_long_term_memory() -> str:
    """Retrieval step: pull relevant long-term facts back into the window."""
    try:
        with open(MEMORY_FILE, "r") as f:
            memory = json.load(f)
        if not memory:
            return ""
        return "Known facts from previous sessions:\n" + "\n".join(f"- {m}" for m in memory)
    except FileNotFoundError:
        return ""


def maybe_compact(messages: list, threshold_chars: int = 6000) -> list:
    """
    EXERCISE: this is currently a no-op placeholder.
    Implement: if len(str(messages)) exceeds threshold_chars, call the model
    to summarize everything except the system message and last 2 turns, then
    replace `messages` with [system_message, summary_message] + last_2_turns.
    """
    size = sum(len(json.dumps(m)) for m in messages)
    print(f"    [context size: ~{size} chars across {len(messages)} messages]")
    return messages


def run_agent(user_message: str):
    system_prompt = (
        "You are a careful assistant with access to tools. "
        "Use tools when they help answer the question. "
        + load_long_term_memory()
    )

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_message},
    ]

    for step in range(MAX_STEPS):
        messages = maybe_compact(messages)

        response = client.chat.completions.create(
            model=MODEL,
            tools=TOOLS,
            messages=messages,
        )

        choice = response.choices[0]
        messages.append(choice.message.model_dump(exclude_none=True))

        if choice.finish_reason != "tool_calls":
            print(f"\nAgent: {choice.message.content}")
            return

        for call in choice.message.tool_calls:
            args = json.loads(call.function.arguments)
            print(f"  -> calling tool: {call.function.name}({args})")
            result = run_tool(call.function.name, args)
            messages.append({
                "role": "tool",
                "tool_call_id": call.id,
                "content": result,
            })

    print("\nAgent: hit max steps without finishing.")


if __name__ == "__main__":
    run_agent(
        "Look up 'rate limiting' and 'circuit breakers' with big_lookup, "
        "then remember that I prefer Python, then tell me what 7 * 8 is."
    )