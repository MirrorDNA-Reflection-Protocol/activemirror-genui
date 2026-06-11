"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import SiteTelemetry from "./SiteTelemetry";

export default function ActiveMirrorSite() {
  return (
    <main className="site" id="top">
      <SiteTelemetry surface="public_site" />
      
      <nav id="rail" aria-label="Page sections">
        <a href="#hero" data-rail="hero"><span className="dot"></span><span className="lbl">⟡</span></a>
        <a href="#what-it-does" data-rail="results"><span className="dot"></span><span className="lbl">RESULTS</span></a>
        <a href="#fit" data-rail="fit"><span className="dot"></span><span className="lbl">FIT</span></a>
        <a href="#proof" data-rail="proof"><span className="dot"></span><span className="lbl">PROOF</span></a>
        <a href="#route" data-rail="route"><span className="dot"></span><span className="lbl">ROUTE</span></a>
        <a href="#work-with-us" data-rail="start"><span className="dot"></span><span className="lbl">START</span></a>
      </nav>

      <header>
        <div className="wrap nav">
          <Link className="brand" href="#hero"><span className="glyph">⟡</span>Active Mirror</Link>
          <div className="nav-links">
            <a href="#what-it-does">Results</a>
            <a href="#proof">Proof</a>
            <a href="#work-with-us">Start</a>
          </div>
          <div className="nav-cta">
            <span className="nav-note">review before action</span>
            <Link className="btn btn-ghost btn-sm" href="/mirror">Try workspace <span className="arr">→</span></Link>
          </div>
        </div>
      </header>

      <section id="hero">
        <div className="glyph-bg" aria-hidden="true">⟡</div>
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Trust by Design · N1 Intelligence</p>
            <h1 className="h-display">Show<br/>the <em>work.</em></h1>
            <p className="lede hero-sub">Bring one AI workflow. Leave with a reviewable workspace — sources, assumptions, gaps, and approvals kept visible, so your team can act on the result.</p>
            <div className="hero-ctas">
              <Link className="btn btn-primary" href="/intake?focus=pilot">Apply with one workflow <span className="arr">→</span></Link>
              <Link className="btn btn-ghost" href="/mirror">Try the public workspace</Link>
            </div>
            <p className="hero-fine">We scope it first. If it fits, <b>a working proof in 72 hours.</b> If not, a clear no.</p>
          </div>

          <div className="brief" id="brief" aria-label="Sample reviewable workspace, animated demonstration">
            <div className="brief-head">
              <span className="brief-title"><span className="g">⟡</span> WORKSPACE — vendor-evidence-brief</span>
              <span className="brief-sample">sample · not live</span>
            </div>
            <div className="brief-body" id="briefBody">
              <div className="b-line" data-s="1"><span className="b-k">OBJECTIVE</span><span className="b-t"><strong>Pick a payments vendor</strong> for the India rollout</span></div>
              <div className="b-div" data-s="2"></div>
              <div className="b-line" data-s="3"><span className="chip chip-fact">FACT</span><span className="b-t">Vendor A clears UPI + cards domestically</span><span className="b-src">src: RBI register ▸</span></div>
              <div className="b-line" data-s="4"><span className="chip chip-fact">FACT</span><span className="b-t">Quote: ₹2.4L/yr at current volume</span><span className="b-src">src: vendor-quote.pdf ▸</span></div>
              <div className="b-line" data-s="5"><span className="chip chip-assumed">ASSUMED</span><span className="b-t">Volume grows ~30% by Q4 — owner estimate</span><span className="b-needs">needs: finance sign-off</span></div>
              <div className="b-line" data-s="6"><span className="chip chip-gap">GAP</span><span className="b-t">No security audit sighted for Vendor B</span><span className="b-ask">ask: request audit letter</span></div>
              <div className="b-div" data-s="7"></div>
              <div className="b-line" data-s="8" style={{display:'block'}}>
                <div className="gate" id="gate">
                  <div className="gate-q"><span className="chip chip-gate">GATE</span>&nbsp; Send data-sharing request to Vendor A?</div>
                  <div className="gate-row">
                    <button className="gate-btn gate-approve" id="btnApprove">APPROVE</button>
                    <button className="gate-btn gate-hold" id="btnHold">HOLD</button>
                    <span className="gate-status" id="gateStatus"><span className="gate-dot"></span><span id="gateText">awaiting your approval — nothing runs yet</span></span>
                  </div>
                </div>
              </div>
              <div className="b-line" data-s="9" id="nextLine"><span className="b-k">NEXT</span><span className="b-t b-locked" id="nextText">unlocks after approval</span></div>
              <div className="b-line" data-s="10"><span className="b-receipt"><span className="g">⟡</span> receipt <span id="rcptHash"></span> · every step logged</span></div>
            </div>
          </div>
        </div>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track" id="mtrack">
          <span>Shows what it used <i>⟡</i></span><span>Names what is missing <i>⟡</i></span><span>Asks before sensitive steps <i>⟡</i></span><span>Gives you the next move <i>⟡</i></span>
        </div>
      </div>

      <section id="what-it-does" className="band" data-rail="results">
        <div className="wrap">
          <p className="eyebrow rv">What you leave with</p>
          <h2 className="h-section rv">Get the thing, not a chat transcript.</h2>
          <div className="out-grid">
            <div className="out-card rv">
              <span className="chip chip-fact">WORKSPACE</span>
              <h3>Built to be used.</h3>
              <p>Briefs, plans, review packets, checklists, and workflows are built as usable workspaces.</p>
            </div>
            <div className="out-card rv">
              <span className="chip chip-assumed">EVIDENCE</span>
              <h3>Know what to trust.</h3>
              <p>Sources, assumptions, and gaps are kept separate so your team can review the work quickly.</p>
            </div>
            <div className="out-card rv">
              <span className="chip chip-gate">NEXT</span>
              <h3>Move from answer to action.</h3>
              <p>The next approval, source check, export, or handoff is visible before anything sensitive runs.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="fit" className="band" data-rail="fit">
        <div className="wrap fit-grid">
          <div>
            <p className="eyebrow rv">The fit test</p>
            <h2 className="h-section rv">Give us one workflow your current AI cannot safely finish.</h2>
            <p className="lede rv" style={{marginTop:'24px'}}>We do not promise every workflow is a fit. We qualify it first. If we cannot make it clearer, more usable, and safer to act on, we say that early instead of wasting your time.</p>
            <div className="rv" style={{marginTop:'36px'}}><Link className="btn btn-primary" href="/intake?focus=pilot">Apply with one workflow <span className="arr">→</span></Link></div>
          </div>
          <div className="fit-steps">
            <div className="fit-step rv"><span className="n">1</span><p>Send one workflow your current AI cannot safely finish.</p><p className="sub">A concrete process with a real owner, deadline, and review need.</p></div>
            <div className="fit-step rv"><span className="n">2</span><p>We scope it first. If it fits, we build a working proof in 72 hours.</p><p className="sub">If it is not a fit, we say so plainly.</p></div>
            <div className="fit-step rv"><span className="n">3</span><p>You see what works, what is missing, and what it would take to deploy.</p><p className="sub">No silent data access. No slide-only demo.</p></div>
          </div>
        </div>
      </section>

      <section id="proof" className="band" data-rail="proof">
        <div className="wrap">
          <p className="eyebrow rv">What the sprint produces</p>
          <h2 className="h-section rv">No pitch theatre. A useful proof or a clear no.</h2>
          <p className="lede rv" style={{marginTop:'24px'}}>For accepted workflows, the 72-hour sprint ends with a working artifact your team can inspect.</p>
          <div className="ledger">
            <div className="ledger-card rv"><span className="lk">Scope</span><h3>A no-nonsense fit decision</h3><p>We name the business result, the data needed, the approval points, and the reason to proceed or stop.</p></div>
            <div className="ledger-card rv"><span className="lk">Workspace</span><h3>A working proof on your workflow</h3><p>A usable surface for the task: brief, source desk, checklist, form, review lane, or workflow board.</p></div>
            <div className="ledger-card rv"><span className="lk">Evidence</span><h3>A visible trail of assumptions and gaps</h3><p>What ran, what was assumed, what still needs a source, and what needs human approval — kept separate.</p></div>
            <div className="ledger-card rv"><span className="lk">Next</span><h3>A clear deploy-or-don't plan</h3><p>The smallest real deployment path, the blockers, and the cost and risk boundary before more work starts.</p></div>
          </div>
        </div>
      </section>

      <section id="route" className="band" data-rail="route">
        <div className="wrap">
          <p className="eyebrow rv">Built for review</p>
          <h2 className="h-section rv">It shows what happened, so your team can use the result.</h2>
          <p className="lede rv" style={{marginTop:'24px'}}>You should not have to guess what the AI used, skipped, assumed, or still needs from you.</p>
          <div className="route-wrap">
            <div className="route-line"><div className="route-fill" id="routeFill"></div></div>
            <div className="route-steps" id="routeSteps">
              <div className="route-step"><span className="nd"></span><h4>Ask for the result</h4><p>Say the business task, audience, and deadline.</p></div>
              <div className="route-step"><span className="nd"></span><h4>Review the route</h4><p>See sources needed, assumptions made, and questions still open.</p></div>
              <div className="route-step"><span className="nd"></span><h4>Approve sensitive steps</h4><p>Files, accounts, devices, and sends wait until the route is clear.</p></div>
              <div className="route-step"><span className="nd"></span><h4>Use the output</h4><p>Export the brief, hand off the workflow, or keep refining the workspace.</p></div>
            </div>
          </div>
          <div className="route-links rv">
            <Link href="/proof-sprint">See proof sprint sample</Link>
            <Link href="/trust">Review boundary</Link>
            <Link href="/glass">Public evidence examples</Link>
            <Link href="/compare">Compare</Link>
          </div>
        </div>
      </section>

      <section className="band" data-rail="route">
        <div className="wrap">
          <p className="eyebrow rv">Where it helps</p>
          <h2 className="h-section rv">Use it for the work people already bring to AI.</h2>
          <div className="where-grid">
            <div className="where-cell rv"><span className="wk">Teams</span><h3>Finish the work without fighting the AI.</h3><p>Decisions, research, documents, plans, and next actions in one workspace instead of a long chat thread.</p></div>
            <div className="where-cell rv"><span className="wk">Companies</span><h3>Move faster without losing control.</h3><p>Repeatable workflows, review before action, private context only when approved, and outputs teams can reuse.</p></div>
            <div className="where-cell rv"><span className="wk">Public sector</span><h3>Use AI with local trust and public accountability.</h3><p>Language, data boundaries, review trails, and service workflows that can be inspected before they affect citizens.</p></div>
            <div className="where-cell rv"><span className="wk">National programs</span><h3>Build capacity instead of depending on one vendor.</h3><p>A path to local models, local workflows, local records, and national-language use cases without pretending models are magic.</p></div>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <p className="eyebrow rv">Why it feels different</p>
          <h2 className="h-section rv">Not a smarter chat box. A way to make AI work usable.</h2>
          <p className="lede rv" style={{marginTop:'24px'}}>The model can be powerful and still be wrong, blocked, or unsafe to act. Active Mirror makes that visible and turns the request into work anyway.</p>
          <div className="diff-rows">
            <div className="diff-row rv"><h3>It works on your actual task.</h3><p>The 72-hour sprint is built around one qualified workflow you care about, not a canned prompt or a slide deck.</p></div>
            <div className="diff-row rv"><h3>It admits what it cannot know.</h3><p>Missing facts, blocked access, and unverified sources stay visible instead of being smoothed into a confident answer.</p></div>
            <div className="diff-row rv"><h3>It routes work by sensitivity.</h3><p>Public text work, image and video briefs, design handoffs, and sensitive private routes stay separated, so the right tool is approved for the right job.</p></div>
            <div className="diff-row rv"><h3>It creates a work surface, not just text.</h3><p>The result can become a brief, checklist, board, review lane, source queue, export, or repeatable workflow.</p></div>
          </div>
          <p className="pull rv"><span className="g">⟡</span>The point is not to admire the AI. The point is to get the decision, plan, review, or workflow finished with less risk.</p>
        </div>
      </section>

      <section id="work-with-us" className="band" data-rail="start">
        <div className="wrap">
          <p className="eyebrow rv">Start</p>
          <h2 className="h-section rv">Pick the result you want first.</h2>
          <p className="lede rv" style={{marginTop:'24px'}}>Start with one real workflow. The first deliverable should be useful even before a full deployment.</p>
          <div className="start-grid">
            <div className="start-card featured rv">
              <span className="start-tag">Recommended first</span>
              <h3>72-hour proof sprint</h3>
              <p>Send one serious workflow. We scope it first. If it fits, we build a working Active Mirror proof around that exact workflow within 72 hours.</p>
              <ul className="start-list">
                <li>Your workflow, not a canned example</li>
                <li>Working workspace and review path</li>
                <li>What is live, assumed, and still needed</li>
              </ul>
              <Link className="btn btn-primary" href="/intake?focus=pilot">Start here <span className="arr">→</span></Link>
            </div>
            <div className="start-card rv">
              <span className="start-tag">Sensitive work</span>
              <h3>Private-context workflow</h3>
              <p>For work that needs files, accounts, or team knowledge without silent access.</p>
              <ul className="start-list">
                <li>Approval path</li>
                <li>Safe context plan</li>
                <li>Export and review rules</li>
              </ul>
              <Link className="btn btn-ghost" href="/intake?focus=pilot">Plan the workflow <span className="arr">→</span></Link>
            </div>
            <div className="start-card rv">
              <span className="start-tag">Deployment</span>
              <h3>AI rollout control</h3>
              <p>For teams putting models into real workflows and needing review before action.</p>
              <ul className="start-list">
                <li>Local or cloud deployment</li>
                <li>Model and tool routing</li>
                <li>Operational handoff</li>
              </ul>
              <Link className="btn btn-ghost" href="/intake?focus=pilot">Scope the rollout <span className="arr">→</span></Link>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="wrap">
          <div className="f-ledger rv">
            <div className="f-fact"><span className="k">Result</span><span className="v">Usable AI work</span></div>
            <div className="f-fact"><span className="k">Deployment</span><span className="v">Local or cloud</span></div>
            <div className="f-fact"><span className="k">Standard</span><span className="v">Show the work</span></div>
            <div className="f-fact"><span className="k">Origin</span><span className="v">Made in India</span></div>
          </div>
          <div className="f-cols">
            <div className="f-brand">
              <Link className="brand" href="#hero"><span className="glyph">⟡</span>Active Mirror</Link>
              <p>AI workspaces for decisions, briefs, plans, and workflows that need review before action.</p>
            </div>
            <div className="f-col">
              <h4>Product</h4>
              <a href="#what-it-does">What it does</a>
              <Link href="/mirror">Workspace</Link>
              <Link href="/trust">Review boundary</Link>
              <Link href="/glass">Evidence examples</Link>
            </div>
            <div className="f-col">
              <h4>Engage</h4>
              <Link href="/proof-sprint">72-hour proof sprint</Link>
              <Link href="/intake?focus=pilot">Scoped pilot</Link>
              <Link href="/intake?focus=workspace-proof">Workspace proof</Link>
              <Link href="/intake">General intake</Link>
            </div>
            <div className="f-col">
              <h4>Evidence</h4>
              <Link href="/compare">Compare</Link>
              <a href="#proof">Evidence path</a>
              <Link href="/glass">Public examples</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
            </div>
          </div>
          <div className="f-base">
            <p>© 2026 N1 Intelligence (OPC) Pvt Ltd ⟡ Made in India. Built for owner-controlled AI work.<br/>Active Mirror™ and Trust by Design™ are trademarks of N1 Intelligence (OPC) Pvt. Ltd.</p>
            <p className="f-receipt"><span className="g">⟡</span> page receipt <span id="fHash"></span></p>
          </div>
        </div>
      </footer>

      <Script src="/vendor/gsap.min.js" strategy="beforeInteractive" />
      <Script src="/vendor/ScrollTrigger.min.js" strategy="beforeInteractive" />
      <Script id="activemirror-logic" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `
        (function(){
          var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

          /* duplicate marquee for seamless loop */
          var mt = document.getElementById('mtrack');
          if (mt) mt.innerHTML += mt.innerHTML;

          /* ---------- hash typing ---------- */
          function typeHash(el, hash, speed, done){
            if (!el) return;
            if (reduced){ el.textContent = hash; if(done) done(); return; }
            el.textContent = '';
            var i = 0;
            var t = setInterval(function(){
              el.textContent += hash[i++];
              if (i >= hash.length){ clearInterval(t); if(done) done(); }
            }, speed);
            return t;
          }

          /* ---------- the brief: self-assembling evidence ---------- */
          var lines = Array.prototype.slice.call(document.querySelectorAll('#briefBody [data-s]'));
          var gate = document.getElementById('gate');
          var gateText = document.getElementById('gateText');
          var nextText = document.getElementById('nextText');
          var rcpt = document.getElementById('rcptHash');
          var btnApprove = document.getElementById('btnApprove');
          var btnHold = document.getElementById('btnHold');
          var timers = [], userActed = false, looping = true;

          function clearTimers(){ timers.forEach(clearTimeout); timers = []; }
          function later(fn, ms){ timers.push(setTimeout(fn, ms)); }

          function resetBrief(){
            lines.forEach(function(l){ l.classList.remove('on'); });
            if(gate) gate.classList.remove('resolved','held');
            if(gateText) gateText.textContent = 'awaiting your approval — nothing runs yet';
            if(nextText) {
              nextText.classList.add('b-locked');
              nextText.textContent = 'unlocks after approval';
            }
            if(rcpt) rcpt.textContent = '';
          }

          function approve(byUser){
            if (!gate || gate.classList.contains('resolved') || gate.classList.contains('held')) return;
            gate.classList.add('resolved');
            var now = new Date();
            var hh = ('0'+now.getHours()).slice(-2), mm = ('0'+now.getMinutes()).slice(-2);
            if(gateText) gateText.textContent = (byUser ? 'approved by you' : 'approved') + ' · logged ' + hh + ':' + mm + ' IST';
            if(nextText) {
              nextText.classList.remove('b-locked');
              nextText.innerHTML = 'Draft request → legal review → <strong>send Monday</strong>';
            }
            later(function(){
              var rl = document.querySelector('[data-s="10"]');
              if(rl) rl.classList.add('on');
              typeHash(rcpt, '4f2a91c3…77e09c1e', 36, function(){
                if (looping && !userActed) later(function(){ resetBrief(); later(play, 700); }, 5200);
              });
            }, 500);
          }

          function hold(){
            if (!gate || gate.classList.contains('resolved')) return;
            userActed = true; clearTimers();
            gate.classList.add('held');
            if(gateText) gateText.textContent = 'held by you — nothing runs until you say so';
          }

          function play(){
            clearTimers();
            var delays = [250, 750, 1150, 1600, 2100, 2650, 3150, 3500];
            lines.slice(0, 8).forEach(function(l, i){ later(function(){ l.classList.add('on'); }, delays[i]); });
            later(function(){ var nL = document.querySelector('[data-s="9"]'); if(nL) nL.classList.add('on'); }, 4100);
            later(function(){ if (!userActed) approve(false); }, 6600);
          }

          if(btnApprove) btnApprove.addEventListener('click', function(){ userActed = true; clearTimers(); approve(true); });
          if(btnHold) btnHold.addEventListener('click', hold);

          if (reduced){
            lines.forEach(function(l){ l.classList.add('on'); });
            approve(false); looping = false;
          } else {
            play();
          }

          /* footer receipt */
          var fDone = false;
          var io = new IntersectionObserver(function(es){
            es.forEach(function(e){
              if (e.isIntersecting && !fDone){ fDone = true; typeHash(document.getElementById('fHash'), 'b7d3…02ce · rendered honest', 30); }
            });
          }, {threshold:.4});
          var footerEl = document.querySelector('footer');
          if(footerEl) io.observe(footerEl);

          /* ---------- evidence rail tracking ---------- */
          var railLinks = document.querySelectorAll('#rail a');
          var railMap = {};
          railLinks.forEach(function(a){ railMap[a.getAttribute('data-rail')] = a; });
          var watched = document.querySelectorAll('#hero, [data-rail]');
          var io2 = new IntersectionObserver(function(es){
            es.forEach(function(e){
              if (!e.isIntersecting) return;
              var key = e.target.id === 'hero' ? 'hero' : e.target.getAttribute('data-rail');
              railLinks.forEach(function(a){ a.classList.remove('active'); });
              if (railMap[key]) railMap[key].classList.add('active');
            });
          }, {rootMargin:'-40% 0px -55% 0px'});
          watched.forEach(function(s){ io2.observe(s); });

          /* ---------- scroll choreography (GSAP) ---------- */
          if (!reduced && window.gsap && window.ScrollTrigger){
            gsap.registerPlugin(ScrollTrigger);

            gsap.utils.toArray('.rv').forEach(function(el){
              gsap.fromTo(el, {y:26, autoAlpha:0}, {
                y:0, autoAlpha:1, duration:.9, ease:'power2.out',
                scrollTrigger:{trigger:el, start:'top 86%'}
              });
            });

            /* hero glyph parallax drift */
            gsap.to('.glyph-bg', {
              rotation:18, yPercent:-42, ease:'none',
              scrollTrigger:{trigger:'#hero', start:'top top', end:'bottom top', scrub:1.2}
            });

            /* route line draws + steps light in true sequence */
            var steps = gsap.utils.toArray('#routeSteps .route-step');
            gsap.to('#routeFill', {
              scaleX:1, ease:'none',
              scrollTrigger:{
                trigger:'.route-wrap', start:'top 72%', end:'bottom 45%', scrub:.6,
                onUpdate:function(self){
                  steps.forEach(function(s, i){
                    s.classList.toggle('lit', self.progress >= (i+0.5)/steps.length);
                  });
                }
              }
            });
          } else {
            /* no motion: everything visible, route lit */
            document.querySelectorAll('.rv').forEach(function(el){ el.style.opacity = 1; });
            document.querySelectorAll('.route-step').forEach(function(s){ s.classList.add('lit'); });
            var rf = document.getElementById('routeFill'); if (rf) rf.style.transform = 'scaleX(1)';
          }
        })();
      `}} />
    </main>
  );
}
