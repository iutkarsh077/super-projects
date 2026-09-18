"use client";

import { useState, KeyboardEvent } from "react";

type Message = {
  id: number;
  text: string;
  sender: "user" | "assistant";
};

type InterruptData = {
  type: string;
  order_id: string;
  amount: number;
  message: string;
};

type ChatResponse = {
  status: "completed" | "waiting_for_approval";
  message?: string;
  interrupt?: InterruptData;
};

const ChatSection = () => {
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);

  const [approval, setApproval] = useState<InterruptData | null>(null);

  const [loading, setLoading] = useState<boolean>(false);

  // Keep the same thread throughout the conversation
  const [threadId] = useState<string>(() => crypto.randomUUID());

  const handleSend = async (): Promise<void> => {
    if (!message.trim() || loading) return;

    const userMessage = message.trim();

    const newMessage: Message = {
      id: Date.now(),
      text: userMessage,
      sender: "user",
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          thread_id: threadId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data: ChatResponse = await response.json();

      // LangGraph is waiting for human approval
      if (data.status === "waiting_for_approval") {
        setApproval(data.interrupt ?? null);
        return;
      }

      // Normal completed response
      if (data.status === "completed" && data.message) {
        const assistantMessage: Message = {
          id: Date.now() + 1,
          text: data.message,
          sender: "assistant",
        };

        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "Something went wrong. Please try again.",
          sender: "assistant",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (
    decision: "approved" | "rejected"
  ): Promise<void> => {
    if (!approval || loading) return;

    setLoading(true);
    setApproval(null);

    try {
      const response = await fetch("http://localhost:8000/resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          thread_id: threadId,
          decision: decision,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to resume workflow");
      }

      const data: ChatResponse = await response.json();

      // In case another human approval is required
      if (data.status === "waiting_for_approval") {
        setApproval(data.interrupt ?? null);
        return;
      }

      // Final response from LangGraph
      if (data.status === "completed" && data.message) {
        const assistantMessage: Message = {
          id: Date.now(),
          text: data.message,
          sender: "assistant",
        };

        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: "Something went wrong while processing the approval.",
          sender: "assistant",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (
    e: KeyboardEvent<HTMLTextAreaElement>
  ): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen flex-col bg-gray-950 text-white">

      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4">
        <h1 className="text-lg font-semibold">
          AI Customer Support
        </h1>

        <p className="text-sm text-gray-400">
          How can we help you today?
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-6">

        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-500">
            Start a conversation...
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  msg.sender === "user"
                    ? "bg-blue-600"
                    : "bg-gray-800"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-gray-800 px-4 py-3 text-gray-400">
              Thinking...
            </div>
          </div>
        )}

      </div>

      {/* Human Approval */}
      {approval && (
        <div className="border-t border-gray-800 bg-gray-900 px-6 py-4">
          <div className="mx-auto max-w-3xl rounded-xl border border-yellow-700 bg-yellow-950/40 p-4">

            <h2 className="font-semibold text-yellow-400">
              Refund Approval Required
            </h2>

            <p className="mt-2 text-sm text-gray-300">
              {approval.message}
            </p>

            <div className="mt-3 space-y-1 text-sm text-gray-400">
              <p>
                Order:{" "}
                <span className="text-white">
                  {approval.order_id}
                </span>
              </p>

              <p>
                Amount:{" "}
                <span className="font-semibold text-white">
                  ₹{approval.amount.toLocaleString("en-IN")}
                </span>
              </p>
            </div>

            <div className="mt-4 flex gap-3">

              <button
                onClick={() => handleApproval("approved")}
                disabled={loading}
                className="rounded-lg bg-green-600 px-4 py-2 font-medium hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Approve Refund
              </button>

              <button
                onClick={() => handleApproval("rejected")}
                disabled={loading}
                className="rounded-lg bg-red-600 px-4 py-2 font-medium hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Reject
              </button>

            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-800 p-4">
        <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-gray-700 bg-gray-900 p-2">

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter what you want to ask..."
            rows={1}
            disabled={loading || approval !== null}
            className="flex-1 resize-none bg-transparent px-3 py-2 outline-none placeholder:text-gray-500 disabled:opacity-50"
          />

          <button
            onClick={handleSend}
            disabled={!message.trim() || loading || approval !== null}
            className="rounded-xl bg-blue-600 px-4 py-2 font-medium hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Send
          </button>

        </div>
      </div>

    </div>
  );
};

export default ChatSection;