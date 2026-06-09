import { expect, test } from '@playwright/test';
import { qualifyLead } from '../src/lib/leadQualification';

test.describe('lead qualification', () => {
  test('prioritizes urgent owned workflows with a clear proof target', () => {
    const lead = qualifyLead({
      email: 'buyer@examplecorp.com',
      company: 'Example Corp',
      sensitivity: 'regulated or confidential',
      infrastructure: 'Active Mirror managed pilot',
      timeline: 'urgent production issue',
      decisionRole: 'I can sponsor or approve it',
      proofTarget: 'A board-ready evidence workspace with approval steps and a deploy-or-don\'t recommendation.',
      useCase: 'We need to prove a vendor decision before a board meeting, separate public sources from private file review, and show the approval path before anyone sends the memo.',
    });

    expect(lead.grade).toBe('priority');
    expect(lead.score).toBeGreaterThanOrEqual(78);
    expect(lead.reasons).toContain('budget owner');
    expect(lead.nextAction).toContain('Reply today');
  });

  test('downranks vague research-stage leads', () => {
    const lead = qualifyLead({
      email: 'curious@gmail.com',
      timeline: 'researching',
      decisionRole: 'I am researching options',
      useCase: 'Want to learn about AI.',
    });

    expect(lead.grade).toBe('low_fit');
    expect(lead.reasons).toContain('workflow too vague');
    expect(lead.nextAction).toContain('request a concrete workflow');
  });
});
