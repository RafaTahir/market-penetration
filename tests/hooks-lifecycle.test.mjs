/** Hook lifecycle contracts with synthetic React and Supabase boundaries only. */
import assert from 'node:assert/strict';
import { dirname } from 'node:path';
import test, { after } from 'node:test';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const bundle = await build({
  stdin: {
    contents: "export { useBookmarks } from './src/hooks/useBookmarks.ts'; export { useRealtimeSync, useMarketDataSync } from './src/hooks/useRealtimeSync.ts';",
    resolveDir: root, loader: 'ts',
  },
  bundle: true, platform: 'node', format: 'cjs', write: false,
  plugins: [{ name: 'isolated-hook-boundaries', setup(builder) {
    builder.onResolve({ filter: /^react$|\/supabaseClient$/ }, args => ({ path: args.path, namespace: 'hook-fixture' }));
    builder.onLoad({ filter: /.*/, namespace: 'hook-fixture' }, args => ({ contents: args.path === 'react'
      ? 'const hooks = globalThis.__hookLifecycle.react; export const { useState, useEffect, useRef, useCallback } = hooks;'
      : 'export const { supabase, isSupabaseConfigured } = globalThis.__hookLifecycle;' }));
  } }],
});
const originalFetch = globalThis.fetch;
globalThis.fetch = () => { throw new Error('Hook fixtures forbid real network calls'); };
after(() => { globalThis.fetch = originalFetch; delete globalThis.__hookLifecycle; });

function deferred() {
  let resolve;
  const promise = new Promise(yes => { resolve = yes; });
  return { promise, resolve };
}
const settle = async () => { for (let step = 0; step < 4; step++) await new Promise(resolve => setImmediate(resolve)); };

function createHarness(name, initialArgs, configured = true) {
  const slots = [], requests = [], channels = [], errors = [];
  let cursor = 0, dirty = false, mounted = true, currentArgs = initialArgs, output;
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!slots[index]) {
        const slot = { value: typeof initial === 'function' ? initial() : initial };
        slot.set = value => {
          assert.ok(mounted, 'No state updates after unmount');
          const next = typeof value === 'function' ? value(slot.value) : value;
          if (!Object.is(next, slot.value)) { slot.value = next; dirty = true; }
        };
        slots[index] = slot;
      }
      return [slots[index].value, slots[index].set];
    },
    useRef(initial) { const index = cursor++; slots[index] ??= { current: initial }; return slots[index]; },
    useCallback(callback, deps) {
      const index = cursor++;
      if (!slots[index] || deps.some((value, at) => !Object.is(value, slots[index].deps[at]))) slots[index] = { callback, deps };
      return slots[index].callback;
    },
    useEffect(callback, deps) {
      const index = cursor++;
      const previous = slots[index];
      if (!previous || deps.some((value, at) => !Object.is(value, previous.deps[at]))) {
        slots[index] = { deps, callback, cleanup: previous?.cleanup, pending: true };
      }
    },
  };
  const supabase = {
    from(table) {
      assert.ok(configured, 'Unconfigured hooks must not access Supabase');
      let operation = 'select', values, started;
      const filters = [];
      const query = {
        select() { return query; }, order() { return query; }, single() { return query; },
        eq(...filter) { filters.push(filter); return query; },
        insert(value) { operation = 'insert'; values = value; return query; },
        delete() { operation = 'delete'; return query; },
        then(resolve, reject) {
          if (!started) { started = deferred(); requests.push({ table, operation, values, filters, ...started }); }
          return started.promise.then(resolve, reject);
        },
      };
      return query;
    },
    channel(name) {
      assert.ok(configured, 'Unconfigured hooks must not open channels');
      const channel = { name, handlers: [], unsubscribeCalls: 0,
        on(event, filter, handler) { channel.handlers.push({ event, filter, handler }); return channel; },
        subscribe() { return channel; },
        unsubscribe() { channel.unsubscribeCalls++; return Promise.resolve('ok'); },
      };
      channels.push(channel);
      return channel;
    },
  };
  globalThis.__hookLifecycle = { react, supabase, isSupabaseConfigured: configured };
  const module = { exports: {} };
  new Function('module', 'exports', 'console', bundle.outputFiles[0].text)(module, module.exports, { error: (...args) => errors.push(args) });
  delete globalThis.__hookLifecycle;
  const hook = module.exports[name];
  function render(args = currentArgs) {
    assert.ok(mounted);
    currentArgs = args;
    let passes = 0;
    do {
      assert.ok(passes++ < 20, 'Hook should settle without render loops');
      dirty = false; cursor = 0; output = hook(...currentArgs);
      for (const effect of slots) if (effect?.pending) {
        effect.pending = false; effect.cleanup?.(); effect.cleanup = effect.callback();
      }
    } while (dirty);
    return output;
  }
  function unmount() { for (const effect of slots) effect?.cleanup?.(); mounted = false; }
  function nextRequest(operation = 'select', owner) {
    const request = requests.find(item => !item.used && item.operation === operation && (!owner || item.filters.some(([field, value]) => field === 'user_id' && value === owner)));
    assert.ok(request, `Expected mocked ${operation} request for ${owner ?? 'current user'}`);
    request.used = true;
    return request;
  }
  return { render, unmount, nextRequest, requests, channels, errors };
}

