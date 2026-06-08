export type LingOSRoute =
  | "gate"
  | "video"
  | "audio"
  | "language"
  | "ecosystem"
  | "marketing"
  | "demo"
  | "ux"
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

export type PluginLane = {
  id: string;
  label: string;
  icon: "browser" | "document" | "chart" | "automation" | "media" | "review" | "lead";
  state: "prepared" | "source_ready" | "export_ready" | "review_required" | "gated";
  action: string;
  description: string;
  proof: string;
  targetUrl?: string;
};

function hasAutomationIntent(lower: string) {
  return /\b(automation|automate|workflow|watch|monitor|cron|schedule|daily|hourly|recurring|trigger|zapier|make\.com|ifttt|email me|alert me|notify)\b/.test(lower);
}

function hasDocumentIntent(lower: string) {
  return /\b(proposal|document|pdf|pdf-ready|one-pager|one pager|brief|spec|report|doc|downloadable|file|export)\b/.test(lower);
}

function hasDeckIntent(lower: string) {
  return /\b(deck|slides|presentation|pitch|investor|explainer)\b/.test(lower);
}

function hasLeadIntent(lower: string) {
  return /\b(lead|waitlist|wait list|contact form|intake form|demo request|join|signup|sign up|paul@activemirror\.ai)\b/.test(lower);
}

function hasSiteAuditIntent(lower: string) {
  return /\b(audit|site audit|readiness|headers?|pwa|accessibility|csp|security scan|launch readiness|lighthouse|uptime|homepage|api stream)\b/.test(lower);
}

function hasFocusHarnessIntent(lower: string) {
  return /\b(neurodivergent|nd mode|adhd|autism|autistic|spectrum|assistive|at mode|focus mode|low-noise|low noise|time box|timebox)\b/.test(lower);
}

function hasFinishModeIntent(lower: string) {
  return /\b(scattered|too many ideas|overwhelmed|finish one|park the rest|momentum|one useful artifact|one artifact now|done-enough|done enough)\b/.test(lower);
}

function hasOfficialDemoIntent(lower: string) {
  return /\b(official demo|official active mirror|product demo|working product|people can demo|canonical demo|official working product|strategy route)\b/.test(lower) ||
    /\b(implementation and strategy|strategy and implementation)\b/.test(lower);
}

function hasClientIntakeIntent(lower: string) {
  return /\b(client intake|customer intake|intake workspace|intake form|collect goals|collect files|file slots|approval states|approvals|handoff pack|demo scope|72-hour demo scope|72 hour demo scope)\b/.test(lower);
}

function hasPublicSectorEvidenceIntent(lower: string) {
  return /\b(public-sector|public sector|government|civic|gcc|procurement|digital identity|service-delivery|service delivery|evidence brief|evidence desk|reviewer-ready|reviewer ready)\b/.test(lower);
}

