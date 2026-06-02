import { NextResponse } from 'next/server';
import ollama from 'ollama';

const ALLOWED_LOCAL_MODELS = new Set(["llama3", "llama3.1", "qwen2.5", "mistral"]);

export async function POST(req: Request) {
  try {
    if (process.env.MIRROR_LOCAL_API_ENABLED !== "true") {
      return NextResponse.json({ error: "Local inference is not enabled for this public runtime" }, { status: 404 });
    }

    const body = await req.json();
    const { prompt, model = 'llama3' } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    if (!ALLOWED_LOCAL_MODELS.has(model)) {
      return NextResponse.json({ error: 'Model is not allowed' }, { status: 400 });
    }

    const response = await ollama.generate({
      model: model,
      prompt: String(prompt).slice(0, 1200),
      stream: false,
    });

    return NextResponse.json({ response: response.response });
  } catch (error) {
    console.error('Error generating response with Ollama:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
