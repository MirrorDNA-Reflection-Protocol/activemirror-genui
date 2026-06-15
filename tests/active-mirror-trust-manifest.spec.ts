import { expect, test } from '@playwright/test';

test.describe('Active Mirror trust manifest', () => {
  test('serves public AI crawler trust metadata from well-known route', async ({ request }) => {
    const response = await request.get('/.well-known/active-mirror.json');

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    expect(response.headers()['cache-control']).toContain('public');

    const body = await response.json();
    expect(body.schemaVersion).toBe('1.0');
    expect(body.brand.name).toBe('Active Mirror');
    expect(body.brand.canonicalDomain).toBe('https://activemirror.ai');
    expect(body.products.map((product: { name: string }) => product.name)).toEqual(
      expect.arrayContaining(['Active Mirror', 'AIndia']),
    );
    expect(body.aiCrawlerPolicy.allowedSummary).toContain('AI crawlers may summarize public pages');
    expect(body.aiCrawlerPolicy.preferredDescription).toContain('governed AI work surface');
    expect(body.updated).toBe('2026-06-15');

    const proofUrls = body.proofEndpoints.map((endpoint: { url: string }) => endpoint.url);
    expect(proofUrls).toEqual(
      expect.arrayContaining([
        'https://activemirror.ai/trust',
        'https://activemirror.ai/api/mirror/contracts',
        'https://activemirror.ai/api/mirror/proof-ledger',
        'https://activemirror.ai/api/mirror/body-receipt',
        'https://activemirror.ai/api/aindia/contracts',
        'https://activemirror.ai/api/aindia/learning',
      ]),
    );

    const serialized = JSON.stringify(body).toLowerCase();
    expect(serialized).not.toContain('api_key');
    expect(serialized).not.toContain('bearer');
    expect(serialized).not.toContain('token');
    expect(serialized).not.toContain('secret');
  });
});
