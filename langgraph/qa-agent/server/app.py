from fastapi import FastAPI
from graph import workflow
from fastapi.responses import JSONResponse
from pydantic import BaseModel

class QueryRequest(BaseModel):
    question: str

app = FastAPI()


@app.get("/health")
def GetHealth():
    print("got a req")
    return {"data": "Health is good", "status": True}


@app.post("/query")
async def ResolveUserQuery(payload: QueryRequest):
    print("User query is: ", payload.question)
    result = await workflow.ainvoke(
        {
            "messages": [
                str(payload.question)
            ]
        }
    )
    
    print("\nFinal result is: ", result["messages"][-1].content, "\n")
    return JSONResponse(
        status_code=201,
        content=result["messages"][-1].content
    )
