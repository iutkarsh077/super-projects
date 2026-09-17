import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import User from "../models/User.js";
import { CloudClient } from "chromadb";
import crypto from "crypto";
import mongoose from "mongoose";
import ChatSession from "../models/ChatSession.js";

const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-small",
    apiKey: process.env.OPENAI_API_KEY
});

const client = new CloudClient({
    apiKey: process.env.CHROMA_API_KEY,
    tenant: process.env.CHROMA_TENANT_ID,
    database: process.env.CHROMA_DATABASE
});

const customEmbeddingFunction = {
    name: "openai-text-embedding-3-small",
    generate: async (texts) => {
        return embeddings.embedDocuments(texts);
    },
};

async function GetTextfromPDF(filePath) {
    try {
        const loader = new PDFLoader(filePath);
        const docs = await loader.load();
        return docs;
    } catch (error) {
        throw new Error(error);
    }
}


function sanitizeMetadata(metadata) {
    const clean = {};
    for (const [key, value] of Object.entries(metadata)) {
        if (value === null || value === undefined) {
            continue;
        }
        if (typeof value === "object") {
            clean[key] = JSON.stringify(value);
        } else {
            clean[key] = value;
        }
    }
    return clean;
}

async function ChunkTextData(docsText, sessionId, userId) {
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 100
    });

    const documentsWithMetadata = docsText.map((doc) => {
        return new Document({
            pageContent: doc.pageContent,
            metadata: {
                ...doc.metadata,
                sessionId,
                userId,
            },
        });
    });

    const splitDocs = await splitter.splitDocuments(documentsWithMetadata);

    const sanitizedDocs = splitDocs.map((doc) => {
        return new Document({
            pageContent: doc.pageContent,
            metadata: sanitizeMetadata(doc.metadata),
        });
    });

    return sanitizedDocs;
}

async function UploadDataToVectorDb(chunkData) {
    try {
        const documents = chunkData.map((doc) => doc.pageContent);
        const metadatas = chunkData.map((doc) => doc.metadata);
        const embedData = await embeddings.embedDocuments(documents);

        const collection = await client.getOrCreateCollection({
            name: process.env.COLLECTION_NAME,
            embeddingFunction: customEmbeddingFunction,
        });

        await collection.add({
            ids: documents.map(() => crypto.randomUUID()),
            documents,
            embeddings: embedData,
            metadatas,
        });

        return "Data uploaded successfully";
    } catch (error) {
        console.log(error);
        throw new Error(error.message || String(error));
    }
}

async function ProcessPDF(path, chatSessionId, userId) {
    const result = await GetTextfromPDF(path);
    const chunkData = await ChunkTextData(result, chatSessionId, userId);
    const ans = await UploadDataToVectorDb(chunkData);
    return ans;
}

async function UploadMultipleFiles(req, res) {
    try {
        const files = req.files;
        const { userId, sessionId } = req.body;
        const chatSessionId = sessionId;

        const user = await User.findById(userId).select("email").lean();
        if (!user) {
            return res.status(404).json({ error: "User not found", status: false });
        }

        let chatSession;
        if (chatSessionId) {
            if (!mongoose.isValidObjectId(chatSessionId)) {
                return res.status(400).json({ error: "Invalid chatSessionId", status: false });
            }

            chatSession = await ChatSession.findOne({ _id: chatSessionId, user: userId });
            if (!chatSession) {
                return res.status(404).json({ error: "Chat session not found", status: false });
            }
        } else {
            chatSession = await ChatSession.create({
                user: userId,
                title: "Untitled chat",
            });
        }

        const results = await Promise.allSettled(
            files.map((file) =>
                ProcessPDF(file.path, chatSession._id.toString(), user._id.toString())
            )
        );

        return res.status(200).json({ message: "Got the files", status: true, results });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server error", status: false });
    }
}

export default UploadMultipleFiles;