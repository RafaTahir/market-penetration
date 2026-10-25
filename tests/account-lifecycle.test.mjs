/** Actual component lifecycles with deterministic hooks and an isolated Supabase boundary. */
import assert from 'node:assert/strict';
import { setImmediate } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import { build } from 'esbuild';

const root = fileURLToPath(new URL('../', import.meta.url));
const compiled = await build({
  stdin: {
    contents: `
      export { default as CollaborationPanel } from './src/components/CollaborationPanel.tsx';
      export { default as ExportScheduler } from './src/components/ExportScheduler.tsx';
      export { default as UserDashboard } from './src/components/UserDashboard.tsx';
    `,
    resolveDir: root,
    loader: 'ts',
  },
  bundle: true,
  platform: 'node',
  format: 'cjs',
  write: false,
  external: ['react', 'lucide-react', '*/AuthContext', '*/supabaseClient', '*/useBookmarks'],
});

function user(id) {
  return { id, email: `${id}@example.test`, user_metadata: { full_name: id } };
}

function deferred() {
  let resolve;
  const promise = new Promise(complete => { resolve = complete; });
  return { promise, resolve };
}

function text(node) {
  if (Array.isArray(node)) return node.map(text).join(' ');
  if (node && typeof node === 'object') return text(node.props?.children);
  return typeof node === 'string' || typeof node === 'number' ? String(node) : '';
}

function harness(component, initialProps = {}) {
  let currentUser = user('user-a');
  let props = initialProps;
  let cursor = 0;
  let tree;
  let dirty;
  const states = [];
  const effects = [];
  const pendingEffects = [];
  const requests = [];
  const channels = [];

  // Run the components' real callbacks/effects, committing changed dependencies and
  // cleanup in React's order. Assertions use the rendered tree, never hook indices.
  const react = {
    createElement(type, attributes, ...children) { return { type, props: { ...attributes, children } }; },
    useState(initial) {
      const index = cursor++;
      if (!(index in states)) states[index] = initial;
      return [states[index], value => {
        const next = typeof value === 'function' ? value(states[index]) : value;
        dirty ||= !Object.is(next, states[index]);
        states[index] = next;
      }];
    },
    useEffect(callback, deps) {
      const index = cursor++;
      const previous = effects[index];
      if (!previous || deps.some((value, at) => !Object.is(value, previous.deps[at]))) {
        pendingEffects.push({ index, callback, deps });
      }
    },
  };
  const supabase = {
    from(table) {
      const request = { table, operation: 'select', filters: {} };
      let pending;
      const query = {
        select() { return query; },
        eq(field, value) { request.filters[field] = value; return query; },
        order() { return query; },
        returns() { return query; },
        maybeSingle() { return query; },
        insert(values) { Object.assign(request, { operation: 'insert', values }); return query; },
        update(values) { Object.assign(request, { operation: 'update', values }); return query; },
        delete() { request.operation = 'delete'; return query; },
        then(resolve, reject) {
          if (!pending) {
            pending = deferred();
            requests.push({ ...request, resolve: pending.resolve });
          }
          return pending.promise.then(resolve, reject);
        },
      };
      return query;
    },
    channel(name) {
      const channel = {
        name, handlers: [], releases: 0, tracked: [],
        on(event, filter, callback) { channel.handlers.push({ event, filter, callback }); return channel; },
        subscribe(callback) { channel.status = callback; return channel; },
        unsubscribe() { channel.releases++; return Promise.resolve('ok'); },
        track(value) { channel.tracked.push(value); return Promise.resolve('ok'); },
        presenceState() { return { member: [{}] }; },
      };
      channels.push(channel);
      return channel;
    },
  };
  const module = { exports: {} };
  const mocks = name => {
    if (name === 'react') return react;
    if (name === 'lucide-react') return new Proxy({}, { get: (target, icon) => icon });
    if (name.endsWith('/AuthContext')) return { useAuth: () => ({ user: currentUser }) };
    if (name.endsWith('/supabaseClient')) return { supabase };
    if (name.endsWith('/useBookmarks')) return { useBookmarks: () => ({ bookmarks: [], loading: false, error: null }) };
    throw new Error(`Unexpected component dependency: ${name}`);
  };
  // Only the explicit mocks can be required. No real client, environment variables,
  // timers, fetch, or network modules are available to the bundled component code.
  runInNewContext(compiled.outputFiles[0].text, {
    require: mocks, module, exports: module.exports,
    console: { error() {} },
  });
  const Component = module.exports[component];

  function render(nextProps = props) {
    props = nextProps;
    let commits = 0;
    do {
      assert.ok(commits++ < 20, 'Component should settle without a render loop');
      dirty = false;
      cursor = 0;
      tree = Component(props);
      for (const effect of pendingEffects.splice(0)) {
        effects[effect.index]?.cleanup?.();
        effects[effect.index] = { ...effect, cleanup: effect.callback() };
      }
    } while (dirty);
  }
  function nodes(type) {
    const found = [];
    function visit(node) {
      if (Array.isArray(node)) return node.forEach(visit);
      if (!node || typeof node !== 'object') return;
      if (node.type === type) found.push(node);
      visit(node.props?.children);
    }
    visit(tree);
    return found;
  }
  return {
    render, nodes, channels,
    text: () => text(tree),
    setUser(id) { currentUser = user(id); },
    async flush() { await setImmediate(); render(); },
    unmount() { effects.forEach(effect => effect.cleanup?.()); },
    button(label) {
      const button = nodes('button').find(node => text(node).trim() === label);
      assert.ok(button, `Expected button: ${label}`);
      return button.props;
    },
    take(table, filters = {}, operation = 'select') {
      const index = requests.findIndex(request => request.table === table && request.operation === operation
        && Object.entries(filters).every(([field, value]) => request.filters[field] === value));
      assert.ok(index >= 0, `Expected mocked ${operation} request to ${table}`);
      return requests.splice(index, 1)[0];
    },
  };
}

