"use client";

import { useEffect, useState } from "react";

const stages = [
  {
    name: "question",
    signal: "What is worth changing?",
    note: "We begin where time, money, and judgment are being lost—not where a tool happens to fit.",
  },
  {
    name: "hypothesis",
    signal: "A better way might exist.",
    note: "The smallest useful theory comes first. It should be specific enough to disprove.",
  },
  {
    name: "experiment",
    signal: "Make the idea touch reality.",
    note: "Ten lines of code, one agent, or half a process deleted. Whatever teaches us fastest.",
  },
  {
    name: "observation",
    signal: "Watch what actually changes.",
    note: "We look for evidence in decisions, margins, time returned, and work that quietly disappears.",
  },
  {
    name: "system",
    signal: "Keep only what compounds.",
    note: "The useful behavior becomes a reliable system. Everything ornamental gets removed.",
  },
  {
    name: "deployment",
    signal: "Let it become ordinary.",
    note: "The work succeeds when the new way is no longer a project. It is simply how the company operates.",
  },
  {
    name: "new question",
    signal: "What is possible now?",
    note: "Every deployment changes the business. The loop opens again from a more intelligent place.",
  },
] as const;

const artifacts = {
  krekib: {
    index: "01",
    name: "Krekib",
    status: "researching",
    description:
      "Autonomous research agents compare thousands of sources to make buying guides that value craftsmanship over marketing.",
    finding: "Finding: more information is useless until someone decides what deserves weight.",
  },
  cejour: {
    index: "02",
    name: "CeJour",
    status: "producing",
    description:
      "A creative system writes, composes, publishes, and keeps an entire brand moving with minimal human intervention.",
    finding: "Finding: automation matters most when it protects the quality of human attention.",
  },
} as const;

type ArtifactKey = keyof typeof artifacts;

export default function Home() {
  const [activeStage, setActiveStage] = useState(3);
  const [activeArtifact, setActiveArtifact] = useState<ArtifactKey>("krekib");
  const [invitationOpen, setInvitationOpen] = useState(false);
  const [fieldDate, setFieldDate] = useState("FIELD / ACTIVE");

  useEffect(() => {
    setFieldDate(
      new Intl.DateTimeFormat("en", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
        .format(new Date())
        .toUpperCase(),
    );

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cycle = window.setInterval(() => {
      setActiveStage((current) => (current + 1) % stages.length);
    }, 6800);

    return () => window.clearInterval(cycle);
  }, []);

  const selectedStage = stages[activeStage];
  const selectedArtifact = artifacts[activeArtifact];

  return (
    <main className="field">
      <div className="paper-noise" aria-hidden="true" />
      <div className="field-register" aria-label="Alt-TXT field status">
        <span className="wordmark">ALT—TXT</span>
        <span className="field-state">
          <i aria-hidden="true" /> intelligence lab
        </span>
        <time>{fieldDate}</time>
      </div>

      <div className="stratum stratum-one" aria-hidden="true" />
      <div className="stratum stratum-two" aria-hidden="true" />
      <div className="stratum stratum-three" aria-hidden="true" />
      <div className="stratum stratum-four" aria-hidden="true" />

      <div className="origin-fragment">
        <p className="eyebrow">A working belief / 001</p>
        <h1>
          We don’t sell AI.
          <span>We sell better ways of working.</span>
        </h1>
        <p className="pencil-note">AI just happens to be today’s best tool.</p>
      </div>

      <p className="marginalia marginalia-a">
        implementation is no longer
        <br />
        the bottleneck
      </p>

      <div className="live-question">
        <span>unresolved / in the field</span>
        <p>What is actually worth changing?</p>
      </div>

      <p className="marginalia marginalia-b">
        start with the business
        <br />
        not the stack
      </p>

      <div className="knowledge-current" aria-labelledby="current-title">
        <div className="current-heading">
          <p id="current-title">Knowledge current</p>
          <span>select a trace</span>
        </div>

        <ol className="stage-flow">
          {stages.map((stage, index) => (
            <li key={stage.name} className={index === activeStage ? "is-active" : ""}>
              <button
                type="button"
                aria-pressed={index === activeStage}
                onClick={() => setActiveStage(index)}
                onFocus={() => setActiveStage(index)}
              >
                <span className="stage-index">0{index + 1}</span>
                <span className="stage-name">{stage.name}</span>
                <span className="stage-node" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ol>

        <output className="active-trace" aria-live="polite">
          <span className="trace-coordinate">TRACE / 0{activeStage + 1}</span>
          <strong>{selectedStage.signal}</strong>
          <p>{selectedStage.note}</p>
        </output>

        <p className="return-current" aria-hidden="true">
          deployment changes the question <span>↗</span>
        </p>
      </div>

      <div className="operating-model">
        <p className="eyebrow">In practice / 2—5 humans</p>
        <p className="operator-statement">
          Judgment stays human.
          <span>Repetition joins the swarm.</span>
        </p>
        <div className="swarm-line" aria-label="Specialized agent capabilities">
          <span>research synthesis</span>
          <span>financial modeling</span>
          <span>operations</span>
          <span>engineering</span>
          <span>pattern finding</span>
        </div>
      </div>

      <div className="artifact-field" aria-labelledby="artifact-label">
        <div className="artifact-intro">
          <p className="eyebrow" id="artifact-label">
            Things nobody asked for
          </p>
          <p>Our experiments are not portfolio pieces. They are where the next useful question appears.</p>
        </div>

        <div className="artifact-selector" role="group" aria-label="Research artifacts">
          {(Object.keys(artifacts) as ArtifactKey[]).map((key) => {
            const artifact = artifacts[key];
            const isActive = key === activeArtifact;

            return (
              <button
                type="button"
                key={key}
                className={isActive ? "is-active" : ""}
                aria-pressed={isActive}
                onClick={() => setActiveArtifact(key)}
                onFocus={() => setActiveArtifact(key)}
              >
                <span>{artifact.index}</span>
                <strong>{artifact.name}</strong>
                <em>{artifact.status}</em>
              </button>
            );
          })}
        </div>

        <output className="artifact-reading" aria-live="polite">
          <span>ARTIFACT / {selectedArtifact.index}</span>
          <p>{selectedArtifact.description}</p>
          <small>{selectedArtifact.finding}</small>
        </output>
      </div>

      <p className="roi-fragment">
        Hours reward activity.
        <span>We would rather be rewarded for outcomes.</span>
      </p>

      <div className={`invitation ${invitationOpen ? "is-open" : ""}`}>
        <p className="eyebrow">The field remains open</p>
        <button
          type="button"
          aria-expanded={invitationOpen}
          onClick={() => setInvitationOpen((current) => !current)}
        >
          What if there’s a better way?
          <span aria-hidden="true">↘</span>
        </button>
        <div className="invitation-reveal" aria-hidden={!invitationOpen}>
          <p>Bring us the part of your business that feels harder than it should.</p>
          <a href="mailto:hello@alt-txt.com?subject=There%20might%20be%20a%20better%20way">
            Begin with the question <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>

      <div className="field-footer" aria-label="Alt-TXT closing note">
        <span>Technology is the easy part.</span>
        <span>Finding the right problem is the work.</span>
        <span>© {new Date().getFullYear()} ALT—TXT</span>
      </div>
    </main>
  );
}
