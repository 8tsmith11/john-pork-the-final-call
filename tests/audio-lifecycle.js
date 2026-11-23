import assert from 'node:assert/strict';
import { setArea } from '../src/audio/audio.js';

// Keep this separate from the main suite so the clock and Web Audio doubles stay local to this test.
const pending = new Map();
const cancelled = [];
const nodes = [];
let now = 0;
let nextTimer = 0;

globalThis.setTimeout = (fn, delay) => {
  const id = ++nextTimer;
  pending.set(id, { due: now + delay, fn });
  return id;
};
globalThis.clearTimeout = (id) => {
  cancelled.push(id);
  pending.delete(id);
};

function tick() {
  const [id, timer] = [...pending.entries()].sort((a, b) => a[1].due - b[1].due)[0];
  now = timer.due;
  pending.delete(id);
  timer.fn();
}

function audioParam() {
  return {
    value: 0,
    setValueAtTime() {},
    cancelScheduledValues() {},
    linearRampToValueAtTime() {},
    exponentialRampToValueAtTime() {},
  };
}

function audioNode() {
  const node = {
    gain: audioParam(),
    frequency: audioParam(),
    outputs: new Set(),
    stopped: false,
    start() {},
    stop() { this.stopped = true; },
    connect(destination) { this.outputs.add(destination); },
    disconnect() { this.outputs.clear(); },
  };
  nodes.push(node);
  return node;
}

globalThis.window = {
  AudioContext: class {
    state = 'running';
    sampleRate = 8;
    destination = {};
    get currentTime() { return now / 1000; }
    createGain() { return audioNode(); }
    createOscillator() { return audioNode(); }
    createBufferSource() { return audioNode(); }
    createBiquadFilter() { return audioNode(); }
    createBuffer(_, length) { return { getChannelData: () => new Float32Array(length) }; }
  },
};

const farm = { act: 2, outdoor: true };
setArea('beltsville', farm);
const background = nodes[2], farmBus = nodes.find((node) => node.outputs.has(background));
assert.ok(farmBus, 'the farm has a bus connected to the background mix');
for (let i = 0; i < 200; i++) tick();
const before = nodes.length;
setArea('bv_test_road', farm);
assert.equal(nodes.length, before, 'same-bed travel leaves the existing soundscape playing');
assert.equal(pending.size, 1, 'only the next farm sound is scheduled');

setArea('test_silent_map', { act: 1 });
assert.equal(cancelled.length, 1, 'leaving cancels only the live timer');
assert.equal(pending.size, 1, 'only the fade cleanup remains');
assert.ok(farmBus.outputs.has(background), 'the bus remains in the mix during the fade');
tick();
assert.equal(pending.size, 0);
assert.equal(farmBus.outputs.size, 0, 'the faded bus disconnects from the mix');
console.log('ok   region ambience reuses beds and retires expired timers and audio connections');
