import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';

const repoRoot = process.cwd();

test.describe('model route normalization', () => {
  test('mirror stream uses the governed Work OS model route registry', () => {
    const streamRoute = readFileSync(join(repoRoot, 'src/app/api/mirror/stream/route.ts'), 'utf8');

    expect(streamRoute).toContain('configuredWorkOsModelRoutes');
    expect(streamRoute).toContain('recordModelRouteSuccess');
    expect(streamRoute).toContain('recordModelRouteFailure');
    expect(streamRoute).toContain('const { model, provider, modelId } = modelRoute');
    expect(streamRoute).toContain('model,');
    expect(streamRoute).not.toContain('const OPENAI_MODEL');
    expect(streamRoute).not.toContain('openai(');
    expect(streamRoute).not.toContain('gpt-5.5');
  });

  test('model health owns the public hosted model default', () => {
    const modelHealth = readFileSync(join(repoRoot, 'src/lib/mirror/modelHealth.ts'), 'utf8');
    const streamRoute = readFileSync(join(repoRoot, 'src/app/api/mirror/stream/route.ts'), 'utf8');

    expect(modelHealth).toContain('configuredWorkOsModelRoutes');
    expect(modelHealth).toContain('"gpt-4.1-mini"');
    expect(streamRoute).not.toContain('OPENAI_FREE_MODEL');
  });
});
