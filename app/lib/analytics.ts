import { track } from "@vercel/analytics";

type EventProps = Record<string, string | number | boolean | null>;

export function trackEvent(name: string, props?: EventProps) {
  track(name, props);
}

export function trackAssumptionRejected(step: number, word: string, method: "tap" | "drag") {
  trackEvent("assumption_rejected", {
    step: step + 1,
    word,
    method,
  });
}

export function trackRevisionReached(step: number, phase: "assumption" | "truth") {
  trackEvent("revision_reached", {
    step: step + 1,
    phase,
  });
}

export function trackJumpToQuestion(fromStep: number) {
  trackEvent("jump_to_question", {
    fromStep: fromStep + 1,
  });
}

export function trackArtifactOpened(name: string) {
  trackEvent("artifact_opened", { name });
}

export function trackProjectLinkClicked(name: string, host: string) {
  trackEvent("project_link_clicked", { name, host });
}

export function trackContactIntent(hasCustomProblem: boolean) {
  trackEvent("contact_intent", {
    hasCustomProblem,
  });
}