const panelProps = { targetType: 'market', targetId: 'a', isOpen: true, onClose() {} };
const comment = { id: 'fresh', user_id: 'user-b', content: 'CURRENT COMMENT', target_type: 'market', target_id: 'b', created_at: '2026-01-01', user_name: 'Bob' };
const exportRow = { id: 'b-export', name: 'CURRENT EXPORT', export_type: 'csv', config: {}, schedule_cron: '0 9 * * *', is_active: true, last_run: null, next_run: null };

test('collaboration cleans up channels and ignores old targets while retaining current events', async () => {
  const h = harness('CollaborationPanel', panelProps);
  h.render();
  await h.flush();
  assert.equal(h.channels.length, 2);
  const old = h.take('comments', { target_id: 'a' });
  h.render({ ...panelProps, targetId: 'b' });
  await h.flush();
  assert.ok(h.channels.slice(0, 2).every(channel => channel.releases === 1));

  const currentChannel = h.channels[2];
  assert.equal(currentChannel.handlers[0].filter.filter, 'target_id=eq.b');
  const emit = value => currentChannel.handlers[0].callback({ new: value });
  emit(comment);
  emit(comment);
  emit({ ...comment, id: 'wrong-type', target_type: 'other', content: 'WRONG TARGET' });
  emit({ ...comment, id: 'wrong-id', target_id: 'other', content: 'WRONG TARGET' });
  h.take('comments', { target_id: 'b' }).resolve({ data: [], error: null });
  await h.flush();
  old.resolve({ data: [{ ...comment, target_id: 'a', content: 'STALE COMMENT' }], error: null });
  h.channels[0].handlers[0].callback({ new: { ...comment, id: 'old-event', target_id: 'a', content: 'STALE EVENT' } });
  h.channels[1].status('SUBSCRIBED');
  await h.flush();
  assert.equal(h.text().match(/CURRENT COMMENT/g)?.length, 1, 'Early realtime inserts survive the snapshot and appear once');
  assert.doesNotMatch(h.text(), /STALE COMMENT|STALE EVENT|WRONG TARGET/);
  assert.equal(h.channels[1].tracked.length, 0, 'Closed presence cannot start tracking');

  h.render({ ...panelProps, targetId: 'b', isOpen: false });
  assert.ok(h.channels.every(channel => channel.releases === 1), 'Closing releases both current channels');
  h.render({ ...panelProps, targetId: 'c' });
  await h.flush();
  h.unmount();
  assert.ok(h.channels.every(channel => channel.releases === 1), 'Unmount releases both reopened channels');
});

