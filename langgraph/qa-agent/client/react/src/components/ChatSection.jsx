import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import api from "../helpers/api";
import Markdown from "react-markdown";
import { useDispatch, useSelector } from "react-redux";
import { addCurrentChatSession } from "../features/UserSlices";
import { useNavigate } from "react-router-dom";

const ChatSection = () => {
    const [userMessages, setUserMessages] = useState([]);
    const [currentText, setCurrentText] = useState("");
    const bottomRef = useRef(null);
    const data = useSelector((state) => state.user.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const currentChatSession = useSelector(
        (state) => state.user?.currentChatSessionId
    );
    
    const url = window.location.href;
    const sessionId = currentChatSession;

    const { data: messages, isLoading, isSuccess } = useQuery({
        queryKey: ["chatMessages", sessionId],
        queryFn: async () => {
            const response = await api.get(`/getchats/${sessionId}`);
            return response.data;
        },

        enabled: !!sessionId,
    })

    useEffect(() => {
        if (isSuccess) {
            setUserMessages(messages.data);
            console.log("messages: ", messages)
        }
    }, [isSuccess, data]);

    useEffect(() => {
        const urlParts = url.split("=")
        dispatch(addCurrentChatSession({ id: urlParts?.[1] || null }));

        if(urlParts?.length < 2){
            setUserMessages([])
        }
    }, [url])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [userMessages]);

    const sendMessageMutation = useMutation({
        mutationFn: (text) => api.post("/querynode", { query: text, userId: data?.id, chatSessionId: sessionId || null }),
        onSuccess: ({ data }) => {
            console.log("The response data is: ", data);
            setUserMessages((prev) => [
                ...prev,
                {
                    _id: Date.now(),
                    role: "assistant",
                    content: data.data
                }
            ])
            setCurrentText("");
            dispatch(addCurrentChatSession({ id: data.chatSessionId }))
            navigate(`?session=${data.chatSessionId}`, { replace: true })
        }
    })
    const handleSendMessage = (e) => {
        e.preventDefault();

        if (!currentText.trim()) return;

        setUserMessages((prev) => [
            ...prev,
            {
                _id: Date.now(),
                role: "user",
                content: currentText
            }
        ])

        console.log("data session is: ", sessionId)
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
                    <div key={message._id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-xl rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "user"
                            ? "rounded-br-md bg-black text-white"
                            : "rounded-bl-md bg-white text-gray-800 shadow-sm ring-1 ring-gray-200"
                            }`}>
                            <Markdown>{message.content}</Markdown>
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
