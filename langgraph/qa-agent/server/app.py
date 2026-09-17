from fastapi import FastAPI
from graph import workflow
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from langchain_core.documents import Document
from helpers import vectorstore


class QueryRequest(BaseModel):
    question: str
    chatSessionId: str
    userId: str
    email: str


app = FastAPI()


@app.get("/health")
def GetHealth():
    print("got a req")
    return {"data": "Health is good", "status": True}


@app.post("/query")
async def ResolveUserQuery(payload: QueryRequest):
    session_filter = {
        "$or": [
            {"chatSessionId": payload.chatSessionId},
            {"userId": payload.userId},
        ]
    }
    
    print("user id: ", payload)
    dataFromDB = vectorstore.similarity_search(
        payload.question,
        k=3,
        filter=session_filter,
    )

    print("data from db is: ", dataFromDB)

    docs = {"source": "related data from vector db", "queryRelatedInfo": []}

    for doc in dataFromDB:
        docs["queryRelatedInfo"].append(doc.page_content)

    print("\nRelated data is: ", docs, "\n\n")

    result = await workflow.ainvoke({"messages": [str(payload.question), str(docs["queryRelatedInfo"])]})

    finalAnswer = result["messages"][-1].content

    documents = [
        Document(
            page_content=finalAnswer,
            metadata={
                "chatSessionId": payload.chatSessionId,
                "userId": payload.userId,
                "email": payload.email,
            },
        )
    ]

    vectorstore.add_documents(documents)

    return JSONResponse(status_code=201, content=result["messages"][-1].content)
