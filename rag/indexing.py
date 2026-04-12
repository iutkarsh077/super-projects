import dotenv
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_qdrant import QdrantVectorStore
import os

dotenv.load_dotenv()

qdrant_db = os.getenv("DB_ENDPOINT")
qdrant_api_key= os.getenv("QDRANT_DB_KEY")


file_path = "./js_interview.pdf"
loader = PyPDFLoader(file_path)

pages = loader.load()


text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
texts = text_splitter.split_documents(pages)

embeddings = OpenAIEmbeddings(
    model="text-embedding-3-large"
)

vector_store = QdrantVectorStore.from_documents(
    documents=texts,
    embedding=embeddings,
    collection_name="js_interview",
    url=qdrant_db,
    api_key=qdrant_api_key
)



print("Indexing complete!")