

import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { connectToDB } from '@/lib/connectdb';
import Student from "@/models/student";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { formatLessonsForLLM } from '@/lib/formatLessonsForLLM';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(req) {
    try {
        await connectToDB();
        const { searchParams } = new URL(req.url);
        const session = await getServerSession(authOptions);
        const chatName = searchParams.get('chatName') || 'default';

        if (!session?.user?.email) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const student = await Student.findOne({ email: session.user.email });
        if (!student) {
        return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }

        const chat = student.chat.find(c => c.name === chatName);

        // If chat does not exist, return a default message
        if (!chat) {
        return NextResponse.json({
            messages: [{ role: 'assistant', content: 'New chat started.' }]
        });
        }

        return NextResponse.json({ messages: chat.messages });
    } catch (err) {
        console.error('Error fetching chat:', error);
        return NextResponse.json({ error: 'Failed to fetch chat' }, { status: 500 });
    }
}


export async function POST(req) {
    const body = await req.json();
    const { studentId, chatName = "default", messages } = body;

    // Ensure the request includes a studentId and messages
    if (!studentId || !messages) {
        return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    // Add system message to the conversation
    const conversation = [
        { 
        role: 'system', 
        content: 'You are a specialized Japanese language learning assistant. Your purpose is to help learners improve their Japanese language skills through interactive, level-appropriate instruction. You may format your replies with markdown.' 
        },
        ...messages, 
    ];

    try {
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: conversation,
    });

    const reply = chatCompletion.choices[0].message;

    // Save the chat reply to the student's record
    await connectToDB();
    const student = await Student.findById(studentId);
    const now = new Date().toISOString();

    // Find the chat by name or create a new one
    const chatIndex = student.chat.findIndex(c => c.name === chatName);

    const updatedChat = { 
      name: chatName, 
      messages: [...messages, reply], 
      lastUpdate: now 
    };

    if (chatIndex >= 0) {
      // Update existing chat
      student.chat[chatIndex] = updatedChat;
    } else {
      // Add new chat if it doesn't exist
      student.chat.push(updatedChat);
    }

    await student.save();

    /**
     * PROGRESS DELTA
     */
    const progressCompletion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "system",
                content: `You are a Japanese learning evaluator. Each lesson has vocabulary/grammar mapped to a number representing progress (0-100). 
                Below is the student's current lesson progress:
                ${formatLessonsForLLM(student.lessons)}
                
                Based on the last student message and the progress so far (note that there may not necessarily need to be a change in
                progress), return ONLY a JSON array, with no markdown formatting, with the corresponding lesson, vocab/grammar, and your evaluated delta values of 0–100 like:
                    [
                        { "lesson": 3, "English": "eat", "Japanese": "食べる", "delta": 5 },
                        { "lesson": 3, "English": "apple", "Japanese": "りんご", "delta": -2 }
                    ]`
            },
            { role: "user", content: message },
        ],
        response_format: "json",
    });

    let progressUpdates = [];
    try {
        progressUpdates = JSON.parse(progressCompletion.choices[0].message.content || "[]");
        
        // apply updates to db
        if (progressUpdates.length > 0) {
            const student = await Student.findOne({ _id: session.user.id });

            if (student) {
                for (const update of progressUpdates) {
                    const { lesson, English, Japanese, delta } = update;

                    const lessonData = student.lessons.find((l) => l.lessonNumber === lesson);
                    if (!lessonData) continue;


                    const word = lessonData.vocab.find(
                        (w) => w.English === English && w.Japanese === Japanese
                    );
                    if (word) {
                    word.progress = Math.min(100, Math.max(0, word.progress + delta));
                    }
                }

                await student.save();
            }
        }
    } catch (error) {
        console.error("Error parsing GPT progress updates:", error);
    }

    return NextResponse.json({ reply });

    } catch (error) {
        console.error('OpenAI API Error:', error);
        return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
    }
}