function bookmark(id, owner = 'user-a') {
  return { id, user_id: owner, item_type: 'country', item_id: 'Singapore', item_data: { zero: 0, unknown: null }, notes: null, tags: [], created_at: '2026-10-25T00:00:00Z' };
}
function quote(id = 'quote-a') {
  return { id, symbol: 'FIXTURE', name: 'Synthetic fixture', exchange: 'TEST', country: 'Singapore', price: 0, change: 0, change_percent: 0, volume: 0, timestamp: '2023-01-02T00:00:00Z' };
}
function emit(channel, event, row) {
  const handler = channel.handlers.find(item => item.filter.event === event || item.filter.event === '*');
  assert.ok(handler, `Expected ${event} handler`);
  handler.handler({ eventType: event, new: event === 'DELETE' ? {} : row, old: event === 'DELETE' ? row : {} });
}


test('guest and unconfigured bookmark hooks finish loading without backend reads or writes', async () => {
  for (const [owner, configured] of [[null, true], ['user-a', false]]) {
    const h = createHarness('useBookmarks', [owner], configured);
    const state = h.render();
    assert.equal(state.loading, false);
    assert.deepEqual(state.bookmarks, []);
    await state.refreshBookmarks();
    await state.addBookmark('country', 'Singapore', {});
    await state.removeBookmark('fixture-id');
    assert.equal(h.requests.length, 0);
    h.unmount();
  }
});

test('bookmark user changes reject late reads, old callbacks, wrong-owner rows and invalid JSON', async () => {
  const h = createHarness('useBookmarks', ['user-a']);
  const oldState = h.render(); await settle(); const oldRead = h.nextRequest('select', 'user-a');
  assert.equal(oldState.loading, true);
  assert.deepEqual(h.render(['user-b']).bookmarks, []);
  await settle();
  h.nextRequest('select', 'user-b').resolve({ data: [bookmark('b-current', 'user-b')], error: null });
  await settle(); oldRead.resolve({ data: [bookmark('a-late')], error: null }); await settle();
  let state = h.render();
  assert.deepEqual(state.bookmarks.map(row => row.id), ['b-current']);
  assert.deepEqual(state.bookmarks[0].item_data, { zero: 0, unknown: null });
  const before = h.requests.length;
  await oldState.refreshBookmarks(); await oldState.addBookmark('country', 'Malaysia', {}); await oldState.removeBookmark('a-late');
  assert.equal(h.requests.length, before, 'Callbacks retained by an old user must not request data');
  for (const bad of [bookmark('wrong-owner'), { ...bookmark('bad-json', 'user-b'), item_data: { invalid: Infinity } }]) {
    const refresh = state.refreshBookmarks(); await settle();
    h.nextRequest('select', 'user-b').resolve({ data: [bad], error: null }); await refresh;
    state = h.render(); assert.ok(state.error instanceof Error); assert.equal(state.loading, false);
    assert.deepEqual(state.bookmarks.map(row => row.id), ['b-current'], 'Invalid rows cannot replace valid bookmarks');
  }
  assert.equal(h.errors.length, 2, 'Rejected responses should surface errors');
  h.unmount();
});

