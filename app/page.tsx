"use client";

import { useEffect, useRef, useState } from "react";
import {
  trackArtifactOpened,
  trackContactIntent,
  trackCtaClicked,
  trackProjectLinkClicked,
} from "./lib/analytics";

const principles = [
  {
    index: "01",
    assumption: "We sell AI.",
    title: "We redesign how work gets done.",
    body: "AI is today’s best tool. It still has to earn its place in the system.",
  },
  {
    index: "02",
    assumption: "Start with the stack.",
    title: "Start with the business.",
    body: "Tools are answers. We begin with the constraint, handoff, or decision that keeps slowing you down.",
  },
  {
    index: "03",
    assumption: "Automate everything.",
    title: "Protect human judgment.",
    body: "Specialized agents handle the repetition. A few people keep the consequential calls.",
  },
  {
    index: "04",
    assumption: "Bill the hours.",
    title: "Own the outcome.",
    body: "Hours returned, decisions improved, margin created. Shipping alone is not proof.",
  },
] as const;

const processSteps = [
  {
    index: "01",
    title: "Find the friction",
    detail: "A constraint, handoff, or repeated decision.",
  },
  {
    index: "02",
    title: "Redesign the system",
    detail: "Clarify the rules, roles, and flow of work.",
  },
  {
    index: "03",
    title: "Assign the judgment",
    detail: "Agents repeat. People make the consequential calls.",
  },
  {
    index: "04",
    title: "Measure the outcome",
    detail: "Track time returned, quality, and margin created.",
  },
] as const;

const artifacts = {
  krekib: {
    index: "01",
    name: "Krekib",
    status: "live / researching",
    role: "Buying guides that reward craft over noise",
    url: "https://krekib.com",
    host: "krekib.com",
    question: "Can buying advice reward craft instead of whoever shouts loudest?",
    experiment:
      "Agents compare thousands of sources. Human judgment decides what deserves weight.",
    finding: "More information is useless until someone decides what matters.",
  },
  cejour: {
    index: "02",
    name: "CeJour",
    status: "live / producing",
    role: "Quiet systems that keep a brand moving",
    url: "https://cejour.la",
    host: "cejour.la",
    question: "Can a brand keep moving without consuming the people who give it taste?",
    experiment:
      "A quiet system writes, composes, and publishes. Humans keep the consequential decisions.",
    finding: "Automation matters most when it protects human attention.",
  },
} as const;

type ArtifactKey = keyof typeof artifacts;

