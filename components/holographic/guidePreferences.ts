"use client";

import { useSyncExternalStore } from "react";

/** Local browser preferences, read consistently after hydration without setState-in-effect. */
export type GuideLanguage = "es" | "en" | "pt" | "fr";

const LANGUAGE_KEY = "nexus-guide-language";
const VOICE_KEY = "nexus-guide-voice";

function isLanguage(value: string | null): value is GuideLanguage {
  return value === "es" || value === "en" || value === "pt" || value === "fr";
}

function readLanguage(): GuideLanguage {
  if (typeof window === "undefined") return "es";
  const stored = window.localStorage.getItem(LANGUAGE_KEY);
  return isLanguage(stored) ? stored : "es";
}

function readVoice(): boolean {
  return typeof window === "undefined" || window.localStorage.getItem(VOICE_KEY) !== "off";
}

function subscribeToPreference(key: string, eventName: string, notify: () => void) {
  const storageChanged = (event: StorageEvent) => {
    if (event.key === key || event.key === null) notify();
  };
  window.addEventListener("storage", storageChanged);
  window.addEventListener(eventName, notify);
  return () => {
    window.removeEventListener("storage", storageChanged);
    window.removeEventListener(eventName, notify);
  };
}

function subscribeLanguage(notify: () => void) {
  return subscribeToPreference(LANGUAGE_KEY, "nexus:language", notify);
}
function subscribeVoice(notify: () => void) {
  return subscribeToPreference(VOICE_KEY, "nexus:voice", notify);
}

export function useGuideLanguage(): GuideLanguage {
  return useSyncExternalStore(subscribeLanguage, readLanguage, () => "es");
}

export function useGuideVoice(): boolean {
  return useSyncExternalStore(subscribeVoice, readVoice, () => true);
}

export function setGuideLanguage(value: GuideLanguage) {
  window.localStorage.setItem(LANGUAGE_KEY, value);
  window.dispatchEvent(new CustomEvent("nexus:language", { detail: value }));
}

export function setGuideVoice(value: boolean) {
  window.localStorage.setItem(VOICE_KEY, value ? "on" : "off");
  window.dispatchEvent(new Event("nexus:voice"));
}