test('latest bookmark refresh wins and read failures are exposed with loading stopped', async () => {
  const h = createHarness('useBookmarks', ['user-a']); let state = h.render(); await settle();
  const initial = h.nextRequest();
  const refresh = state.refreshBookmarks(); await settle(); const latest = h.nextRequest();
  latest.resolve({ data: [bookmark('latest')], error: null }); await refresh;
  initial.resolve({ data: [bookmark('stale')], error: null }); await settle(); state = h.render();
  assert.deepEqual(state.bookmarks.map(row => row.id), ['latest']);
  const failed = state.refreshBookmarks(); await settle();
  h.nextRequest().resolve({ data: null, error: { message: 'Synthetic unavailable' } }); await failed;
  state = h.render(); assert.match(state.error.message, /Synthetic unavailable/); assert.equal(state.loading, false);
  assert.equal(h.errors.length, 1);
  h.unmount();
});

test('bookmark mutations are owner-filtered, cannot cross users, and invalidate older snapshots', async () => {
  const h = createHarness('useBookmarks', ['user-a']); let state = h.render(); await settle();
  h.nextRequest().resolve({ data: [bookmark('existing')], error: null }); await settle(); state = h.render();
  const oldRefresh = state.refreshBookmarks(); await settle(); const oldSnapshot = h.nextRequest();
  const removal = state.removeBookmark('existing'); await settle(); const remove = h.nextRequest('delete');
  assert.ok(remove.filters.some(([field, value]) => field === 'user_id' && value === 'user-a'));
  remove.resolve({ error: null }); await removal; await settle(); const afterMutation = h.nextRequest();
  oldSnapshot.resolve({ data: [bookmark('existing')], error: null }); await oldRefresh; await settle();
  assert.deepEqual(h.render().bookmarks, [], 'A snapshot predating deletion must not resurrect that row');
  afterMutation.resolve({ data: [], error: null }); await settle(); state = h.render();
  const add = state.addBookmark('country', 'Singapore', { zero: 0 }); await settle(); const addRequest = h.nextRequest('insert');
  h.render(['user-b']); await settle(); h.nextRequest('select', 'user-b').resolve({ data: [bookmark('b-only', 'user-b')], error: null }); await settle();
  addRequest.resolve({ data: bookmark('late-add'), error: null }); assert.equal(await add, null);
  assert.deepEqual(h.render().bookmarks.map(row => row.id), ['b-only']);
  const finalRefresh = h.render().refreshBookmarks(); await settle(); const pending = h.nextRequest();
  h.unmount(); pending.resolve({ data: [bookmark('after-unmount', 'user-b')], error: null }); await finalRefresh;
});

test('bookmark logout and return to the same user cannot revive an earlier session request', async () => {
  const h = createHarness('useBookmarks', ['user-a']); h.render(); await settle(); const old = h.nextRequest();
  const guest = h.render([null]); assert.equal(guest.loading, false); assert.deepEqual(guest.bookmarks, []);
  h.render(['user-a']); await settle(); h.nextRequest().resolve({ data: [bookmark('new-session')], error: null }); await settle();
  old.resolve({ data: [bookmark('old-session')], error: null }); await settle();
  assert.deepEqual(h.render().bookmarks.map(row => row.id), ['new-session']); h.unmount();
});

test('generic realtime isolates users and tables, validates rows, deduplicates inserts and releases channels', () => {
  const validator = value => typeof value?.label === 'string';
  const h = createHarness('useRealtimeSync', ['bookmarks', 'user-a', [{ id: 'seed', label: 'initial' }], validator]);
  assert.equal(h.render().data[0].id, 'seed'); const first = h.channels[0];
  emit(first, 'INSERT', { id: 'new', user_id: 'user-a', label: 'current' });
  emit(first, 'INSERT', { id: 'new', user_id: 'user-a', label: 'duplicate' });
  emit(first, 'INSERT', { id: 'wrong-user', user_id: 'user-b', label: 'invalid' });
  emit(first, 'INSERT', { id: 'invalid', user_id: 'user-a', label: 0 });
  emit(first, 'INSERT', { label: 'no id' });
  assert.deepEqual(h.render().data.map(row => row.id), ['seed', 'new']);
  emit(first, 'UPDATE', { id: 'new', user_id: 'user-a', label: 'updated' });
  assert.equal(h.render().data[1].label, 'updated'); emit(first, 'DELETE', { id: 'seed' });
  assert.deepEqual(h.render().data.map(row => row.id), ['new']);
  assert.deepEqual(h.render(['saved_searches', 'user-a', [], validator]).data, []);
  assert.equal(first.unsubscribeCalls, 1); const second = h.channels[1];
  emit(first, 'INSERT', { id: 'stale-table', label: 'stale' }); assert.deepEqual(h.render().data, []);
  h.render(['saved_searches', 'user-b', [], validator]); assert.equal(second.unsubscribeCalls, 1); const third = h.channels[2];
  emit(second, 'INSERT', { id: 'stale-user', label: 'stale' }); emit(third, 'INSERT', { id: 'b-row', user_id: 'user-b', label: 'current' });
  assert.deepEqual(h.render().data.map(row => row.id), ['b-row']);
  const guest = h.render(['saved_searches', null, [], validator]); assert.deepEqual(guest.data, []); assert.equal(guest.channel, null); assert.equal(third.unsubscribeCalls, 1);
  h.render(['saved_searches', 'user-c', [], validator]); const final = h.channels[3]; h.unmount();
  assert.equal(final.unsubscribeCalls, 1); emit(final, 'INSERT', { id: 'late', label: 'ignored' });
});

