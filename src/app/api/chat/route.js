// import { NextResponse } from 'next/server'
// import OpenAI from 'openai'

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// })

// export async function POST(req) {
//     const body = await req.json()
//     const messages = [
//         { role: 'system', 
//           content: 'You are a specialized Japanese language learning assistant. Your purpose is to help learners improve their Japanese language skills through interactive, level-appropriate instruction.' },
//         ...body.messages, 
//     ]

//     try {
//         const chatCompletion = await openai.chat.completions.create({
//         model: 'gpt-3.5-turbo',
//         messages,
//         })

//         const reply = chatCompletion.choices[0].message

//         return NextResponse.json({ reply })
//     } catch (error) {
//         console.error('OpenAI API Error:', error)
//         return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 })
//     }
  
// }

// export async function GET(req) {
//     const { searchParams } = new URL(req.url)
//     const chatId = searchParams.get('chatId')

//     return NextResponse.json({
//         messages: [
//         { role: 'assistant', content: 'New chat started.' },
//         ],
//     })
// }



import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { connectToDB } from '@/lib/connectdb';
import Student from "@/models/student";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

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

// export async function GET(req) {
//   const { searchParams } = new URL(req.url);
//   const studentId = searchParams.get('studentId');
//   const chatName = searchParams.get('chatName') || 'default';

//   if (!studentId) {
//     return NextResponse.json({ error: 'StudentID is required' }, { status: 400 });
//   }

//   try {
//     // Fetch the student and find the specific chat
//     await connectToDB();
//     const student = await Student.findById(studentId);
//     if (!student) {
//       return NextResponse.json({ error: 'Student not found' }, { status: 404 });
//     }

//     const chat = student.chat.find(c => c.name === chatName);

//     // If chat does not exist, return a default message
//     if (!chat) {
//       return NextResponse.json({
//         messages: [{ role: 'assistant', content: 'New chat started.' }]
//       });
//     }

//     return NextResponse.json({ messages: chat.messages });
//   } catch (error) {
//     console.error('Error fetching chat:', error);
//     return NextResponse.json({ error: 'Failed to fetch chat' }, { status: 500 });
//   }
// }


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
      content: 'You are a specialized Japanese language learning assistant. Your purpose is to help learners improve their Japanese language skills through interactive, level-appropriate instruction.' 
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

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}
