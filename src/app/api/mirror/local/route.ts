import { NextResponse } from 'next/server';
import ollama from 'ollama';
import {
  buildLocalSupervisorAdvisoryPrompt,
  createLocalSupervisorDecision,
} from '@/lib/mirror/localSupervisor';

const ALLOWED_LOCAL_MODEL_FAMILIES = new Set(["llama3", "llama3.1", "qwen2.5", "mistral"]);

function isAllowedLocalModel(model: string) {
  const family = model.split(":")[0];
  return ALLOWED_LOCAL_MODEL_FAMILIES.has(model) || ALLOWED_LOCAL_MODEL_FAMILIES.has(family);
}

export async function POST(req: Request) {
  try {
    if (process.env.MIRROR_LOCAL_API_ENABLED !== "true") {
      return NextResponse.json({ error: "Local inference is not enabled for this public runtime" }, { status: 404 });
    }

    const body = await req.json();
    const { prompt, model = process.env.MIRROR_LOCAL_SUPERVISOR_MODEL || 'llama3', runLocalModel = false } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const decision = createLocalSupervisorDecision(String(prompt));

    if (!runLocalModel) {
      return NextResponse.json({
        supervisor: decision,
        advisory: null,
        note: "Deterministic supervisor decision returned. Local model advisory was not run.",
      });
    }

    if (process.env.MIRROR_LOCAL_MODEL_ADVISORY_ENABLED !== "true") {
      return NextResponse.json({
        supervisor: decision,
        advisory: null,
        note: "Local model advisory is disabled; deterministic supervisor remains authoritative.",
      });
    }

    if (!isAllowedLocalModel(String(model))) {
      return NextResponse.json({ error: 'Model is not allowed' }, { status: 400 });
    }

    const response = await ollama.generate({
      model: String(model),
      prompt: buildLocalSupervisorAdvisoryPrompt(String(prompt), decision),
      stream: false,
      options: {
        temperature: 0,
        top_p: 0,
        seed: 1,
        num_predict: 240,
      },
    });

    return NextResponse.json({
      supervisor: decision,
      advisory: response.response,
      note: "Local model advisory is non-authoritative. Deterministic supervisor wins on conflict.",
    });
  } catch (error) {
    console.error('Error generating response with Ollama:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
