"use client";

import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  trackArtifactOpened,
  trackAssumptionRejected,
  trackContactIntent,
  trackJumpToQuestion,
  trackProjectLinkClicked,
  trackRevisionReached,
} from "./lib/analytics";

const revisions = [
  {
    prefix: "WE SELL ",
    wrong: "AI",
    suffix: ".",
    truth: "WE SELL BETTER WAYS OF WORKING.",
    annotation: "The premise arrived too early.",
    proof: "Better. Now we can begin.",
    evidence: "AI just happens to be today’s best tool.",
    residue: "tool / not premise",
    kind: "origin",
  },
  {
    prefix: "START WITH THE ",
    wrong: "STACK",
    suffix: ".",
    truth: "START WITH THE BUSINESS.",
    annotation: "Tools are answers. We are not there yet.",
    proof: "Better. Now ask why.",
    evidence: "Implementation is no longer the bottleneck. Understanding is.",
    residue: "answer / before question",
    kind: "question",
  },
  {
    prefix: "AUTOMATE ",
    wrong: "EVERYTHING",
    suffix: ".",
    truth: "PROTECT HUMAN JUDGMENT.",
    annotation: "Efficiency without judgment scales the wrong thing.",
    proof: "Better. Keep what needs judgment.",
    evidence: "2–5 humans decide. Specialized agents do the repetition.",
    residue: "volume / without value",
    kind: "swarm",
  },
  {
    prefix: "SHOW THE ",
    wrong: "PORTFOLIO",
    suffix: ".",
    truth: "SHOW WHAT THE WORK TAUGHT US.",
    annotation: "Evidence is more useful than applause.",
    proof: "Better. Show the trace.",
    evidence: "Experiments leave traces. The traces improve the next decision.",
    residue: "display / without discovery",
    kind: "artifacts",
  },
  {
    prefix: "BILL THE ",
    wrong: "HOURS",
    suffix: ".",
    truth: "OWN THE OUTCOME.",
    annotation: "Activity is easy to count. Change is harder to fake.",
    proof: "Better. Measure the change.",
    evidence: "If the work creates no measurable value, we missed the point.",
    residue: "activity / mistaken for progress",
    kind: "outcome",
  },
  {
    prefix: "SEND US A ",
    wrong: "BRIEF",
    suffix: ".",
    truth: "BRING US THE QUESTION.",
    annotation: "The useful version is usually still messy.",
    proof: "Better. That is enough to start.",
    evidence: "There is room here for one more unresolved thing.",
    residue: "certainty / too soon",
    kind: "invitation",
  },
] as const;

