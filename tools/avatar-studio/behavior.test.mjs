import test from "node:test";
import assert from "node:assert/strict";
import { AVATAR_STATES, avatarPose, pointerToGaze, smooth } from "./behavior.mjs";

test("behavior contract includes all expected states", () => {
  assert.deepEqual(AVATAR_STATES, ["idle", "listening", "thinking", "explaining"]);
  for (const state of AVATAR_STATES) {
    assert.equal(typeof avatarPose(state).headX, "number");
  }
});
test("unrecognized intent safely returns idle", () => {
  assert.deepEqual(avatarPose("unknown"), avatarPose("idle"));
});
test("speaking and reduced-motion intent remain deterministic", () => {
  assert.ok(avatarPose("explaining").armRight < avatarPose("idle").armRight);
  assert.equal(avatarPose("explaining", { speaking: true }).mouth, 0.42);
  assert.equal(avatarPose("explaining", { speaking: true, reducedMotion: true }).armRight, 0);
});
test("pointer look normalization clamps and handles invalid sizes", () => {
  assert.deepEqual(pointerToGaze(50, 50, 100, 100), { x: 0, y: 0 });
  assert.deepEqual(pointerToGaze(999, -999, 100, 100), { x: 1, y: 1 });
  assert.deepEqual(pointerToGaze(5, 5, 0, 100), { x: 0, y: 0 });
});
test("smoothing moves toward destination without overshoot", () => {
  const value = smooth(0, 1, 1 / 60);
  assert.ok(value > 0 && value < 1);
  assert.equal(smooth(0, 1, 0), 0);
});
