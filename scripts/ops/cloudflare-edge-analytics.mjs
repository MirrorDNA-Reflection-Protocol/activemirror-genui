#!/usr/bin/env node

import { execFileSync } from "node:child_process";

const zoneTag = process.env.CLOUDFLARE_ZONE_ID || "716c3e355ef80e465002bd415770d63e";
const KEYCHAIN_SERVICE = "activemirror.cloudflare.analytics.token";

function readKeychainToken() {
  try {
    return execFileSync("security", ["find-generic-password", "-a", "active-mirror", "-s", KEYCHAIN_SERVICE, "-w"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

const token = process.env.CLOUDFLARE_ANALYTICS_TOKEN || process.env.CLOUDFLARE_API_TOKEN || readKeychainToken();

if (!token) {
  console.error(`Missing CLOUDFLARE_ANALYTICS_TOKEN. Required permissions: Account Analytics:Read, Zone:Read, Zone Analytics:Read for activemirror.ai. Keychain fallback service: ${KEYCHAIN_SERVICE}.`);
  process.exit(2);
}

const query = `query($zoneTag: string, $since: Time, $until: Time) {
  viewer { zones(filter:{zoneTag:$zoneTag}) {
    total: httpRequestsAdaptiveGroups(limit:1, filter:{datetime_geq:$since, datetime_leq:$until}) { count sum { visits edgeResponseBytes } }
    byDay: httpRequestsAdaptiveGroups(limit:40, filter:{datetime_geq:$since, datetime_leq:$until}, orderBy:[date_ASC]) { dimensions { date } count sum { visits edgeResponseBytes } }
    byCountry: httpRequestsAdaptiveGroups(limit:12, filter:{datetime_geq:$since, datetime_leq:$until}, orderBy:[count_DESC]) { dimensions { clientCountryName } count sum { visits edgeResponseBytes } }
    byHost: httpRequestsAdaptiveGroups(limit:12, filter:{datetime_geq:$since, datetime_leq:$until}, orderBy:[count_DESC]) { dimensions { clientRequestHTTPHost } count sum { visits edgeResponseBytes } }
    byPath: httpRequestsAdaptiveGroups(limit:15, filter:{datetime_geq:$since, datetime_leq:$until}, orderBy:[count_DESC]) { dimensions { clientRequestPath } count sum { visits edgeResponseBytes } }
    byStatus: httpRequestsAdaptiveGroups(limit:15, filter:{datetime_geq:$since, datetime_leq:$until}, orderBy:[count_DESC]) { dimensions { edgeResponseStatus } count sum { visits edgeResponseBytes } }
    byCache: httpRequestsAdaptiveGroups(limit:12, filter:{datetime_geq:$since, datetime_leq:$until}, orderBy:[count_DESC]) { dimensions { cacheStatus } count sum { edgeResponseBytes } }
    byDevice: httpRequestsAdaptiveGroups(limit:12, filter:{datetime_geq:$since, datetime_leq:$until}, orderBy:[count_DESC]) { dimensions { clientDeviceType } count sum { visits edgeResponseBytes } }
    byBot: httpRequestsAdaptiveGroups(limit:12, filter:{datetime_geq:$since, datetime_leq:$until}, orderBy:[count_DESC]) { dimensions { verifiedBotCategory } count sum { visits edgeResponseBytes } }
  }}
}`;

function mb(value) {
  return Math.round(Number(value || 0) / 1024 / 1024 * 100) / 100;
}

async function gql(variables) {
  const response = await fetch("https://api.cloudflare.com/client/v4/graphql", {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });
  const body = await response.json();
  if (!response.ok || body.errors) {
    const message = JSON.stringify(body.errors || body, null, 2);
    if (message.includes("account.zone.analytics.read")) {
      console.error("Cloudflare analytics permission missing. Create a token with Account Analytics:Read, Zone:Read, and Zone Analytics:Read for activemirror.ai.");
    }
    console.error(message);
    process.exit(1);
  }
  return body.data.viewer.zones[0];
}

function addGroupedRows(map, rows, dimension) {
  for (const row of rows || []) {
    const key = row.dimensions?.[dimension] || "(blank)";
    const current = map.get(key) || { key, requests: 0, visits: 0, bytes: 0 };
    current.requests += Number(row.count || 0);
    current.visits += Number(row.sum?.visits || 0);
    current.bytes += Number(row.sum?.edgeResponseBytes || 0);
    map.set(key, current);
  }
}

function addCacheRows(map, rows) {
  for (const row of rows || []) {
    const key = row.dimensions?.cacheStatus || "(blank)";
    const current = map.get(key) || { key, requests: 0, bytes: 0 };
    current.requests += Number(row.count || 0);
    current.bytes += Number(row.sum?.edgeResponseBytes || 0);
    map.set(key, current);
  }
}

function sortedGroup(map, limit = 10) {
  return [...map.values()]
    .sort((a, b) => b.requests - a.requests)
    .slice(0, limit)
    .map((row) => ({ key: row.key, requests: row.requests, visits: row.visits || 0, mb: mb(row.bytes) }));
}

function sortedCache(map) {
  return [...map.values()]
    .sort((a, b) => b.requests - a.requests)
    .map((row) => ({ key: row.key, requests: row.requests, mb: mb(row.bytes) }));
}

async function snapshot(days) {
  const now = Date.now();
  const start = now - days * 24 * 60 * 60 * 1000;
  const chunkMs = 23 * 60 * 60 * 1000 + 59 * 60 * 1000;
  let cursor = start;
  let requests = 0;
  let visits = 0;
  let bytes = 0;
  const countries = new Map();
  const hosts = new Map();
  const paths = new Map();
  const statuses = new Map();
  const caches = new Map();
  const devices = new Map();
  const bots = new Map();
  const daily = new Map();

  while (cursor < now) {
    const chunkEnd = Math.min(cursor + chunkMs, now);
    const zone = await gql({
      zoneTag,
      since: new Date(cursor).toISOString(),
      until: new Date(chunkEnd).toISOString(),
    });
    const total = zone.total?.[0] || { count: 0, sum: {} };
    requests += Number(total.count || 0);
    visits += Number(total.sum?.visits || 0);
    bytes += Number(total.sum?.edgeResponseBytes || 0);
    addGroupedRows(countries, zone.byCountry, "clientCountryName");
    addGroupedRows(hosts, zone.byHost, "clientRequestHTTPHost");
    addGroupedRows(paths, zone.byPath, "clientRequestPath");
    addGroupedRows(statuses, zone.byStatus, "edgeResponseStatus");
    addCacheRows(caches, zone.byCache);
    addGroupedRows(devices, zone.byDevice, "clientDeviceType");
    addGroupedRows(bots, zone.byBot, "verifiedBotCategory");
    for (const row of zone.byDay || []) {
      const key = row.dimensions.date;
      const current = daily.get(key) || { date: key, requests: 0, visits: 0, bytes: 0 };
      current.requests += Number(row.count || 0);
      current.visits += Number(row.sum?.visits || 0);
      current.bytes += Number(row.sum?.edgeResponseBytes || 0);
      daily.set(key, current);
    }
    cursor = chunkEnd + 1;
  }

  const statusRows = sortedGroup(statuses, 15);
  const cacheRows = sortedCache(caches);
  const cacheHitRequests = cacheRows
    .filter((row) => ["hit", "stale", "revalidated", "updating"].includes(String(row.key).toLowerCase()))
    .reduce((sum, row) => sum + row.requests, 0);

  return {
    days,
    since: new Date(start).toISOString(),
    until: new Date(now).toISOString(),
    edgeRequests: requests,
    visits,
    bandwidthMB: mb(bytes),
    cacheHitRequests,
    cacheHitRate: requests ? Math.round((cacheHitRequests / requests) * 1000) / 10 : 0,
    fourXxRequests: statusRows.filter((row) => String(row.key).startsWith("4")).reduce((sum, row) => sum + row.requests, 0),
    fiveXxRequests: statusRows.filter((row) => String(row.key).startsWith("5")).reduce((sum, row) => sum + row.requests, 0),
    topCountries: sortedGroup(countries),
    topHosts: sortedGroup(hosts),
    topPaths: sortedGroup(paths, 12),
    status: statusRows,
    cache: cacheRows,
    devices: sortedGroup(devices),
    botCategories: sortedGroup(bots),
    daily: [...daily.values()].sort((a, b) => a.date.localeCompare(b.date)).map((row) => ({ date: row.date, requests: row.requests, visits: row.visits, mb: mb(row.bytes) })),
  };
}

const windows = [];
const requestedWindows = process.argv
  .slice(2)
  .map((value) => Number.parseInt(value, 10))
  .filter((value) => Number.isFinite(value) && value > 0 && value <= 8);
for (const days of requestedWindows.length ? requestedWindows : [1, 7]) {
  windows.push(await snapshot(days));
}

console.log(JSON.stringify({ generatedAt: new Date().toISOString(), zone: "activemirror.ai", windows }, null, 2));
