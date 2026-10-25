"use client";

import { useEffect, useRef } from "react";
import { mountAvatar, type AvatarGesture, type AvatarState } from "./avatarRenderer";

type Props = { speaking: boolean; gesture: AvatarGesture; label: string };

export default function NexusAvatar3D({ speaking, gesture, label }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const state = useRef<AvatarState>({ speaking, gesture });
  useEffect(() => {
    state.current = { speaking, gesture };
    canvas.current?.dispatchEvent(new Event("nexus:avatar-redraw"));
  }, [speaking, gesture]);
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const cleanup = mountAvatar(el, () => state.current);
    return () => cleanup?.();
  }, []);
  return <div className="ncc-avatar3d" role="img" aria-label={label}>
    <canvas ref={canvas} aria-hidden="true" />
    <span className="ncc-avatar3d-grid" aria-hidden="true" />
  </div>;
}
