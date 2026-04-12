import dotenv
from openai import OpenAI
from langchain_openai import OpenAIEmbeddings
from langchain_qdrant import QdrantVectorStore
import os

dotenv.load_dotenv()

qdrant_db = os.getenv("DB_ENDPOINT")
qdrant_api_key= os.getenv("QDRANT_DB_KEY")


embeddings = OpenAIEmbeddings(
    model="text-embedding-3-large"
)

vector_store = QdrantVectorStore.from_existing_collection(
    embedding=embeddings,
    collection_name="js_interview",
    url=qdrant_db,
    api_key=qdrant_api_key
)

query = "What are the differences between var, let and const in JavaScript?"
results = vector_store.similarity_search(query, k=3)

client = OpenAI()

system_prompt = [
    {"role": "system", "content": "You are a helpful assistant that provides concise and accurate answers to questions based on the provided context."},
    {"role": "user", "content": f"Context: {results}\n\nQuestion: {query}"}
]

response = client.chat.completions.create(
    model="gpt-5",
    messages=system_prompt,
)    

print(response.choices[0].message.content)