const artifacts = {
  krekib: {
    index: "01",
    name: "Krekib",
    status: "researching / live",
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
    status: "producing / live",
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
type Phase = "assumption" | "correcting" | "truth";
type DiscardedWord = { word: string; residue: string; step: number };

const REWRITE_START = 0.2;
const REWRITE_END = 0.62;

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function rewriteFromLocal(local: number) {
  const linear = clamp((local - REWRITE_START) / (REWRITE_END - REWRITE_START));
  // Smoothstep so the correction accelerates through the middle of the scroll.
  return linear * linear * (3 - 2 * linear);
}

function phaseFromRewrite(rewrite: number): Phase {
  if (rewrite < 0.18) return "assumption";
  if (rewrite < 0.82) return "correcting";
  return "truth";
}

export default function Home() {
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<Phase>("assumption");
  const [scrollDirection, setScrollDirection] = useState<"forward" | "backward">("forward");
  const [dragging, setDragging] = useState(false);
  const [artifact, setArtifact] = useState<ArtifactKey | null>(null);
  const [problem, setProblem] = useState("");

  const fieldRef = useRef<HTMLElement>(null);
  const flowRef = useRef<HTMLDivElement>(null);
  const wrongWordRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const ignoreNextClick = useRef(false);
  const reduceMotion = useRef(false);
  const stepRef = useRef(0);
  const phaseRef = useRef<Phase>("assumption");
  const rewriteRef = useRef(0);
  const scrollRaf = useRef(0);
  const trackedAssumptions = useRef(new Set<number>());
  const trackedTruths = useRef(new Set<number>());

  const revision = revisions[step];
  const progress = `${String(step + 1).padStart(2, "0")} / ${String(revisions.length).padStart(2, "0")}`;
  const resolvedCount = phase === "truth" ? step + 1 : step;
  const discarded: DiscardedWord[] = revisions.slice(0, resolvedCount).map((item, index) => ({
    word: item.wrong,
    residue: item.residue,
    step: index,
  }));
  const statusAnnouncement =
    phase === "truth"
      ? `Revision ${progress} corrected. ${revision.truth} ${revision.evidence}`
      : phase === "correcting"
        ? `Revision ${progress} is being rewritten.`
        : `Revision ${progress}. ${revision.prefix}${revision.wrong}${revision.suffix} ${revision.annotation}`;

  const mailto = useMemo(() => {
    const unresolved = problem.trim() || "The part of our business that feels harder than it should is…";
    return `mailto:hello@alt-txt.com?subject=${encodeURIComponent(
      "An unresolved question",
    )}&body=${encodeURIComponent(unresolved)}`;
  }, [problem]);

  useEffect(() => {
    reduceMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (trackedAssumptions.current.has(step)) return;
    trackedAssumptions.current.add(step);
    trackRevisionReached(step, "assumption");
  }, [step]);

  useEffect(() => {
    if (phase !== "truth" || trackedTruths.current.has(step)) return;
    trackedTruths.current.add(step);
    trackRevisionReached(step, "truth");
  }, [phase, step]);

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
    const field = fieldRef.current;
    const flow = flowRef.current;
    if (!field || !flow) return;

    const applyProgress = () => {
      scrollRaf.current = 0;

      const total = Math.max(flow.offsetHeight - window.innerHeight, 1);
      const scrolled = clamp(-flow.getBoundingClientRect().top / total);
      const chapterFloat = scrolled * revisions.length;
      const nextStep = Math.min(Math.floor(chapterFloat), revisions.length - 1);
      const local = clamp(chapterFloat - nextStep);
      const rewrite = reduceMotion.current
        ? local < 0.5
          ? 0
          : 1
        : rewriteFromLocal(local);
      const nextPhase = phaseFromRewrite(rewrite);

      field.style.setProperty("--story-progress", scrolled.toFixed(4));
      field.style.setProperty("--local-progress", local.toFixed(4));
      field.style.setProperty("--rewrite", rewrite.toFixed(4));
      field.style.setProperty("--tension", clamp(local / REWRITE_START).toFixed(4));
      field.dataset.phase = nextPhase;

      if (nextStep !== stepRef.current) {
        setScrollDirection(nextStep > stepRef.current ? "forward" : "backward");
        stepRef.current = nextStep;
        setStep(nextStep);
      }

      if (nextPhase !== phaseRef.current) {
        phaseRef.current = nextPhase;
        setPhase(nextPhase);
      }

      rewriteRef.current = rewrite;
    };

    const onScroll = () => {
      if (scrollRaf.current) return;
      scrollRaf.current = window.requestAnimationFrame(applyProgress);
    };

    applyProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (scrollRaf.current) window.cancelAnimationFrame(scrollRaf.current);
    };
  }, []);

  function updatePointer(event: ReactPointerEvent<HTMLElement>) {
    const field = fieldRef.current;
    if (!field) return;
    field.style.setProperty("--pointer-x", `${event.clientX}px`);
    field.style.setProperty("--pointer-y", `${event.clientY}px`);
  }

  function clearDragStyles() {
    const word = wrongWordRef.current;
    if (!word) return;
    word.style.setProperty("--drag-x", "0px");
    word.style.setProperty("--drag-y", "0px");
  }

  function scrollToChapterProgress(targetStep: number, localProgress: number) {
    const flow = flowRef.current;
    if (!flow) return;

    const total = Math.max(flow.offsetHeight - window.innerHeight, 1);
    const chapterSpan = total / revisions.length;
    const top =
      flow.offsetTop +
      chapterSpan * (clamp(targetStep, 0, revisions.length - 1) + clamp(localProgress));

    window.scrollTo({
      top,
      behavior: reduceMotion.current ? "auto" : "smooth",
    });
  }

  function rejectWord(method: "tap" | "drag" = "tap", direction = 1) {
    if (phase === "truth") return;

    const word = wrongWordRef.current;
    const compact = window.matchMedia("(max-width: 700px), (pointer: coarse)").matches;
    const throwX = compact ? 22 : 42;
    const throwY = compact ? 6 : 12;
    word?.style.setProperty("--throw-x", `${direction * throwX}vw`);
    word?.style.setProperty("--throw-y", `${(step % 2 === 0 ? -1 : 1) * throwY}vh`);

    trackAssumptionRejected(step, revision.wrong, method);
    setDragging(false);
    scrollToChapterProgress(step, REWRITE_END + 0.08);
  }

  function handleWordPointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    if (phase === "truth") return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = { x: event.clientX, y: event.clientY };
    setDragging(true);
  }

  function handleWordPointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    if (!dragStart.current || phase === "truth") return;
    const x = event.clientX - dragStart.current.x;
    const y = event.clientY - dragStart.current.y;
    event.currentTarget.style.setProperty("--drag-x", `${x}px`);
    event.currentTarget.style.setProperty("--drag-y", `${y}px`);
  }

  function handleWordPointerUp(event: ReactPointerEvent<HTMLButtonElement>) {
    if (!dragStart.current || phase === "truth") return;
    const x = event.clientX - dragStart.current.x;
    const y = event.clientY - dragStart.current.y;
    const travelled = Math.hypot(x, y);
    dragStart.current = null;
    setDragging(false);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (travelled > 58) {
      ignoreNextClick.current = true;
      rejectWord("drag", x < 0 ? -1 : 1);
      return;
    }

    clearDragStyles();
  }

  function handleWordClick() {
    if (ignoreNextClick.current) {
      ignoreNextClick.current = false;
      return;
    }
    rejectWord("tap", step % 2 === 0 ? 1 : -1);
  }

  function cancelDrag() {
    dragStart.current = null;
    setDragging(false);
    clearDragStyles();
  }

  function jumpToQuestion() {
    trackJumpToQuestion(step);
    setDragging(false);
    scrollToChapterProgress(revisions.length - 1, REWRITE_END + 0.05);
  }

  return (
    <main
      ref={fieldRef}
      className={`mind phase-${phase} step-${step} scroll-${scrollDirection}`}
      onPointerMove={updatePointer}
      style={
        {
          "--story-progress": "0",
          "--local-progress": "0",
          "--rewrite": "0",
          "--tension": "0",
          "--chapter-count": revisions.length,
        } as CSSProperties
      }
    >
      <a className="skip-link" href="#active-thought">
        Skip to the active thought
      </a>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {statusAnnouncement}
      </p>

      <div className="paper-grain" aria-hidden="true" />
      <div className="registration registration-one" aria-hidden="true">+</div>
      <div className="registration registration-two" aria-hidden="true">+</div>
      <div className="proof-cursor" aria-hidden="true" />

      <header className="mind-header">
        <a className="mind-wordmark" href="#active-thought" translate="no">
          ALT—TXT
        </a>
        <span className="mind-status" aria-hidden="true">
          <i /> reviewing assumption {progress}
        </span>
        <button
          className="question-shortcut"
          type="button"
          onClick={jumpToQuestion}
          aria-label="Skip to the final question, revision 6 of 6"
        >
          <span className="question-shortcut-label">
            <span className="question-shortcut-long">Bring us a hard thing</span>
            <span className="question-shortcut-short">Question</span>
            <small>Skip to 06 / 06</small>
          </span>
          <span aria-hidden="true">↗</span>
        </button>
      </header>

      <aside
        className={`discard-margin ${discarded.length === 0 ? "is-empty" : ""}`}
        aria-label="Assumptions removed from the work"
        aria-hidden={discarded.length === 0 ? true : undefined}
      >
        <p id="discard-heading">Removed from the work</p>
        <div className="discard-pile" aria-labelledby="discard-heading">
          {discarded.length === 0 ? (
            <span className="empty-pile">No assumptions removed yet</span>
          ) : (
            <ul className="discard-list">
              {discarded.map((item) => (
                <li
                  className="discarded-word"
                  key={`${item.step}-${item.word}`}
                >
                  <del>{item.word}</del>
                  <small>{item.residue}</small>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      <div ref={flowRef} className="revision-flow scroll-story">
        <div className="revision-stage" id="active-thought">
          <div className="revision-coordinate" aria-hidden="true">
            <span>REV. {progress}</span>
            <span>
              {phase === "truth"
                ? "assumption corrected"
                : phase === "correcting"
                  ? "rewriting in progress"
                  : "assumption under review"}
            </span>
          </div>

          <div className="rewrite-stack" key={step}>
            <div
              className="assumption-copy"
              aria-hidden={phase === "truth"}
              inert={phase === "truth" ? true : undefined}
            >
              <p className="editor-note" id="editor-note">
                {revision.annotation}
              </p>
              <h1 className="sr-only" id="active-heading">
                {phase === "truth"
                  ? revision.truth
                  : `${revision.prefix}${revision.wrong}${revision.suffix}`}
              </h1>
              <div className="assumption-heading">
                <span aria-hidden="true">{revision.prefix}</span>
                <button
                  ref={wrongWordRef}
                  className={`wrong-word ${dragging ? "is-dragging" : ""}`}
                  type="button"
                  data-testid="wrong-word"
                  disabled={phase === "truth"}
                  tabIndex={phase === "truth" ? -1 : 0}
                  aria-label={`Remove the word “${revision.wrong}” and reveal the correction`}
                  aria-describedby="editor-note interaction-instruction"
                  onPointerDown={handleWordPointerDown}
                  onPointerMove={handleWordPointerMove}
                  onPointerUp={handleWordPointerUp}
                  onPointerCancel={cancelDrag}
                  onClick={handleWordClick}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") cancelDrag();
                  }}
                >
                  <span className="wrong-word-text">{revision.wrong}</span>
                  <span className="wrong-stroke" aria-hidden="true" />
                  <i aria-hidden="true">revise</i>
                </button>
                <span aria-hidden="true">{revision.suffix}</span>
              </div>
              <span className="sr-only" id="interaction-instruction">
                Activate the marked word, or keep scrolling, to rewrite this assumption.
              </span>
              <div className="gesture-hint" aria-hidden="true">
                <span className="gesture-line" />
                <span className="gesture-hint-full">Tap or drag the marked word</span>
                <span className="gesture-hint-full">or scroll to rewrite ↓</span>
                <span className="gesture-hint-short">Tap word or scroll ↓</span>
              </div>
            </div>

            <div
              className="truth-copy"
              aria-hidden={phase !== "truth"}
              inert={phase !== "truth" ? true : undefined}
            >
              <p className="correction-mark">{revision.proof}</p>
              <p className="truth-heading" aria-hidden="true">
                {revision.truth}
              </p>
              <p className="earned-evidence">{revision.evidence}</p>

              {revision.kind === "swarm" && (
                <ul className="swarm-proof" aria-label="Specialized agent capabilities">
                  <li>research synthesis</li>
                  <li>finance</li>
                  <li>operations</li>
                  <li>engineering</li>
                  <li>pattern finding</li>
                </ul>
              )}

              {revision.kind === "artifacts" && (
                <ul className="project-models" aria-label="Lab projects">
                  {(Object.keys(artifacts) as ArtifactKey[]).map((key) => {
                    const project = artifacts[key];
                    return (
                      <li key={key}>
                        <button
                          type="button"
                          className="project-model"
                          onClick={() => setArtifact(key)}
                          aria-label={`Open ${project.name} project details`}
                        >
                          <span className="project-model-index" aria-hidden="true">
                            {project.index}
                          </span>
                          <span className="project-model-body">
                            <span className="project-model-topline">
                              <strong>{project.name}</strong>
                              <em>{project.status}</em>
                            </span>
                            <span className="project-model-role">{project.role}</span>
                            <span className="project-model-host">{project.host}</span>
                          </span>
                          <span className="project-model-action" aria-hidden="true">
                            Open
                            <span>↗</span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              {revision.kind === "outcome" && (
                <div className="outcome-proof" aria-label="Outcome measures">
                  <span>hours returned</span>
                  <span>decisions improved</span>
                  <span>margin created</span>
                  <strong>Shipping is not proof. Change is.</strong>
                </div>
              )}

              {revision.kind === "invitation" ? (
                <div className="problem-trace">
                  <label htmlFor="unresolved-problem">
                    The part of our business that feels harder than it should is…
                  </label>
                  <textarea
                    id="unresolved-problem"
                    name="unresolved-problem"
                    autoComplete="off"
                    spellCheck
                    rows={3}
                    value={problem}
                    onChange={(event) => setProblem(event.target.value)}
                    placeholder="The handoff between sales and operations keeps…"
                    tabIndex={phase === "truth" ? 0 : -1}
                  />
                  <div>
                    <small id="problem-hint">Bring the messy version. 2 sentences is enough.</small>
                    <a
                      href={mailto}
                      tabIndex={phase === "truth" ? 0 : -1}
                      aria-describedby="problem-hint"
                      onClick={() => trackContactIntent(problem.trim().length > 0)}
                    >
                      Send the unresolved version <span aria-hidden="true">↗</span>
                    </a>
                  </div>
                </div>
              ) : step === 0 ? (
                <div className="scroll-prompt" aria-hidden="true">
                  <span>Keep scrolling</span>
                  <i>↓</i>
                </div>
              ) : null}
            </div>
          </div>

          <div className="chapter-meter" aria-hidden="true">
            <span />
          </div>
        </div>
      </div>

      <nav aria-label="Revision chapters">
        <ol className="revision-history">
          {revisions.map((item, index) => {
            const isComplete = index < step || (index === step && phase === "truth");
            const isCurrent = index === step;
            return (
              <li
                key={item.wrong}
                aria-current={isCurrent ? "step" : undefined}
                className={`${isComplete ? "is-complete" : ""} ${isCurrent ? "is-current" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => scrollToChapterProgress(index, 0.08)}
                  aria-label={`Go to assumption ${index + 1}: ${item.wrong}${
                    isComplete ? ", corrected" : ""
                  }${isCurrent ? ", current" : ""}`}
                >
                  <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="quiet-proof" aria-hidden="true">
        <span>Technology is the easy part.</span>
        <span>Finding the right problem is the work.</span>
      </div>

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
              <span>Lab project / {artifacts[artifact].index}</span>
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
                <dt>Question</dt>
                <dd>{artifacts[artifact].question}</dd>
              </div>
              <div>
                <dt>Experiment</dt>
                <dd>{artifacts[artifact].experiment}</dd>
              </div>
              <div>
                <dt>Trace left behind</dt>
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
                Stay with the work
              </button>
            </div>
          </div>
        )}
      </dialog>
    </main>
  );
}