test('guest and unconfigured realtime hooks never open channels', () => {
  for (const [name, args, configured] of [
    ['useRealtimeSync', ['bookmarks', null, [{ id: 'private-seed' }]], true], ['useRealtimeSync', ['bookmarks', 'user-a'], false],
    ['useMarketDataSync', [], true], ['useMarketDataSync', ['user-a'], false],
  ]) {
    const h = createHarness(name, args, configured); const state = h.render();
    assert.equal(state.channel, null); assert.equal(h.channels.length, 0);
    assert.deepEqual(state.data ?? state.marketData, []); h.unmount();
  }
});

test('market realtime preserves real zero and missing provenance, rejects invalid rows and stops old-user events', () => {
  const h = createHarness('useMarketDataSync', ['user-a']); h.render(); const first = h.channels[0];
  emit(first, 'INSERT', quote()); emit(first, 'INSERT', quote());
  emit(first, 'INSERT', { ...quote('missing-price'), price: undefined }); emit(first, 'INSERT', { ...quote('bad-number'), volume: Infinity });
  let state = h.render(); assert.equal(state.marketData.length, 1); assert.equal(state.marketData[0].price, 0);
  assert.equal(state.marketData[0].volume, 0); assert.equal(state.marketData[0].data_source, undefined);
  assert.equal(state.marketData[0].timestamp, '2023-01-02T00:00:00Z');
  emit(first, 'UPDATE', { ...quote(), price: 4 }); assert.equal(h.render().marketData[0].price, 4);
  emit(first, 'DELETE', { id: 'quote-a' }); assert.deepEqual(h.render().marketData, []);
  h.render(['user-b']); assert.equal(first.unsubscribeCalls, 1); const second = h.channels[1];
  emit(first, 'INSERT', quote('old-user')); emit(second, 'INSERT', quote('current-user'));
  assert.deepEqual(h.render().marketData.map(row => row.id), ['current-user']);
  state = h.render([null]); assert.deepEqual(state.marketData, []); assert.equal(state.channel, null); assert.equal(second.unsubscribeCalls, 1);
  h.render(['user-c']); const last = h.channels[2]; h.unmount(); assert.equal(last.unsubscribeCalls, 1); emit(last, 'INSERT', quote('after-unmount'));
});


test('successful bookmark insertion keeps JSON zero and refreshes the snapshot; failed deletion preserves the row', async () => {
  const h = createHarness('useBookmarks', ['user-a']); h.render(); await settle();
  h.nextRequest().resolve({ data: [], error: null }); await settle();
  const item = { zero: 0, unknown: null, nested: [false, 'fixture'] };
  const insertion = h.render().addBookmark('country', 'Singapore', item); await settle();
  const request = h.nextRequest('insert'); assert.deepEqual(request.values.item_data, item);
  request.resolve({ data: { ...bookmark('saved'), item_data: item }, error: null });
  assert.deepEqual((await insertion).item_data, item); await settle();
  assert.equal(h.render().loading, true, 'Successful mutation starts a fresh snapshot');
  h.nextRequest().resolve({ data: [{ ...bookmark('saved'), item_data: item }], error: null }); await settle();
  let state = h.render(); assert.equal(state.loading, false); assert.equal(state.error, null);
  const deletion = state.removeBookmark('saved'); await settle();
  h.nextRequest('delete').resolve({ error: { message: 'Synthetic permission denied' } }); await deletion;
  state = h.render(); assert.deepEqual(state.bookmarks.map(row => row.id), ['saved']);
  assert.match(state.error.message, /permission denied/); assert.equal(h.errors.length, 1); h.unmount();
});
