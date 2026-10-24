import test from 'node:test';
import assert from 'node:assert/strict';
import { createImagePreloader, createPhotoNavigation } from '../src/lightbox-navigation.mjs';

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
function gallery() {
  const images = Array.from({ length: 5 }, deferred);
  const calls = [], states = [];
  const navigation = createPhotoNavigation({ initialIndex: 0, count: 5,
    load: (index, priority) => { calls.push([index, priority]); return images[index].promise; },
    onState: state => states.push(state),
  });
  return { images, calls, states, navigation };
}

test('원본 다운로드 뒤 디코딩까지 기다리고 중복 요청은 재사용한다', async () => {
  const ready = deferred();
  const image = { decode: () => ready.promise };
  let created = 0;
  const load = createImagePreloader(() => { created++; return image; });
  const first = load('photo.webp');
  let settled = false;
  first.then(() => { settled = true; });
  await Promise.resolve();
  assert.equal(settled, false);
  assert.equal(load('photo.webp', 'high'), first);
  assert.equal(image.fetchPriority, 'high');
  assert.equal(created, 1);
  ready.resolve();
  assert.equal(await first, image);
  assert.equal(await load('photo.webp'), image);
});

test('앞뒤 사진을 준비하고 새 사진이 준비되기 전에는 설명 인덱스를 유지한다', async () => {
  const { images, calls, states, navigation } = gallery();
  assert.deepEqual(calls, [[0, 'high'], [1, 'low']]);
  const changing = navigation.move(1);
  assert.deepEqual(states.at(-1), { index: 0, loading: true, error: '' });
  images[1].resolve();
  await changing;
  assert.deepEqual(states.at(-1), { index: 1, loading: false, error: '' });
  assert.ok(calls.some(([index, priority]) => index === 2 && priority === 'low'));
  navigation.dispose();
});

test('빠르게 연속 이동해도 늦게 도착한 이전 요청으로 되돌아가지 않는다', async () => {
  const { images, states, navigation } = gallery();
  const first = navigation.move(1);
  const second = navigation.move(1);
  images[2].resolve();
  await second;
  assert.equal(states.at(-1).index, 2);
  images[1].resolve();
  await first;
  assert.equal(states.at(-1).index, 2);
  navigation.dispose();
});

test('대기 중 반대 방향으로 돌아오거나 닫으면 미완료 이동을 반영하지 않는다', async () => {
  const { images, states, navigation } = gallery();
  const pending = navigation.move(1);
  await navigation.move(-1);
  assert.deepEqual(states.at(-1), { index: 0, loading: false, error: '' });
  images[1].resolve();
  await pending;
  assert.equal(states.at(-1).index, 0);
  const closing = navigation.move(1);
  navigation.dispose();
  const before = states.length;
  await closing;
  assert.equal(states.length, before);
});

test('불러오기에 실패하면 현재 사진·설명을 유지하고 재시도를 허용한다', async () => {
  const { images, states, navigation } = gallery();
  const pending = navigation.move(1);
  images[1].reject(new Error('offline'));
  await pending;
  assert.equal(states.at(-1).index, 0);
  assert.equal(states.at(-1).loading, false);
  assert.match(states.at(-1).error, /다시 시도/);
  images[1] = deferred();
  const retry = navigation.move(1);
  images[1].resolve();
  await retry;
  assert.deepEqual(states.at(-1), { index: 1, loading: false, error: '' });
  navigation.dispose();
});

test('이미지 오류를 캐시에 남기지 않고 새 요청으로 복구한다', async () => {
  let created = 0;
  const load = createImagePreloader(() => ({ decode: () => ++created === 1 ? Promise.reject(new Error('network')) : Promise.resolve() }));
  await assert.rejects(load('photo.webp'));
  await load('photo.webp');
  assert.equal(created, 2);
});

test('첫 사진과 마지막 사진에서 바깥 방향 이동과 반대 끝 사진 미리보기를 막는다', async () => {
  for (const [initialIndex, direction, expected] of [[0, -1, [0, 1]], [4, 1, [4, 3]]]) {
    const calls = [], states = [];
    const navigation = createPhotoNavigation({ initialIndex, count: 5,
      load: async index => { calls.push(index); }, onState: state => states.push(state),
    });
    assert.deepEqual(calls, expected);
    await navigation.move(direction);
    await navigation.move(direction);
    assert.deepEqual(calls, expected);
    assert.deepEqual(states, []);
    await navigation.move(-direction);
    assert.equal(states.at(-1).index, initialIndex - direction);
    navigation.dispose();
  }
});

test('한 장뿐인 갤러리는 어느 방향으로도 이동하거나 추가 이미지를 요청하지 않는다', async () => {
  const calls = [], states = [];
  const navigation = createPhotoNavigation({ initialIndex: 0, count: 1,
    load: async index => { calls.push(index); }, onState: state => states.push(state),
  });
  await navigation.move(-1);
  await navigation.move(1);
  assert.deepEqual(calls, [0]);
  assert.deepEqual(states, []);
  navigation.dispose();
});

test('빠르게 마지막 사진까지 요청한 뒤 더 눌러도 대기 중인 전환을 취소하거나 순환하지 않는다', async () => {
  const { images, calls, states, navigation } = gallery();
  const pending = [navigation.move(1), navigation.move(1), navigation.move(1), navigation.move(1)];
  await navigation.move(1);
  await navigation.move(1);
  images[4].resolve();
  await pending[3];
  assert.equal(states.at(-1).index, 4);
  assert.equal(states.at(-1).loading, false);
  for (let i=1;i<4;i++) images[i].resolve();
  await Promise.all(pending);
  assert.equal(states.at(-1).index, 4);
  assert.equal(calls.filter(([i,priority])=>i===0&&priority==='high').length, 1);
  assert.ok(calls.every(([i])=>i>=0&&i<5));
  navigation.dispose();
});
