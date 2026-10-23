import { NextResponse } from "next/server";
import { clearSession, readSession, writeSession } from "../../../../lib/session";

export async function GET() {
  const session = await readSession();
  if (!session) {
    await clearSession();
    return NextResponse.json({ user: null });
  }
  await writeSession(session);
  return NextResponse.json({ user: { id: session.user.id, email: session.user.email, name: session.user.user_metadata?.full_name ?? null } });
}
