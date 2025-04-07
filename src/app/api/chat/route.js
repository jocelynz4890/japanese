import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req) {
    const body = await req.json()
    const messages = [
        { role: 'system', 
          content: 'You are a specialized Japanese language learning assistant. Your purpose is to help learners improve their Japanese language skills through interactive, level-appropriate instruction.' },
        ...body.messages, 
    ]

    try {
        const chatCompletion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        })

        const reply = chatCompletion.choices[0].message

        return NextResponse.json({ reply })
    } catch (error) {
        console.error('OpenAI API Error:', error)
        return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 })
    }
  
}

export async function GET(req) {
    const { searchParams } = new URL(req.url)
    const chatId = searchParams.get('chatId')

    return NextResponse.json({
        messages: [
        { role: 'assistant', content: 'New chat started.' },
        ],
    })
}
