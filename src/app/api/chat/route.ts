import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const apiKey = process.env.OPENROUTER_API_KEY;

// Fail fast if API key is missing
if (!apiKey) {
  console.error('OPENROUTER_API_KEY is missing from environment variables');
}

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: apiKey || '',
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
    'X-Title': 'Janopriyo Shop - E-commerce Assistant',
  },
});


export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    // Validate message structure and roles to prevent prompt injection
    const validatedMessages = messages.filter((msg: any) => {
      return (
        msg &&
        typeof msg === 'object' &&
        typeof msg.content === 'string' &&
        (msg.role === 'user' || msg.role === 'assistant')
      );
    }).map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }));

    if (validatedMessages.length === 0 && messages.length > 0) {
      return NextResponse.json({ error: 'Invalid message format' }, { status: 400 });
    }

    console.log('Sending request to OpenRouter via OpenAI client...');

    const completion = await openai.chat.completions.create({
      model: 'z-ai/glm-4.5-air:free',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant for Janopriyo Shop, a premium online store in Bangladesh. Be helpful, polite, and professional. Assist customers with their queries about products, orders, and general information. Keep your responses concise and friendly.',
        },
        ...validatedMessages,
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const aiMessage = completion?.choices?.[0]?.message?.content;

    if (!aiMessage) {
      throw new Error('Empty response from AI model');
    }

    console.log('OpenRouter Response received successfully');

    return NextResponse.json({ message: aiMessage });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    // Secure error response: do not leak internal error details or stack traces
    return NextResponse.json({ error: 'Failed to connect to AI' }, { status: 500 });
  }
}
