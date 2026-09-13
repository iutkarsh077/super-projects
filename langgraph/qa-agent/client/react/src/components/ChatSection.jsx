import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import api from "../helpers/api";
import Markdown from "react-markdown";

const messages = [
    { id: 1, sender: "user", text: "Can you explain what LangGraph is?" },
    { id: 2, sender: "assistant", text: "LangGraph is a library for building applications that use stateful, multi-step AI workflows." },
    { id: 3, sender: "user", text: "What is a good first project to build with it?" },
    { id: 4, sender: "assistant", text: "A question-answering assistant is a great place to start. You can add tools and memory later." },
];

const ChatSection = () => {
    const [userMessages, setUserMessages] = useState(messages);
    const [currentText, setCurrentText] = useState("");
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [userMessages]);

    const sendMessageMutation = useMutation({
        mutationFn: (text) => api.post("/querynode", { query: text }),
        onSuccess: ({ data }) => {
            console.log("The response data is: ", data);
            setUserMessages((prev) => [
                ...prev,
                {
                    id: prev.length > 0 ? prev[prev.length - 1].id + 1 : 1,
                    sender: "assistant",
                    text: data.data
                }
            ])
            setCurrentText("");
        }
    })
    const handleSendMessage = (e) => {
        event.preventDefault();

        if (!currentText.trim()) return;

        setUserMessages((prev) => [
            ...prev,
            {
                id: prev.length > 0 ? prev[prev.length - 1].id + 1 : 1,
                sender: "user",
                text: currentText
            }
        ])
        sendMessageMutation.mutate(currentText);
    }
    return (
        <main className="flex min-w-0 flex-1 flex-col bg-gray-50">
            <header className="border-b border-gray-200 bg-white px-6 py-4">
                <h1 className="text-lg font-semibold text-gray-900">Getting started with LangGraph</h1>
                <p className="text-sm text-gray-500">Ask anything about your project</p>
            </header>

            <div className="flex-1 space-y-5 overflow-y-auto px-4 py-6 sm:px-8">
                {userMessages.map((message) => (
                    <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-xl rounded-2xl px-4 py-3 text-sm leading-6 ${message.sender === "user"
                            ? "rounded-br-md bg-black text-white"
                            : "rounded-bl-md bg-white text-gray-800 shadow-sm ring-1 ring-gray-200"
                            }`}>
                            <Markdown>{message.text}</Markdown>
                        </div>

                        <div ref={bottomRef} />
                    </div>
                ))}
            </div>

            <form onSubmit={handleSendMessage} className="border-t border-gray-200 bg-white p-4 sm:px-8">
                <label htmlFor="message" className="sr-only">Message</label>
                <div className="flex gap-3">
                    <input id="message" value={currentText} type="text" placeholder="Type a message..." onChange={(e) => setCurrentText(e.target.value)} className="min-w-0 flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black" />
                    <button type="button" className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800">Send</button>
                </div>
            </form>
        </main>
    )
}

export default ChatSection;
