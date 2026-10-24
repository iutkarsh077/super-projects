"use client";

import { useState } from "react";

const ChatPage = () => {
    const [text, setText] = useState("");
    const [messages, setMessages] = useState<string[] | null>(null);
    const [streamText, setStreamText] = useState("");


    const handleSendText = async () => {
        try {
            const res = await fetch("/api/stream", {
                method: "POST",
                body: JSON.stringify(text)
            })

            if (!res.ok || !res.body) {
                throw new Error("Request failed");
            }

          const decoder = new TextDecoder();
          const reader  = res.body.getReader();

          while(true){
            const { value, done } = await reader.read();

            if(done){
                break;
            }

            setStreamText((prev)=>prev + decoder.decode(value, {stream: true}));
          }
        } catch (error) {
            console.log(error);
        }
    }


    return (
        <div>
            <div className="flex gap-2 fixed bottom-2 w-full left-1/4">
                <input type="text" value={text} onChange={(e) => setText(e.target.value)} className="w-1/3 h-12 border border-black text-black rounded-md pl-1" placeholder="Write your prompt here..." />

                <button onClick={handleSendText} className="border border-black p-2 rounded-md hover:cursor-pointer hover:bg-black/10 transition-all duration-300 ease-in-out">Send</button>
            </div>

            <div style={{ whiteSpace: "pre-wrap" }}>{streamText}</div>
        </div>
    )
}

export default ChatPage