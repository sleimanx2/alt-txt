import { track } from "@vercel/analytics";

type EventProps = Record<string, string | number | boolean | null>;

export function trackEvent(name: string, props?: EventProps) {
  track(name, props);
}

export function trackCtaClicked(label: string) {
  trackEvent("cta_clicked", { label });
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
