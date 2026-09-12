from dotenv import load_dotenv
import os
from langchain_openai import ChatOpenAI
from langchain_neo4j import GraphCypherQAChain, Neo4jGraph
from neo4j import GraphDatabase

load_dotenv()

GRAPH_DB_URL = os.getenv("GRAPH_DB_URL")
GRAPH_DB_USERNAME = os.getenv("GRAPH_DB_USERNAME")
GRAPH_DB_PASSWORD = os.getenv("GRAPH_DB_PASSWORD")

AUTH=("GRAPH_DB_USERNAME", "GRAPH_DB_PASSWORD")

# graph = Neo4jGraph(
#     url=GRAPH_DB_URL,
#     username=GRAPH_DB_USERNAME,
#     password=GRAPH_DB_PASSWORD
# )

URI=GRAPH_DB_URL

with GraphDatabase.driver(URI, auth=AUTH) as driver:
    driver.verify_connectivity()

llm = ChatOpenAI(
    model="gpt-4.1-mini",
    temperature=0
)

chain = GraphCypherQAChain.from_llm(
    llm=llm,
    graph=driver,
    verbose=True
)

# 🔹 CLI loop
while True:
    query = input("What is your query? ")

    if query == "0":
        break

    try:
        response = chain.invoke({"query": query})
        print("\nAnswer:\n", response["result"])
    except Exception as e:
        print("Error:", e)

    print("\n------------------------------------------\n")