export type LingOSRoute =
  | "gate"
  | "video"
  | "audio"
  | "language"
  | "ecosystem"
  | "marketing"
  | "company"
  | "research"
  | "build";

export type LingOSCompilation = {
  route: LingOSRoute;
  tokens: string[];
  needsProof: boolean;
};

export type WorkspaceProfile = {
  title: string;
  audience: string;
  promise: string;
  primaryAction: string;
  modules: string[];
  lookupUrl?: string;
  lookupLabel?: string;
};

export function normalizePromptForIntent(prompt: string) {
  return prompt
    .replace(/Generated App Preview/gi, "workspace preview")
    .replace(/Generated App Layout/gi, "working preview")
    .replace(/Interactive Modules/gi, "working areas")
    .replace(/Finish Path/gi, "finish route")
    .replace(/\bIntent:\s*/gi, "")
    .replace(/\bWho it serves:\s*[^.?!\n]+[.?!]?\s*/gi, "")
    .replace(/\bWhat appears on screen:\s*/gi, "")
    .replace(/\bPrimary action:\s*/gi, "")
    .replace(/\bTop bar:\s*[^.?!\n]+[.?!]?\s*/gi, "")
    .replace(/\bMain stage:\s*[^.?!\n]+[.?!]?\s*/gi, "")
    .replace(/\bSide rail:\s*[^.?!\n]+[.?!]?\s*/gi, "")
    .replace(/\bDownload pack:\s*[^.?!\n]+[.?!]?\s*/gi, "")
    .replace(/\bgenerated for this request and ready to refine\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function cleanIntent(prompt: string) {
  return normalizePromptForIntent(prompt)
    .replace(/\s+/g, " ")
    .replace(/^generate\s+/i, "")
    .trim()
    .slice(0, 170) || "Build the requested workspace.";
}

export function extractCompanyTarget(prompt: string) {
  const normalizedPrompt = normalizePromptForIntent(prompt);
  const domainMatch = normalizedPrompt.match(/(?:^|[\s(])((?:https?:\/\/)?(?:www\.)?[a-z0-9][a-z0-9-]*(?:\.[a-z0-9-]+)+(?:\/[^\s)]*)?)/i);
  if (domainMatch && !normalizedPrompt.slice(Math.max(0, domainMatch.index || 0) - 1, domainMatch.index).includes("@")) {
    const raw = domainMatch[1].replace(/[.,;!?]+$/, "");
    const url = raw.startsWith("http") ? raw : `https://${raw}`;
    try {
      const parsed = new URL(url);
      return {
        label: parsed.hostname.replace(/^www\./, ""),
        url: parsed.toString(),
        sourceLabel: "Open company site",
      };
    } catch {
      // Fall through to company-name parsing.
    }
  }

  const phraseMatch =
    normalizedPrompt.match(/\b(?:my|our)\s+(?:company|startup|business|org|organization|agency)\s+(?:is|called|name is)?\s*["']?([^,.!?;\n]{2,70})/i) ||
    normalizedPrompt.match(/\b(?:for|about)\s+(?:company|startup|business|org|organization|agency)\s+["']?([^,.!?;\n]{2,70})/i);

  if (!phraseMatch) return null;
  const label = phraseMatch[1]
    .replace(/^is\s+/i, "")
    .replace(/^called\s+/i, "")
    .replace(/^name is\s+/i, "")
    .replace(/["']/g, "")
    .split(/\b(?:help us|help me|can you|we need|we want|we are|i need|i want|needs?|wants?|launch|build|create|generate|show us|show me)\b/i)[0]
    .replace(/\b(?:and|for|to)$/i, "")
    .trim();
  if (!label || label.length < 2) return null;

  return {
    label,
    url: `https://www.google.com/search?q=${encodeURIComponent(label)}`,
    sourceLabel: "Open public company search",
  };
}

export function compileLingOS(prompt: string): LingOSCompilation {
  const lower = normalizePromptForIntent(prompt).toLowerCase();
  const tokens = ["HONESTY+ALWAYS"];
  const hasCompany = Boolean(extractCompanyTarget(prompt));
  const hasLookup = /\b(lookup|internet|online|source|sources|citation|citations|research|browse|browser|current|latest|news|who is|what is available)\b/.test(lower);
  const hasVideo = /\b(video|veo|veo 3|storyboard|mp4|render|text-to-video|generate video)\b/.test(lower);
  const hasAudio = /\b(audio|voice|podcast|narration|speech|text-to-speech|tts|sound|multilingual audio)\b/.test(lower);
  const hasSmallBusiness = /\b(small business|smb|local business|shop|restaurant|clinic|salon|agency|solo operator|owner operator|retailer|tradesperson)\b/.test(lower);
  const hasBuildArtifact = hasSmallBusiness || /\b(spec|downloadable|demo|app preview|generated app|workspace|proposal|document|pdf|one-pager|one pager|deck|form|calculator|brief)\b/.test(lower);
  const hasMarketing = /\b(marketing|positioning|campaign|launch|sales|copy|brand|pricing|commercial|mirrorprod)\b/.test(lower);

  if (/\b(hack|exploit|bypass|steal|phish|malware|credential|password|token|private key|dox|scrape personal|unhackable)\b/.test(lower)) {
    return { route: "gate", tokens: [...tokens, "GATE", "STOP"], needsProof: true };
  }
  if (hasVideo) return { route: "video", tokens: [...tokens, "MEDIA", "VIDEO", hasLookup ? "SRC" : "BRIEF", "GATE"], needsProof: hasLookup };
  if (hasAudio) return { route: "audio", tokens: [...tokens, "MEDIA", "AUDIO", "SCRIPT", "GATE"], needsProof: false };
  if (/\b(multilingual|multi-language|multilanguage|translate|translation|localize|localized|locale|language|hindi|arabic|spanish|french|tamil|telugu|marathi|bengali)\b/.test(lower)) {
    return { route: "language", tokens: [...tokens, "LING", "LOCALIZE"], needsProof: false };
  }
  if (/\b(ecosystem|operating map|chetana|mirrorgate protects|full working demo|show me your system)\b/.test(lower)) {
    return { route: "ecosystem", tokens: [...tokens, "MAP", "TRUST"], needsProof: true };
  }
  if (hasCompany) return { route: "company", tokens: [...tokens, "ORG", "SRC", "FIT"], needsProof: true };
  if (hasBuildArtifact && !/\b(campaign|launch|positioning|copy|brand|pricing|mirrorprod)\b/.test(lower)) {
    return { route: "build", tokens: [...tokens, "GEN", "SPEC", "EXPORT"], needsProof: hasLookup };
  }
  if (hasMarketing) return { route: "marketing", tokens: [...tokens, "MKT", "PROOF"], needsProof: true };
  if (hasLookup) return { route: "research", tokens: [...tokens, "SRC", "FEU"], needsProof: true };
  return { route: "build", tokens: [...tokens, "GEN", "EXPORT"], needsProof: false };
}

export function requestIntent(prompt: string) {
  const lower = normalizePromptForIntent(prompt).toLowerCase();
  const route = compileLingOS(prompt);
  return {
    lingos: route,
    ecosystem: /\b(ecosystem|operating map|chetana|mirrorgate protects|full working demo|show me your system)\b/.test(lower),
    company: Boolean(extractCompanyTarget(prompt)),
    software: /\b(software-on-demand|software on demand|app preview|generated app|generate an app|website preview|workspace|dashboard|calculator|form|explainer|one-pager|deck|download|export pack|individual|team|enterprise|public-sector|public sector|government|small business|smb|local business|shop|restaurant|clinic|salon)\b/.test(lower),
    marketing: /\b(marketing|positioning|campaign|launch|sales|copy|brand|pricing|commercial|mirrorprod)\b/.test(lower),
    lookup: /\b(lookup|internet|online|source|sources|citation|citations|research|browse|browser|current|latest|news|who is|what is available)\b/.test(lower),
    multilingual: /\b(multilingual|multi-language|multilanguage|translate|translation|localize|localized|locale|language|hindi|arabic|spanish|french|tamil|telugu|marathi|bengali)\b/.test(lower),
    video: /\b(video|veo|veo 3|storyboard|mp4|render|text-to-video|generate video)\b/.test(lower),
    audio: /\b(audio|voice|podcast|narration|speech|text-to-speech|tts|sound|multilingual audio)\b/.test(lower),
    highRisk: /\b(legal advice|terms of service review|privacy advice|medical advice|financial advice|investment advice|contract review|gdpr legal|hipaa legal|soc 2 audit|iso 27001 audit)\b/.test(lower),
    unsafe: /\b(hack|exploit|bypass|steal|phish|malware|credential|password|token|private key|dox|scrape personal|unhackable)\b/.test(lower),
  };
}

export function workspaceProfile(prompt: string): WorkspaceProfile {
  const lower = normalizePromptForIntent(prompt).toLowerCase();
  if (/\b(video|veo|veo 3|storyboard|mp4|render|text-to-video|generate video)\b/.test(lower)) {
    const wantsSources = /\b(source|sources|api|provider|lookup|current|latest|internet|online)\b/.test(lower);
    return {
      title: "Video Workbench",
      audience: "Creator",
      promise: "A video job workspace opens with storyboard, scene script, render prompt, safety notes, source-check target, and approval path.",
      primaryAction: "Prepare render brief",
      modules: ["Storyboard", "Shot list", "Render prompt", "Source check", "Approval gate"],
      lookupUrl: wantsSources ? `https://www.google.com/search?q=${encodeURIComponent("video generation API source documentation")}` : undefined,
      lookupLabel: wantsSources ? "Open video API source check" : undefined,
    };
  }
  if (/\b(audio|voice|podcast|narration|speech|text-to-speech|tts|sound|multilingual audio)\b/.test(lower)) {
    return {
      title: "Audio Workbench",
      audience: "Creator",
      promise: "An audio job workspace opens with voice brief, narration script, transcript, consent notes, localization notes, and render gate.",
      primaryAction: "Prepare audio brief",
      modules: ["Voice brief", "Narration script", "Transcript", "Consent gate", "Export path"],
    };
  }
  if (/\b(small business|smb|local business|shop|restaurant|clinic|salon|agency|solo operator|owner operator|retailer|tradesperson)\b/.test(lower)) {
    return {
      title: "Small-Business Growth Workspace",
      audience: "Small business",
      promise: "A practical business surface opens with customer intake, offer copy, quote/invoice path, simple automation, proof notes, and a downloadable action pack.",
      primaryAction: "Win the next customer",
      modules: ["Customer intake", "Offer page", "Quote and invoice", "Follow-up automation", "Download pack"],
    };
  }
  const company = extractCompanyTarget(prompt);
  if (company) {
    return {
      title: `${company.label} Opportunity Workspace`,
      audience: company.label,
      promise: `A company-specific browser/research surface that turns public signals into a tailored Active Mirror help plan for ${company.label}.`,
      primaryAction: "Map the opportunity",
      modules: ["Company browser", "Need map", "Generated solution", "Outreach brief"],
      lookupUrl: company.url,
      lookupLabel: company.sourceLabel,
    };
  }
  if (/\b(lookup|internet|online|source|sources|citation|citations|research|browse|browser|current|latest|news|who is|what is available|market trends)\b/.test(lower)) {
    const query = cleanIntent(prompt);
    return {
      title: "Research Browser Workspace",
      audience: "Research user",
      promise: "A browser-style lookup workspace with source targets, proof notes, downloadable brief, and a scoped demo path.",
      primaryAction: "Open source path",
      modules: ["Search surface", "Source notes", "Research brief", "Downloadable spec"],
      lookupUrl: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      lookupLabel: "Open research search",
    };
  }
  if (/\bteam\b/.test(lower)) {
    return {
      title: "Team Project Workspace",
      audience: "Team",
      promise: "A shared project app with roles, timeline, handoff file, and export pack.",
      primaryAction: "Assign next step",
      modules: ["Project room", "Role lane", "Handoff file", "Decision log"],
    };
  }
  if (/\benterprise\b/.test(lower)) {
    return {
      title: "Enterprise Pilot Workspace",
      audience: "Enterprise",
      promise: "A buyer-ready pilot surface with trust-by-design notes, rollout plan, and reviewed access path.",
      primaryAction: "Scope pilot",
      modules: ["Use-case intake", "Trust brief", "Pilot plan", "Access gate"],
    };
  }
  if (/\bgovernment|public-sector|public sector|civic\b/.test(lower)) {
    return {
      title: "Public-Service Workspace",
      audience: "Public sector",
      promise: "A civic-service preview with consent boundary, evidence checklist, proof surface, and reviewed access path.",
      primaryAction: "Prepare brief",
      modules: ["Service brief", "Consent boundary", "Evidence checklist", "Review path"],
    };
  }
  if (/\bexplainer|one-pager|deck\b/.test(lower)) {
    return {
      title: "Explainer Studio",
      audience: "Storytelling",
      promise: "A generated explainer surface with narrative, visuals, proof notes, and downloadable formats.",
      primaryAction: "Export explainer",
      modules: ["Hero explainer", "Storyboard", "Proof notes", "Download pack"],
    };
  }
  if (/\bindividual|personal\b/.test(lower)) {
    return {
      title: "Personal Finish App",
      audience: "Individual",
      promise: "A personal project app with a finish plan, research pane, export pack, and next step.",
      primaryAction: "Finish task",
      modules: ["Task brief", "Focus lane", "Research pane", "Export pack"],
    };
  }
  return {
    title: "Live Workspace Preview",
    audience: "Visitor",
    promise: "A custom app-like workspace generated from the request, with a preview, artifacts, and download path.",
    primaryAction: "Generate output",
    modules: ["Request desk", "Working surface", "Proof note", "Export pack"],
  };
}
