from fastapi import FastAPI, Response, HTTPException
from agents import Agent, Runner
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()

agent = Agent(name="AI Assistant", instructions="You are a helpful AI assistant, that answer user query by using tools")

@app.get("/ask-question")
def AskQuestions(question: str, res: Response):
    try:
        result = Runner.run_sync(agent, question)
        if(not result.final_output):
            raise HTTPException(status_code=500, detail="Failed to get LLM response")
        res.status_code = 201
        return { "message": "Got data successfully", "data": result.final_output }
    except Exception as e:
        print(e)
        return { "message": "Failed to get data", "status": False }