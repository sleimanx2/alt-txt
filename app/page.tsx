"use client";

import {
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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
    question: "Can buying advice reward craft instead of whoever shouts loudest?",
    experiment:
      "Agents compare thousands of sources. Human judgment decides what deserves weight.",
    finding: "More information is useless until someone decides what matters.",
  },
  cejour: {
    index: "02",
    name: "CeJour",
    status: "producing / live",
    question: "Can a brand keep moving without consuming the people who give it taste?",
    experiment:
      "A quiet system writes, composes, and publishes. Humans keep the consequential decisions.",
    finding: "Automation matters most when it protects human attention.",
  },
} as const;

type ArtifactKey = keyof typeof artifacts;
type Phase = "assumption" | "correcting" | "truth";
type DiscardedWord = { word: string; residue: string; step: number };

export default function Home() {
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<Phase>("assumption");
  const [discarded, setDiscarded] = useState<DiscardedWord[]>([]);
  const [dragging, setDragging] = useState(false);
  const [artifact, setArtifact] = useState<ArtifactKey | null>(null);
  const [problem, setProblem] = useState("");

  const fieldRef = useRef<HTMLElement>(null);
  const wrongWordRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const correctionTimer = useRef<number | null>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const ignoreNextClick = useRef(false);
  const reduceMotion = useRef(false);

  const revision = revisions[step];
  const progress = `${String(step + 1).padStart(2, "0")} / ${String(revisions.length).padStart(2, "0")}`;

  const mailto = useMemo(() => {
    const unresolved = problem.trim() || "The part of our business that feels harder than it should is…";
    return `mailto:hello@alt-txt.com?subject=${encodeURIComponent(
      "An unresolved question",
    )}&body=${encodeURIComponent(unresolved)}`;
  }, [problem]);

  useEffect(() => {
    reduceMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return () => {
      if (correctionTimer.current !== null) window.clearTimeout(correctionTimer.current);
    };
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (artifact && !dialog.open) dialog.showModal();
    if (!artifact && dialog.open) dialog.close();
  }, [artifact]);

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
    word.style.removeProperty("--throw-x");
    word.style.removeProperty("--throw-y");
  }

  function rejectWord(direction = 1) {
    if (phase !== "assumption") return;

    const word = wrongWordRef.current;
    word?.style.setProperty("--throw-x", `${direction * 58}vw`);
    word?.style.setProperty("--throw-y", `${step % 2 === 0 ? -18 : 18}vh`);
    setDragging(false);
    setPhase("correcting");

    correctionTimer.current = window.setTimeout(() => {
      setDiscarded((current) =>
        current.some((item) => item.step === step)
          ? current
          : [...current, { word: revision.wrong, residue: revision.residue, step }],
      );
      setPhase("truth");
      correctionTimer.current = null;
    }, reduceMotion.current ? 0 : 560);
  }

  function handleWordPointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    if (phase !== "assumption") return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = { x: event.clientX, y: event.clientY };
    setDragging(true);
  }

  function handleWordPointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    if (!dragStart.current || phase !== "assumption") return;
    const x = event.clientX - dragStart.current.x;
    const y = event.clientY - dragStart.current.y;
    event.currentTarget.style.setProperty("--drag-x", `${x}px`);
    event.currentTarget.style.setProperty("--drag-y", `${y}px`);
  }

  function handleWordPointerUp(event: ReactPointerEvent<HTMLButtonElement>) {
    if (!dragStart.current || phase !== "assumption") return;
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
      rejectWord(x < 0 ? -1 : 1);
      return;
    }

    clearDragStyles();
  }

  function handleWordClick() {
    if (ignoreNextClick.current) {
      ignoreNextClick.current = false;
      return;
    }
    rejectWord(step % 2 === 0 ? 1 : -1);
  }

  function cancelDrag() {
    dragStart.current = null;
    setDragging(false);
    clearDragStyles();
  }

  function nextRevision() {
    if (step >= revisions.length - 1) return;
    setStep((current) => current + 1);
    setPhase("assumption");
    setDragging(false);
  }

  function jumpToQuestion() {
    if (correctionTimer.current !== null) window.clearTimeout(correctionTimer.current);
    correctionTimer.current = null;
    setStep(revisions.length - 1);
    setPhase("assumption");
    setDragging(false);
  }

  return (
    <main
      ref={fieldRef}
      className={`mind phase-${phase} step-${step}`}
      onPointerMove={updatePointer}
    >
      <a className="skip-link" href="#active-thought">
        Skip to the active thought
      </a>

      <div className="paper-grain" aria-hidden="true" />
      <div className="registration registration-one" aria-hidden="true">+</div>
      <div className="registration registration-two" aria-hidden="true">+</div>
      <div className="proof-cursor" aria-hidden="true" />

      <header className="mind-header">
        <span className="mind-wordmark" translate="no">ALT—TXT</span>
        <span className="mind-status">
          <i aria-hidden="true" /> revising assumption {progress}
        </span>
        <button className="question-shortcut" type="button" onClick={jumpToQuestion}>
          Bring us a hard thing <span aria-hidden="true">↗</span>
        </button>
      </header>

      <aside className="discard-margin" aria-label="Assumptions removed from the work">
        <p>Removed from the work</p>
        <div className="discard-pile">
          {discarded.length === 0 ? (
            <span className="empty-pile">margin currently empty</span>
          ) : (
            discarded.map((item) => (
              <span
                className="discarded-word"
                key={`${item.step}-${item.word}`}
                title={item.residue}
              >
                <del>{item.word}</del>
                <small>{item.residue}</small>
              </span>
            ))
          )}
        </div>
      </aside>

      <div className="revision-stage" id="active-thought">
        <div className="revision-coordinate" aria-hidden="true">
          <span>REV. {progress}</span>
          <span>{phase === "truth" ? "assumption corrected" : "assumption under review"}</span>
        </div>

        {phase !== "truth" ? (
          <div className="assumption-copy" key={`assumption-${step}`}>
            <p className="editor-note">{revision.annotation}</p>
            <h1>
              <span>{revision.prefix}</span>
              <button
                ref={wrongWordRef}
                className={`wrong-word ${dragging ? "is-dragging" : ""}`}
                type="button"
                data-testid="wrong-word"
                disabled={phase === "correcting"}
                aria-label={`Remove ${revision.wrong} from this assumption`}
                onPointerDown={handleWordPointerDown}
                onPointerMove={handleWordPointerMove}
                onPointerUp={handleWordPointerUp}
                onPointerCancel={cancelDrag}
                onClick={handleWordClick}
                onKeyDown={(event) => {
                  if (event.key === "Escape") cancelDrag();
                }}
              >
                {revision.wrong}
                <i aria-hidden="true">not quite</i>
              </button>
              <span>{revision.suffix}</span>
            </h1>
            <div className="gesture-hint" aria-hidden="true">
              <span className="gesture-line" />
              <span>drag the wrong word out</span>
              <span>or tap it</span>
            </div>
          </div>
        ) : (
          <div className="truth-copy" key={`truth-${step}`} aria-live="polite">
            <p className="correction-mark">{revision.proof}</p>
            <h1>{revision.truth}</h1>
            <p className="earned-evidence">{revision.evidence}</p>

            {revision.kind === "swarm" && (
              <div className="swarm-proof" aria-label="Specialized agent capabilities">
                <span>research synthesis</span>
                <span>finance</span>
                <span>operations</span>
                <span>engineering</span>
                <span>pattern finding</span>
              </div>
            )}

            {revision.kind === "artifacts" && (
              <div className="artifact-footnotes" aria-label="Research evidence">
                <button type="button" onClick={() => setArtifact("krekib")}>
                  <span>*01</span> Krekib <em>researching</em>
                </button>
                <button type="button" onClick={() => setArtifact("cejour")}>
                  <span>*02</span> CeJour <em>producing</em>
                </button>
              </div>
            )}

            {revision.kind === "outcome" && (
              <div className="outcome-proof">
                <span>hours returned</span>
                <span>decisions improved</span>
                <span>margin created</span>
                <strong>shipping is not proof. change is.</strong>
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
                  rows={2}
                  value={problem}
                  onChange={(event) => setProblem(event.target.value)}
                  placeholder="The handoff between sales and operations keeps…"
                />
                <div>
                  <small>Bring the messy version. 2 sentences is enough.</small>
                  <a href={mailto}>
                    Send the unresolved version <span aria-hidden="true">↗</span>
                  </a>
                </div>
              </div>
            ) : (
              <button className="next-assumption" type="button" onClick={nextRevision}>
                Next assumption <span aria-hidden="true">↘</span>
              </button>
            )}
          </div>
        )}
      </div>

      <div className="revision-history" aria-label={`Revision ${step + 1} of ${revisions.length}`}>
        {revisions.map((item, index) => (
          <span
            key={item.wrong}
            className={`${index < step || (index === step && phase === "truth") ? "is-complete" : ""} ${
              index === step ? "is-current" : ""
            }`}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
        ))}
      </div>

      <div className="quiet-proof" aria-hidden="true">
        <span>Technology is the easy part.</span>
        <span>Finding the right problem is the work.</span>
      </div>

      <dialog
        ref={dialogRef}
        className="artifact-dialog"
        onClose={() => setArtifact(null)}
        aria-labelledby="artifact-title"
      >
        {artifact && (
          <div className="artifact-sheet">
            <div className="artifact-sheet-head">
              <span>LAB EVIDENCE / {artifacts[artifact].index}</span>
              <button type="button" onClick={() => dialogRef.current?.close()}>
                Close evidence <span aria-hidden="true">×</span>
              </button>
            </div>
            <p className="artifact-status">{artifacts[artifact].status}</p>
            <h2 id="artifact-title">{artifacts[artifact].name}</h2>
            <dl>
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
          </div>
        )}
      </dialog>
    </main>
  );
}
