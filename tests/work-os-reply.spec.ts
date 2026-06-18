import { expect, test } from '@playwright/test';
import {
  compactWorkOsReply,
  MAX_WORK_OS_ARTIFACT_TITLE_CHARS,
  MAX_WORK_OS_CHAT_REPLY_CHARS,
} from '../src/lib/mirror/workOsReply';

test.describe('Work OS reply sanitizer', () => {
  test('replaces markdown and JSON-shaped artifact bodies with a compact artifact summary', () => {
    const reply = compactWorkOsReply(
      [
        '**Small Business Launch Plan: Bakery in Goa**',
        '1. **Executive Summary**',
        '- Concept: Artisan bakery',
        '{"objective":"Launch a bakery","targetMarket":"Goa"}',
        'Assumptions: demand exists',
        'Unknowns: budget',
        'NextAction: Confirm location',
      ].join('\n'),
      { title: 'Small Business Launch Plan for a Bakery in Goa' },
    );

    expect(reply.length).toBeLessThanOrEqual(MAX_WORK_OS_CHAT_REPLY_CHARS);
    expect(reply).toBe('I drafted Small Business Launch Plan for a Bakery in Goa and kept proof gaps visible below.');
    expect(reply).not.toContain('**');
    expect(['{', '}', '[', ']', '|'].some((marker) => reply.includes(marker))).toBe(false);
    expect(reply).not.toMatch(/\b(objective|targetMarket|keyActivities|timeline|executive summary|market analysis|assumptions|unknowns|nextAction)\b/i);
  });

  test('asks a compact question when artifact-shaped text has no artifact fallback', () => {
    const reply = compactWorkOsReply('1. Step one\n2. Step two\n3. Step three', null);

    expect(reply).toBe('What should this become: a plan, draft, brief, or checklist?');
    expect(reply.length).toBeLessThanOrEqual(MAX_WORK_OS_CHAT_REPLY_CHARS);
  });

  test('preserves clean one-line replies', () => {
    const reply = compactWorkOsReply('I drafted the first useful version and left proof gaps visible below.', null);

    expect(reply).toBe('I drafted the first useful version and left proof gaps visible below.');
  });

  test('caps long artifact titles in fallback replies', () => {
    const longTitle = 'A'.repeat(MAX_WORK_OS_ARTIFACT_TITLE_CHARS + 40);
    const reply = compactWorkOsReply('{"blocks":["leak this structured object"]}', { title: longTitle }, true);

    expect(reply.length).toBeLessThanOrEqual(MAX_WORK_OS_CHAT_REPLY_CHARS);
    expect(reply).toContain('I refined ');
    expect(reply).toContain('...');
    expect(reply).not.toContain(longTitle);
  });
});
