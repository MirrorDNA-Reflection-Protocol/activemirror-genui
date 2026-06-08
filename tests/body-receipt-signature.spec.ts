import { expect, test } from '@playwright/test';
import { createHash, createPrivateKey, sign } from 'node:crypto';
import {
  publicBodyReceiptSigningPayload,
  summarizePublicBodyReceipt,
  validatePublicBodyReceipt,
  type PublicBodyReceipt,
} from '../src/lib/mirror/bodyReceipt';

const TEST_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MC4CAQAwBQYDK2VwBCIEIFb+1RL0oSxdiGG2wu1xAsbA8fVdHMlWk3Yy4Vy/xr5U
-----END PRIVATE KEY-----`;

test.describe('public body receipt signatures', () => {
  test.skip(!process.env.MIRROR_BODY_RECEIPT_PUBLIC_KEY, 'requires MIRROR_BODY_RECEIPT_PUBLIC_KEY');

  test('verifies an Ed25519 public-safe body receipt', () => {
    const unsignedReceipt: PublicBodyReceipt = {
      schemaVersion: 'active_mirror.body_public_receipt.v1',
      receiptId: 'am-body-signature-test-20260608T181700Z',
      issuedAt: '2026-06-08T18:17:00Z',
      expiresAt: '2026-06-08T18:27:00Z',
      bodyState: 'online',
      sourceState: 'public_safe_sync',
      proof: {
        didRun: ['body_public_sync'],
        didNotRun: ['private_file_read', 'vault_write'],
        approvalsRequired: ['private_actions'],
      },
    };

    const payload = publicBodyReceiptSigningPayload(unsignedReceipt);
    const signature = sign(null, Buffer.from(payload), createPrivateKey(TEST_PRIVATE_KEY)).toString('base64');
    const payloadHash = `sha256:${createHash('sha256').update(payload).digest('hex')}`;

    const receipt = {
      ...unsignedReceipt,
      signature: {
        algorithm: 'ed25519',
        keyId: 'active-mirror-test-key',
        payloadHash,
        chainHead: payloadHash,
        signature,
      },
    } satisfies PublicBodyReceipt;

    const validated = validatePublicBodyReceipt(receipt);
    expect(validated.ok).toBeTruthy();
    if (!validated.ok) throw new Error(validated.error);

    const summary = summarizePublicBodyReceipt(validated.receipt, new Date('2026-06-08T18:18:00Z'));
    expect(summary.signatureState).toBe('verified');
    expect(summary.verificationMode).toBe('ed25519_verified');
    expect(summary.signatureKeyId).toBe('active-mirror-test-key');
    expect(summary.payloadHash).toBe(payloadHash);
  });
});