test('a failed comment insert preserves the draft and shows a retry error', async () => {
  const h = harness('CollaborationPanel', panelProps);
  h.render();
  await h.flush();
  h.take('comments').resolve({ data: [], error: null });
  await h.flush();
  h.nodes('input')[0].props.onChange({ target: { value: 'Keep my draft' } });
  h.render();
  const submission = h.nodes('form')[0].props.onSubmit({ preventDefault() {} });
  await h.flush();
  assert.equal(h.nodes('input')[0].props.disabled, true);
  h.take('comments', {}, 'insert').resolve({ error: { message: 'Synthetic denied insert' } });
  await submission;
  h.render();
  assert.equal(h.nodes('input')[0].props.value, 'Keep my draft');
  assert.equal(h.nodes('input')[0].props.disabled, false);
  assert.match(h.text(), /Your comment could not be posted/);
  h.unmount();
});

test('scheduler discards old-user replies and retains an unsuccessfully created draft', async () => {
  const h = harness('ExportScheduler');
  h.render();
  await h.flush();
  const old = h.take('scheduled_exports', { user_id: 'user-a' });
  h.setUser('user-b');
  h.render();
  await h.flush();
  h.take('scheduled_exports', { user_id: 'user-b' }).resolve({ data: [exportRow], error: null });
  await h.flush();
  old.resolve({ data: [{ ...exportRow, id: 'old-export', name: 'STALE EXPORT' }], error: null });
  await h.flush();
  assert.match(h.text(), /CURRENT EXPORT/);
  assert.doesNotMatch(h.text(), /STALE EXPORT/);

  h.button('New Schedule').onClick();
  h.render();
  h.nodes('input')[0].props.onChange({ target: { value: 'Keep schedule draft' } });
  h.render();
  const submission = h.button('Create Schedule').onClick();
  await h.flush();
  const insert = h.take('scheduled_exports', {}, 'insert');
  assert.equal(insert.values.user_id, 'user-b');
  insert.resolve({ error: { message: 'Synthetic denied schedule' } });
  await submission;
  h.render();
  assert.equal(h.nodes('input')[0].props.value, 'Keep schedule draft');
  assert.match(h.text(), /The export schedule could not be created/);
  assert.ok(h.button('Create Schedule'), 'Failed creation keeps the form open');
  h.unmount();
});

test('dashboard ignores saved data from the previous user after an account change', async () => {
  const h = harness('UserDashboard');
  h.render();
  await h.flush();
  const tables = ['saved_searches', 'market_alerts', 'user_preferences'];
  const old = tables.map(table => h.take(table, { user_id: 'user-a' }));
  h.setUser('user-b');
  h.render();
  await h.flush();
  const search = { id: 'b-search', name: 'CURRENT SEARCH', countries: [], industries: [], is_favorite: false };
  const data = [[search], [], { default_countries: [] }];
  tables.forEach((table, index) => h.take(table, { user_id: 'user-b' }).resolve({ data: data[index], error: null }));
  await h.flush();
  old.forEach((request, index) => request.resolve({
    data: index === 0 ? [{ ...search, id: 'old-search', name: 'STALE SEARCH' }] : index === 1 ? [] : { default_countries: ['stale'] },
    error: null,
  }));
  await h.flush();
  assert.match(h.text(), /CURRENT SEARCH/);
  assert.doesNotMatch(h.text(), /STALE SEARCH/);
  h.unmount();
});
