type Failure = { ok: false; reason: string; status: number };
export function localLabsAccess(request: Request, featureFlag: string): Failure | { ok: true; port: number };
export function readLabsJson(request: Request, maxBytes: number, timeoutMs?: number): Promise<Failure | { ok: true; value: unknown }>;
