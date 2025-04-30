"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from 'react-markdown';

export default function ChatBox({ studentId, chatName = "default" }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (studentId && chatName) {
      loadChat();
    }
  }, [studentId, chatName]);

  async function loadChat() {
    try {
      const res = await fetch(`/api/chat?studentId=${studentId}&chatName=${chatName}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setMessages(data.messages);
    } catch (err) {
      console.error("Failed to load chat", err);
      alert("An error occurred while loading the chat. Please try again.");
    }
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage = {
      role: "user",
      content: input,
      refusal: null,
      annotations: [],
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId,
          chatName,
          messages: updatedMessages,
        }),
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();

      // Ensure the reply from the server matches the expected schema
      const reply = {
        role: data.reply.role || "assistant",
        content: data.reply.content || "",
        refusal: data.reply.refusal ?? null,
        annotations: data.reply.annotations ?? [],
      };

      setMessages([...updatedMessages, reply]);
    } catch (err) {
      console.error("Failed to send message", err);
      alert("An error occurred while sending the message. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div style={{ borderColor: "var(--foreground)" }} className="flex flex-col border w-full h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 rounded ${
              msg.role === "user" ? "bg-blue-600 text-white self-end" : "bg-gray-800 text-white self-start"
            }`}
          >
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} style={{ borderColor: "var(--foreground)" }} className="flex border-t p-2 gap-2">
        <input
          style={{ borderColor: "var(--foreground)" }}
          className="flex-1 bg-transparent border rounded px-2 py-1 text-white"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-1 rounded disabled:opacity-50">
          {loading ? "..." : "Send"}
        </button>
      </form>
    </div>
  );
}
