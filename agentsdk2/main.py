from fastapi import FastAPI, Response, HTTPException
from agents import Agent, Runner, function_tool
from dotenv import load_dotenv
import random
from pydantic import BaseModel

load_dotenv()
app = FastAPI()


class OutputFormat(BaseModel):
    id: int
    tempurature: str
    city_name: str
    text: str

@function_tool
def get_weather(city: str):
    """Tells the weather of any city in the world"""
    print("Weather tool Called")
    return f"The weather of {city} is {random.randint(1, 45)} degree celcius"

agent = Agent(name="AI Assistant", instructions="You are a weather assistant. Whenever the user asks anything about weather temperature, climate, rain, forecast, or conditions of any city, you MUST use the get_weather tool. Never answer weather questions from your own knowledge.", model="gpt-5-nano", tools=[get_weather], output_type=OutputFormat)

@app.get("/ask-question")
async def AskQuestions(question: str, res: Response):
    try:
        result = await Runner.run(agent, question)
        if(not result.final_output):
            raise HTTPException(status_code=500, detail="Failed to get LLM response")
        res.status_code = 201
        print(result)
        return { "message": "Got data successfully", "data": result.final_output }
    except Exception as e:
        print(e)
        return { "message": "Failed to get data", "status": False }