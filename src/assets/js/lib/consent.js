// src/lib/consent.js
const KEY = 'consent_v1';

const DEFAULT = {
  clarity: null,          // null=미결정, true/false=결정됨
  decidedAt: null,        // ISO string
};

export function getConsent() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT, ...parsed };
  } catch {
    return { ...DEFAULT };
  }
}

export function setConsent(next) {
  const value = {
    ...getConsent(),
    ...next,
    decidedAt: new Date().toISOString(),
  };
  localStorage.setItem(KEY, JSON.stringify(value));
  return value;
}

export function clearConsent() {
  localStorage.removeItem(KEY);
}