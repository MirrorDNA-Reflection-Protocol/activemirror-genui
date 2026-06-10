import { expect, test } from '@playwright/test';
import { qualifyLead } from '../src/lib/leadQualification';
import { buildLeadFollowUp, followUpReplyMailto } from '../src/lib/leadFollowUp';

test.describe('lead qualification', () => {
  test('prioritizes urgent owned workflows with a clear proof target', () => {
    const lead = qualifyLead({
      email: 'buyer@examplecorp.com',
      company: 'Example Corp',
      sensitivity: 'regulated or confidential',
      infrastructure: 'Active Mirror managed pilot',
      timeline: 'urgent production issue',
      decisionRole: 'I can sponsor or approve it',
      failureMode: 'Sources and gaps are unclear',
      approvedInputs: 'Public or sanitized inputs only',
      desiredArtifact: 'Evidence workspace',
      proofTarget: 'A board-ready evidence workspace with approval steps and a deploy-or-don\'t recommendation.',
      useCase: 'We need to prove a vendor decision before a board meeting, separate public sources from private file review, and show the approval path before anyone sends the memo.',
    });

    expect(lead.grade).toBe('priority');
    expect(lead.score).toBeGreaterThanOrEqual(78);
    expect(lead.reasons).toContain('budget owner');
    expect(lead.reasons).toContain('input boundary named');
    expect(lead.reasons).toContain('first deliverable named');
    expect(lead.nextAction).toContain('allowed-input route');
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

  test('recognizes workspace handoff leads as proof-sprint intent', () => {
    const lead = qualifyLead({
      email: 'owner@examplecorp.com',
      company: 'Example Corp',
      focus: 'workspace-proof',
      timeline: 'this month',
      decisionRole: 'I can sponsor or approve it',
      failureMode: 'Human review is missing',
      approvedInputs: 'Approved sample files',
      desiredArtifact: 'Decision brief',
      proofTarget: 'The generated workspace works on our real workflow with source gaps and approvals visible.',
      useCase: 'I generated a vendor evidence workspace and want to adapt it for our review process before the next leadership meeting.',
    });

    expect(lead.grade).toBe('priority');
    expect(lead.reasons).toContain('workspace handoff');
  });

  test('builds a deterministic first-reply packet for captured leads', () => {
    const input = {
      name: 'Asha Rao',
      email: 'asha@examplecorp.com',
      company: 'Example Corp',
      focus: 'workspace-proof',
      timeline: 'this month',
      decisionRole: 'I can sponsor or approve it',
      failureMode: 'Sources and gaps are unclear',
      approvedInputs: 'Public or sanitized inputs only',
      desiredArtifact: 'Evidence workspace',
      proofTarget: 'A decision-ready export with source gaps and approvals visible.',
      useCase: 'We generated a vendor evidence workspace and need it adapted for a real procurement review.',
    };
    const qualification = qualifyLead(input);
    const followUp = buildLeadFollowUp(input, qualification);

    expect(followUp.schemaVersion).toBe('active_mirror.lead_followup.v1');
    expect(followUp.proofSurface).toBe('reviewable evidence workspace');
    expect(followUp.firstReplySubject).toContain('Example Corp');
    expect(followUp.firstReplyBody).toContain('Before I call it a fit');
    expect(followUp.firstReplyBody).toContain('The current AI gap I have is');
    expect(followUp.riskBoundary).toContain('No private files');
    expect(followUp.riskBoundary).toContain('Public or sanitized inputs only');

    const mailto = followUpReplyMailto(input.email, followUp);
    expect(mailto).toContain('mailto:asha%40examplecorp.com');
    expect(mailto).toContain('subject=Active%20Mirror%20scope');
    expect(decodeURIComponent(mailto)).toContain('Can we confirm the first deliverable is Evidence workspace?');
  });
});
