from openai import OpenAI
import json
from dotenv import load_dotenv

load_dotenv()

client = OpenAI()


messages = [{"role": "user", "content": "What is the tempurtaure in london?"}]


def get_tempurature(city: str):
    """It gets the tempurature of a city"""
    fake_data = {"london": 45, "delhi": 32, "new york": 23}
    return fake_data.get(city.lower())


tools = [
    {
        "type": "function",
        "name": "get_tempurature",
        "description": "Get the tempurature of the city",
        "parameters": {
            "type": "object",
            "properties": {"city": {"type": "string"}},
            "required": ["city"],
        },
    }
]

response = client.responses.create(model="gpt-5.4-mini", input=messages, tools=tools)

print(response.output)

for item in response.output:
    if item.type == "function_call" and item.name == "get_tempurature":
        args = json.loads(item.arguments)
        result = get_tempurature(args["city"])
        messages += response.output
        messages.append(
            {
                "type": "function_call_output",
                "call_id": item.call_id,
                "output": str(result),
            }
        )
        response = client.responses.create(model="gpt-5.4-mini", input=messages, tools=tools)


print(response.output_text)