function hasUxFeedbackIntent(lower: string) {
  const feedback = /\b(polish|hard to use|difficult to use|confusing|clunky|messy|too much|overwhelming|not intuitive|friction|cleanup|clean up|make it easier|make it simple|simplify|hard to read|cutoff|cannot scroll|can't scroll|unable to scroll|repeated|repetitive|too many cards|generic cards|canned|needs polish|need polish|needs work|need work)\b/.test(lower);
  const designFeedback = /\b(uxui|uiux|ux\/ui|ui\/ux|ux|interface|design)\b/.test(lower) &&
    /\b(still|need|needs|polish|improve|fix|better|bad|hard|difficult|confusing|clunky|messy|overwhelming)\b/.test(lower);
  return feedback || designFeedback;
}

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
  const hasOfficialDemo = hasOfficialDemoIntent(lower);
  const hasBuildArtifact = hasSmallBusiness || hasClientIntakeIntent(lower) || hasAutomationIntent(lower) || hasDocumentIntent(lower) || hasDeckIntent(lower) || hasLeadIntent(lower) || hasFinishModeIntent(lower) || hasFocusHarnessIntent(lower) || /\b(demo|app preview|generated app|workspace|form|calculator)\b/.test(lower);
  const hasMarketing = /\b(marketing|positioning|campaign|launch|sales|copy|brand|pricing|commercial|mirrorprod)\b/.test(lower);

  if (/\b(hack|exploit|bypass|steal|phish|malware|credential|password|token|private key|dox|scrape personal|unhackable)\b/.test(lower)) {
    return { route: "gate", tokens: [...tokens, "GATE", "STOP"], needsProof: true };
  }
  if (hasUxFeedbackIntent(lower)) return { route: "ux", tokens: [...tokens, "UX", "FIX", "POLISH"], needsProof: false };
  if (hasOfficialDemo && !hasClientIntakeIntent(lower)) return { route: "demo", tokens: [...tokens, "DEMO", "WORK", "PROOF", "EXPORT"], needsProof: true };
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
    software: hasOfficialDemoIntent(lower) || hasClientIntakeIntent(lower) || hasPublicSectorEvidenceIntent(lower) || hasUxFeedbackIntent(lower) || /\b(software-on-demand|software on demand|app preview|generated app|generate an app|website preview|workspace|dashboard|calculator|form|explainer|one-pager|deck|download|export pack|individual|team|enterprise|public-sector|public sector|government|small business|smb|local business|shop|restaurant|clinic|salon)\b/.test(lower) || hasAutomationIntent(lower) || hasDocumentIntent(lower) || hasLeadIntent(lower) || hasFinishModeIntent(lower) || hasFocusHarnessIntent(lower) || hasSiteAuditIntent(lower),
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
  if (hasUxFeedbackIntent(lower)) {
    return {
      title: "UX Repair Workspace",
      audience: "Visitor",
      promise: "A cleaner workspace opens with the next action, the current issue, the visible fix, and one downloadable cleanup plan instead of repeated generic surfaces.",
      primaryAction: "Simplify flow",
      modules: ["What feels hard", "Immediate fix", "Cleaner workspace", "Proof and export"],
    };
  }
  if (hasClientIntakeIntent(lower)) {
    return {
      title: "Client Intake Workspace",
      audience: "Client-facing team",
      promise: "A working intake builder opens with goals, file slots, approval states, demo scope, exportable handoff, and reviewed activation path.",
      primaryAction: "Build intake",
      modules: ["Goal capture", "File slots", "Approval states", "72-hour scope", "Handoff pack"],
    };
  }
  if (hasOfficialDemoIntent(lower)) {
    return {
      title: "Official Product Demo Workspace",
      audience: "Demo visitor",
      promise: "A real visitor starts with one request and gets a generated workspace, proof boundary, export pack, and reviewed 72-hour demo route without seeing private setup.",
      primaryAction: "Run demo",
      modules: ["Ask surface", "Generated workspace", "Proof boundary", "Download pack", "Demo request"],
    };
  }
  if (hasAutomationIntent(lower)) {
    return {
      title: "Automation Builder Workspace",
      audience: "Operator",
      promise: "A workflow builder opens with trigger, checks, schedule, proof receipt, alert copy, and reviewed activation path.",
      primaryAction: "Prepare automation",
      modules: ["Trigger", "Checks", "Schedule", "Receipt", "Alert path"],
    };
  }
  if (hasSiteAuditIntent(lower)) {
    const target = extractCompanyTarget(prompt);
    return {
      title: "Site Audit Workspace",
      audience: target?.label || "Website owner",
      promise: "A launch-readiness browser workspace opens with checks, evidence slots, fix list, export pack, and reviewed monitoring path.",
      primaryAction: "Prepare audit",
      modules: ["Browser check", "Readiness scan", "Fix pack", "Proof notes", "Monitor setup"],
      lookupUrl: target?.url,
      lookupLabel: target ? "Open site target" : undefined,
    };
  }
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
  if (hasPublicSectorEvidenceIntent(lower)) {
    return {
      title: "Public-Sector Evidence Desk",
      audience: lower.includes("gcc") ? "GCC public-sector buyer" : "Public-sector buyer",
      promise: "A reviewer-ready evidence workspace opens with source routes, facts, assumptions, unknowns, procurement risks, and approval gates.",
      primaryAction: "Prepare evidence brief",
      modules: ["Source route", "Facts", "Assumptions", "Unknowns", "Procurement review"],
    };
  }
  if (hasLeadIntent(lower)) {
    return {
      title: "Lead Capture Workspace",
      audience: "Buyer or visitor",
      promise: "A generated intake surface opens with form fields, consent note, routing copy, email handoff, and downloadable demo brief.",
      primaryAction: "Prepare intake",
      modules: ["Intake form", "Consent note", "Routing email", "Demo brief", "Access gate"],
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
  if (hasDeckIntent(lower)) {
    return {
      title: "Deck Studio",
      audience: "Presenter",
      promise: "A presentation workspace opens with slide map, visual direction, speaker notes, proof notes, and export path.",
      primaryAction: "Prepare deck",
      modules: ["Slide map", "Visual direction", "Speaker notes", "Proof notes", "Export path"],
    };
  }
  if (hasFinishModeIntent(lower)) {
    return {
      title: "Finish Mode Workspace",
      audience: "Focused operator",
      promise: "A low-noise finish surface opens with one artifact now, parked ideas, a proof boundary, and the smallest next action.",
      primaryAction: "Finish one artifact",
      modules: ["One artifact", "Parked ideas", "Decision", "Proof line", "Next action"],
    };
  }
  if (hasFocusHarnessIntent(lower)) {
    return {
      title: "Focus Harness Workspace",
      audience: "Neurodivergent user",
      promise: "A low-noise finish surface opens with one goal, paced steps, sensory-light controls, review gates, and export pack.",
      primaryAction: "Finish gently",
      modules: ["One goal", "Paced steps", "Low-noise lane", "Review gate", "Export pack"],
    };
  }
  if (hasDocumentIntent(lower)) {
    return {
      title: "Document Studio",
      audience: "Writer",
      promise: "A document workspace opens with outline, PDF-ready copy, proof notes, checklist, and export pack.",
      primaryAction: "Export document",
      modules: ["Outline", "Document draft", "Proof notes", "Checklist", "Export pack"],
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
    modules: ["Goal", "Preview", "Proof", "Download"],
  };
}

export function pluginLanesForPrompt(prompt: string): PluginLane[] {
  const lower = normalizePromptForIntent(prompt).toLowerCase();
  const profile = workspaceProfile(prompt);
  const lanes: PluginLane[] = [];
  const addLane = (lane: PluginLane) => {
    if (!lanes.some((existing) => existing.id === lane.id)) lanes.push(lane);
  };

  if (profile.title.includes("UX Repair")) {
    addLane({
      id: "ux_polish",
      label: "UX Polish",
      icon: "review",
      state: "prepared",
      action: "Simplify surface",
      description: "Turns feedback into a clearer screen plan, fewer repeated surfaces, stronger hierarchy, and a visible next action.",
      proof: "This is a public UI cleanup plan; no private data or hidden setup is needed.",
    });
  }

  if (profile.lookupUrl || requestIntent(prompt).lookup || requestIntent(prompt).company || hasSiteAuditIntent(lower)) {
    addLane({
      id: "browser",
      label: "Browser Source",
      icon: "browser",
      state: profile.lookupUrl ? "source_ready" : "prepared",
      action: profile.lookupUrl ? "Open target" : "Prepare lookup",
      description: "Creates a browser-style source surface when current facts, public pages, or citations matter.",
      proof: profile.lookupUrl ? "Source target is openable; claims stay assumptions until reviewed." : "No source opened yet; public claims remain assumptions.",
      targetUrl: profile.lookupUrl,
    });
  }

  if (hasPublicSectorEvidenceIntent(lower)) {
    addLane({
      id: "evidence",
      label: "Evidence Desk",
      icon: "review",
      state: "review_required",
      action: "Separate proof states",
      description: "Prepares facts, assumptions, unknowns, source routes, procurement risks, and reviewer-ready next steps.",
      proof: "Source routes are not treated as verified sources until reviewed.",
    });
  }

  if (hasDocumentIntent(lower) || hasDeckIntent(lower) || requestIntent(prompt).software || requestIntent(prompt).marketing || lanes.length === 0) {
    addLane({
      id: "document",
      label: hasDeckIntent(lower) ? "Deck Export" : "Document Export",
      icon: "document",
      state: "export_ready",
      action: hasDeckIntent(lower) ? "Prepare slide brief" : "Download markdown",
      description: hasDeckIntent(lower)
        ? "Turns the request into a slide map, speaker notes, visual direction, and proof-backed handoff."
        : "Turns the request into PDF-ready markdown, checklist, and a handoff note before deeper work spends tokens.",
      proof: "A downloadable artifact is generated in this session.",
    });
  }

  if (/\b(chart|graph|trend|market|analytics|metrics|kpi|compare|comparison|data|forecast)\b/.test(lower)) {
    addLane({
      id: "chart",
      label: "Chart Surface",
      icon: "chart",
      state: "prepared",
      action: "Create visual data view",
      description: "Prepares chart-ready interpretation for trends, comparisons, and KPI-style prompts.",
      proof: "Numbers are demo or user-provided unless source lookup is approved.",
    });
  }

  if (hasAutomationIntent(lower)) {
    addLane({
      id: "automation",
      label: "Automation Builder",
      icon: "automation",
      state: "review_required",
      action: "Generate workflow spec",
      description: "Drafts triggers, checks, schedule, alert copy, and receipt format. Live sends require approval.",
      proof: "Prepared as a spec; no automation is activated from the public preview.",
    });
  }

  if (requestIntent(prompt).video || requestIntent(prompt).audio) {
    addLane({
      id: "media",
      label: "Media Job",
      icon: "media",
      state: "gated",
      action: "Prepare render brief",
      description: "Creates storyboard, voice/script, prompt, consent, and cost notes before any render job.",
      proof: "No finished media is claimed until a real render completes.",
    });
  }

  addLane({
    id: "review",
    label: "Review Gate",
    icon: "review",
    state: requestIntent(prompt).highRisk || requestIntent(prompt).unsafe ? "review_required" : "prepared",
    action: "Check boundary",
    description: "Keeps private data, unsupported claims, legal/risk issues, unsafe workflows, and cost spikes out of public preview.",
    proof: "Boundary is visible before deeper execution.",
  });

  addLane({
    id: "lead",
    label: "Access Path",
    icon: "lead",
    state: "prepared",
    action: "Route scoped demo",
    description: "Offers a short project brief and 72-hour demo path after a useful artifact exists.",
    proof: "Lead form uses contact and project scope only.",
  });

  return lanes.slice(0, 6);
}
