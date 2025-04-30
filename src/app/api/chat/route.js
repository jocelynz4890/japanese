

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

    // Save the chat reply to the student's record
    await connectToDB();
    const student = await Student.findById(studentId);
    const now = new Date().toISOString();

    // Ensure the request includes a studentId and messages
    if (!studentId || !messages) {
        return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    // Add system message to the conversation
    const conversation = [
        { 
        role: 'system', // TODO: add presets to system prompt
        content: `You are a Japanese tutor for Genki Vols 1-2. This is your student's lesson progress: ${formatLessonsForLLM(student.lessons)}. Format your replies with markdown. Be as concise as possible-- do not give feedback other than right or wrong.` 
        },
        ...messages, 
    ];

    try {
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: conversation.slice(-3), // truncate bc token limit
    });

    const reply = chatCompletion.choices[0].message;

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
        model: "gpt-4o",
        messages: [
            {
                role: "system", 
                content: `You return a progress delta JSON. Each lesson has vocabulary/grammar mapped to a number representing progress (0-100). 
                Below is the student's current lesson progress:
                ${formatLessonsForLLM(student.lessons)}
                
                Based on the last student response and the progress so far (note that there may not necessarily need to be a change in
                progress), return ONLY a JSON array, with no markdown formatting, with the corresponding lesson, practiced vocab/grammar, and your evaluated delta values of 0–100 the progress the student made on each, as below:
                    [
                        { "lesson": 3, "English": "eat", "Japanese": "食べる", "delta": 5 },
                        { "lesson": 3, "English": "apple", "Japanese": "りんご", "delta": -2 }
                    ]
                        
                    Again, return ONLY a JSON array. `
            },
            ...conversation.slice(-3), // truncating conversation history a bit bc token limit
        ],
    });

    console.log(progressCompletion.choices[0].message.content);

    let progressUpdates = [];
    try {
        progressUpdates = JSON.parse(progressCompletion.choices[0].message.content || "[]");
        
        // apply updates to db
        // TODO: handle edge cases like if the user explicitly asks for a certain amount of progress
        if (progressUpdates.length > 0) {
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
