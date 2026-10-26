/** Pure behavior mapping shared by the local VRM audition UI and its tests.
 * This is gesture intent, not an animation retargeting or lip-sync engine.
 */
export const AVATAR_STATES = Object.freeze(["idle", "listening", "thinking", "explaining"]);

const POSES = Object.freeze({
  idle:       { armRight: 0,     armLeft: 0,     headX: 0,      headZ: 0,      happy: 0,    relaxed: 0.10 },
  listening:  { armRight: -0.07, armLeft: 0.02,  headX: -0.025, headZ: -0.012, happy: 0.10, relaxed: 0.06 },
  thinking:   { armRight: -0.13, armLeft: 0.06,  headX: -0.055, headZ: 0.035,  happy: 0,    relaxed: 0 },
  explaining: { armRight: -0.47, armLeft: 0.10,  headX: 0.012,  headZ: -0.010, happy: 0.14, relaxed: 0 },
});

export function avatarPose(mode, { speaking = false, reducedMotion = false } = {}) {
  const safe = AVATAR_STATES.includes(mode) ? mode : "idle";
  const pose = POSES[safe];
  if (reducedMotion) return { ...POSES.idle, mouth: speaking ? 0.15 : 0 };
  return { ...pose, mouth: speaking ? 0.42 : 0 };
}

export function pointerToGaze(clientX, clientY, width, height) {
  if (![clientX, clientY, width, height].every(Number.isFinite) || width <= 0 || height <= 0) {
    return { x: 0, y: 0 };
  }
  const clamp = (v) => Math.max(-1, Math.min(1, v));
  return {
    x: clamp((clientX / width - 0.5) * 2),
    y: clamp((0.5 - clientY / height) * 2),
  };
}

export function smooth(current, target, delta, speed = 5) {
  if (!Number.isFinite(delta) || delta <= 0) return current;
  return current + (target - current) * (1 - Math.exp(-speed * delta));
}
