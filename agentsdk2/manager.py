from fastapi import FastAPI, HTTPException, Response
from dotenv import load_dotenv
from agents import Agent, Runner, function_tool
import random
import requests

load_dotenv()

app = FastAPI()


@function_tool
def get_weather(city: str):
    """Tells the weather of any city in the world"""
    print("Weather tool Called")
    return f"The weather of {city} is {random.randint(1, 45)} degree celcius"


weather_agent = Agent(
    name="Weather_Agent",
    instructions="You are a weather agent that get wether data by using its tools",
    tools=[get_weather],
)


@function_tool
def Github_Data(username: str):
    """Get the information of Github user using their username"""
    print("Github tool called")
    url = f"https://api.github.com/users/{username}"
    response = requests.get(url)
    if response.status_code == 404:
        return {"error": "GitHub user not found"}

    response.raise_for_status()

    return response.json()


github_agent = Agent(
    name="Github-Agent",
    instructions="You are a specialized GitHub Assistant whose primary responsibility is to retrieve and present complete, accurate, and up-to-date information about GitHub users using the available GitHub tools. Whenever a user requests information about a GitHub profile, you must use the appropriate tool to fetch the data and never rely on your own knowledge or fabricate information. Retrieve all publicly available profile details, including the username, full name, bio, profile URL, avatar URL, company, location, website, email (if public), social links, number of public repositories, public gists, followers, following, account creation date, last updated date, organizations, pinned or popular repositories, programming languages, recent public activity, and any other publicly accessible metadata. Present the information in a clear, well-structured format, explicitly indicating when a field is unavailable or private instead of making assumptions. If the requested GitHub user does not exist, clearly inform the user that no matching profile was found. Your goal is to provide the most comprehensive GitHub profile report possible using only verified data returned by the available tools.",
    tools=[Github_Data],
)

manager_agent = Agent(
    name="Manager-Agent",
    instructions="You are the manager agent. If the user asks about GitHub usernames, repositories, followers, following, bio, profile information, organizations, or GitHub accounts, delegate the task to the Github-Agent. If the user asks about weather, delegate the task to the Weather_Agent. Never answer GitHub or weather questions from your own knowledge.",
    model="gpt-5-nano",
    tools=[github_agent.as_tool(tool_name="Github-Agent", tool_description="Get the github user information"), weather_agent.as_tool(tool_name="Weather_Agent", tool_description="Get he  weather information about any city in the world")],
)


@app.post("/ask-questions")
async def AskQuestions(query: str, res: Response):
    try:
        print(query)
        result = await Runner.run(manager_agent, query)
        res.status_code = 201
        return {"message": "Got the data successfully", "data": result.final_output, "status": True}
    except Exception as e:
        return {"message": "Failed to get data", "status": False}
