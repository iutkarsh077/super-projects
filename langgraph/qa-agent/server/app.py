from fastapi import FastAPI

app = FastAPI()

@app.get("/health")
def GetHealth():
    print("got a req")
    return {"data": "Health is good", "status": True}

