"use client"

import { useState, useEffect, useRef } from "react"

export default function ChatBox({ chatId }) {
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const messagesEndRef = useRef(null)

    useEffect(() => {
        if (chatId) {
            loadChat()
        }
    }, [chatId])

    async function loadChat() {
        try {
            const res = await fetch(`/api/chat?chatId=${chatId}`)
            // Check if response is ok (status 2xx)
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`)
            }
            const data = await res.json()
            setMessages(data.messages)
        } catch (err) {
            console.error("Failed to load chat", err)
            alert("An error occurred while loading the chat. Please try again.")
        }
    }

    async function sendMessage(e) {
        e.preventDefault()
        if (!input.trim()) return

        const newMessage = { role: "user", content: input }
        const updatedMessages = [...messages, newMessage]
        setMessages(updatedMessages)
        setInput("")
        setLoading(true)

        try {
            const res = await fetch(`/api/chat`, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({
            chatId,
            messages: updatedMessages,
            }),
        })

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`)
        }

        const data = await res.json()
        setMessages([...updatedMessages, data.reply])
        } catch (err) {
        console.error("Failed to send message", err)
        alert("An error occurred while sending the message. Please try again.")
        } finally {
        setLoading(false)
        }
    }

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

  return (
    <div className="flex flex-col border border-white w-full h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 rounded ${
              msg.role === "user"
                ? "bg-blue-600 text-white self-end"
                : "bg-gray-800 text-white self-start"
            }`}
          >
            {msg.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={sendMessage}
        className="flex border-t border-white p-2 gap-2"
      >
        <input
          className="flex-1 bg-transparent border border-white rounded px-2 py-1 text-white"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-1 rounded disabled:opacity-50"
        >
          {loading ? "..." : "Send"}
        </button>
      </form>
    </div>
  )
}
