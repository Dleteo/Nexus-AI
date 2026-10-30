/** Nexus AI uses two independent assistant roles without requiring a database migration. */
export const assistantScopes = ["portfolio", "technical"] as const;
export type AssistantScope = (typeof assistantScopes)[number];

export const conversationPrefixes: Record<AssistantScope, string> = {
  portfolio: "Nexus Portfolio · ",
  technical: "Nexus Technical · ",
};

export function isAssistantScope(value: unknown): value is AssistantScope {
  return value === "portfolio" || value === "technical";
}

/** Older, unprefixed conversations remain available as technical/general chats. */
export function scopeFromTitle(title: string): AssistantScope {
  return title.startsWith(conversationPrefixes.portfolio) ? "portfolio" : "technical";
}

export function conversationTitle(scope: AssistantScope): string {
  return conversationPrefixes[scope] + "New conversation";
}