export default function Home() {
  const [artifact, setArtifact] = useState<ArtifactKey | null>(null);
  const [problem, setProblem] = useState("");
  const [showHeader, setShowHeader] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  const unresolved =
    problem.trim() || "The part of our business that feels harder than it should is…";
  const mailto = `mailto:hello@alt-txt.com?subject=${encodeURIComponent(
    "An unresolved question",
  )}&body=${encodeURIComponent(unresolved)}`;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (artifact && !dialog.open) {
      trackArtifactOpened(artifact);
      dialog.showModal();
    }
    if (!artifact && dialog.open) dialog.close();
  }, [artifact]);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => setShowHeader(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-72px 0px 0px 0px" },
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (!nodes.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      nodes.forEach((node) => node.classList.add("is-visible"));
      return;
    }

    nodes.forEach((node) => {
      if (node.getBoundingClientRect().top < window.innerHeight * 0.92) {
        node.classList.add("is-visible");
      } else {
        node.classList.add("reveal-pending");
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.remove("reveal-pending");
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="site">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <div className="paper-grain" aria-hidden="true" />
      <div className="registration registration-one" aria-hidden="true">
        +
      </div>
      <div className="registration registration-two" aria-hidden="true">
        +
      </div>

      <header
        className={`site-header ${showHeader ? "is-visible" : ""}`}
        aria-hidden={!showHeader}
        inert={showHeader ? undefined : true}
      >
        <a className="site-wordmark" href="#hero" translate="no">
          ALT-TXT
        </a>
        <nav className="site-nav" aria-label="Primary">
          <a href="#manifesto">Manifesto</a>
          <a href="#experiments">Experiments</a>
        </nav>
        <a
          className="header-cta"
          href="#question"
          onClick={() => trackCtaClicked("header")}
        >
          Bring us a hard thing <span aria-hidden="true">↗</span>
        </a>
      </header>

      <main id="main-content" tabIndex={-1}>
        <section ref={heroRef} className="hero" id="hero" aria-labelledby="hero-brand">
          <p className="hero-brand" id="hero-brand" translate="no">
            ALT-TXT
          </p>
          <div className="hero-copy">
            <p className="hero-premise">
              <del>We sell AI.</del>
            </p>
            <h1 className="hero-title">We redesign how work gets done.</h1>
            <p className="hero-support">
              Together, we find the decisions and handoffs slowing you down. Then we use AI
              where it earns its place.
            </p>
            <div className="hero-actions">
              <a
                className="button-primary"
                href="#question"
                onClick={() => trackCtaClicked("hero_primary")}
              >
                Bring us a hard thing
              </a>
              <a
                className="button-secondary"
                href="#manifesto"
                onClick={() => trackCtaClicked("hero_secondary")}
              >
                Read the manifesto <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
        </section>

        <section className="work-system" aria-labelledby="work-system-title">
          <div className="work-system-inner">
            <div className="work-system-heading" data-reveal>
              <p className="section-kicker">How the work changes</p>
              <h2 id="work-system-title">Turn friction into measurable progress.</h2>
            </div>
            <ol className="system-flow">
              {processSteps.map((step) => (
                <li key={step.index} data-reveal>
                  <span className="system-index" aria-hidden="true">
                    {step.index}
                  </span>
                  <span className="system-step-copy">
                    <strong>{step.title}</strong>
                    <span>{step.detail}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          className="section manifesto"
          id="manifesto"
          aria-labelledby="manifesto-title"
        >
          <span className="manifesto-mark" aria-hidden="true">
            REVISE
          </span>
          <div className="section-intro" data-reveal>
            <p className="section-kicker">A working manifesto</p>
            <h2 id="manifesto-title">Question the assumption. Keep what matters.</h2>
            <p className="section-support">
              Most AI projects start with an answer already chosen. We start with the people
              closest to the work, find the friction together, then design a system around what
              matters.
            </p>
          </div>

          <ol className="principle-list principle-list-desktop">
            {principles.map((item) => (
              <li key={item.index} data-reveal>
                <span className="principle-index" aria-hidden="true">
                  {item.index}
                </span>
                <p className="principle-assumption">
                  <del>{item.assumption}</del>
                  <span className="principle-arrow" aria-hidden="true">
                    →
                  </span>
                </p>
                <div className="principle-revision">
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <ol className="principle-list principle-list-mobile">
            {principles.map((item) => (
              <li key={item.index}>
                <details data-reveal>
                  <summary>
                    <span className="principle-index" aria-hidden="true">
                      {item.index}
                    </span>
                    <span className="principle-mobile-head">
                      <span className="principle-assumption">
                        <del>{item.assumption}</del>
                      </span>
                      <strong>{item.title}</strong>
                    </span>
                    <span className="principle-toggle" aria-hidden="true">
                      +
                    </span>
                  </summary>
                  <p>{item.body}</p>
                </details>
              </li>
            ))}
          </ol>
        </section>

        <section
          className="section experiments"
          id="experiments"
          aria-labelledby="experiments-title"
        >
          <div className="section-intro" data-reveal>
            <p className="section-kicker">Live experiments</p>
            <h2 id="experiments-title">What the work taught us.</h2>
            <p className="section-support">
              Every experiment should leave the next decision sharper.
            </p>
          </div>

          <ul className="project-list" aria-label="Live experiments">
            {(Object.keys(artifacts) as ArtifactKey[]).map((key) => {
              const project = artifacts[key];
              return (
                <li key={key} data-reveal>
                  <button
                    type="button"
                    className="project-card"
                    onClick={() => setArtifact(key)}
                    aria-label={`Read the ${project.name} experiment trace`}
                  >
                    <span
                      className={`project-visual project-visual-${key}`}
                      aria-hidden="true"
                    >
                      {key === "krekib" ? (
                        <>
                          <span className="visual-head">
                            <span>Source matrix</span>
                            <span>1,284 signals</span>
                          </span>
                          <span className="signal-stack">
                            <span>
                              <em>Craft</em>
                              <i />
                              <b>82</b>
                            </span>
                            <span>
                              <em>Evidence</em>
                              <i />
                              <b>71</b>
                            </span>
                            <span>
                              <em>Noise</em>
                              <i />
                              <b>19</b>
                            </span>
                          </span>
                          <span className="visual-note">Judgment applied / 01</span>
                        </>
                      ) : (
                        <>
                          <span className="visual-head">
                            <span>Publishing queue</span>
                            <span>Live</span>
                          </span>
                          <span className="quiet-pipeline">
                            <span>
                              <i />
                              <b>Draft</b>
                              <em>09:00</em>
                            </span>
                            <span>
                              <i />
                              <b>Compose</b>
                              <em>11:30</em>
                            </span>
                            <span>
                              <i />
                              <b>Publish</b>
                              <em>14:00</em>
                            </span>
                          </span>
                          <span className="visual-note">Human approval held / 02</span>
                        </>
                      )}
                    </span>
                    <span className="project-card-copy">
                      <span className="project-meta">
                        <strong>{project.name}</strong>
                        <em>{project.status}</em>
                      </span>
                      <strong className="project-finding">{project.finding}</strong>
                      <span className="project-action" aria-hidden="true">
                        Read the trace <span>↗</span>
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="section question" id="question" aria-labelledby="question-title">
          <div className="question-layout">
            <div className="question-copy" data-reveal>
              <p className="section-kicker">One unresolved thing / 05</p>
              <h2 id="question-title">What feels harder than it should?</h2>
              <p>
                Bring us the question before it becomes a brief.
              </p>
            </div>

            <div className="problem-trace" data-reveal>
              <label className="sr-only" htmlFor="unresolved-problem">
                The part of your business that feels harder than it should
              </label>
              <textarea
                id="unresolved-problem"
                name="unresolved-problem"
                autoComplete="off"
                spellCheck
                rows={4}
                value={problem}
                onChange={(event) => setProblem(event.target.value)}
                placeholder="The handoff between sales and operations keeps…"
                aria-describedby="problem-hint"
              />
              <div className="problem-actions">
                <small id="problem-hint">No deck. 2 sentences are enough.</small>
                <a
                  href={mailto}
                  aria-describedby="problem-hint"
                  onClick={() => trackContactIntent(problem.trim().length > 0)}
                >
                  Open email draft <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <p translate="no">ALT-TXT</p>
        <a href="mailto:hello@alt-txt.com">hello@alt-txt.com</a>
      </footer>

      <dialog
        ref={dialogRef}
        className="artifact-dialog"
        onClose={() => setArtifact(null)}
        aria-labelledby="artifact-title"
        aria-describedby="artifact-status"
      >
        {artifact && (
          <div className="artifact-sheet">
            <div className="artifact-sheet-head">
              <span>Experiment / {artifacts[artifact].index}</span>
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                aria-label="Close project details"
              >
                Close <span aria-hidden="true">×</span>
              </button>
            </div>

            <div className="artifact-sheet-intro">
              <p className="artifact-status" id="artifact-status">
                {artifacts[artifact].status}
              </p>
              <h2 id="artifact-title">{artifacts[artifact].name}</h2>
              <p className="artifact-role">{artifacts[artifact].role}</p>
            </div>

            <dl className="artifact-facts">
              <div>
                <dt>The question</dt>
                <dd>{artifacts[artifact].question}</dd>
              </div>
              <div>
                <dt>What we tried</dt>
                <dd>{artifacts[artifact].experiment}</dd>
              </div>
              <div>
                <dt>What we learned</dt>
                <dd>{artifacts[artifact].finding}</dd>
              </div>
            </dl>

            <div className="artifact-sheet-footer">
              <a
                className="artifact-project-link"
                href={artifacts[artifact].url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackProjectLinkClicked(artifacts[artifact].name, artifacts[artifact].host)
                }
              >
                Visit {artifacts[artifact].host} <span aria-hidden="true">↗</span>
              </a>
              <button
                type="button"
                className="artifact-dismiss"
                onClick={() => dialogRef.current?.close()}
              >
                Back to the work
              </button>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
