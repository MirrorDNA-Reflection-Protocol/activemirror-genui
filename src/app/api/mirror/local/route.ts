import { NextResponse } from 'next/server';
import ollama from 'ollama';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, model = 'llama3' } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const response = await ollama.generate({
      model: model,
      prompt: prompt,
      stream: false,
    });

    return NextResponse.json({ response: response.response });
  } catch (error: any) {
    console.error('Error generating response with Ollama:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
