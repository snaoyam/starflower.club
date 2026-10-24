import test from 'node:test';
import assert from 'node:assert/strict';
import { createSiteDataLoader, subscribeToSiteData } from '../src/site-data.mjs';

const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};
const tick = () => new Promise(resolve => setImmediate(resolve));
const response = data => ({ ok: true, json: async () => data });

test('첫 방문은 목록만 요청하고 상세는 선택할 때만 요청하며 진행 중·완료 응답을 공유한다', async () => {
  const requests = [], pending = deferred();
  const detail = 'data/details/news/abc.json';
  const catalog = { news: [{ id: 'news', detailPath: detail }] };
  const load = createSiteDataLoader({ resolve: file => `/starflower-test/${file}`, fetchData: (url, options) => {
    requests.push({ url, options });
    return url.endsWith('site.json') ? Promise.resolve(response(catalog)) : pending.promise;
  } });
  assert.deepEqual(requests, []);
  assert.deepEqual(await load('data/site.json'), catalog);
  assert.deepEqual(requests, [{ url: '/starflower-test/data/site.json', options: { cache: 'no-cache' } }]);
  const first = load(detail), second = load(detail);
  assert.equal(first, second);
  await tick();
  assert.equal(requests.length, 2);
  pending.resolve(response({ id: 'news', body: '본문', photos: [] }));
  assert.equal((await first).body, '본문');
  assert.equal(await load(detail), await second);
  assert.equal(requests.length, 2);
  await load('data/details/news/new-content-hash.json');
  assert.equal(requests.length, 3);
});

test('통신 실패·HTTP 오류·잘못된 JSON은 캐시하지 않아 다시 시도할 수 있다', async () => {
  for (const fail of [() => Promise.reject(Error('offline')), () => ({ ok: false }), () => ({ ok: true, json: () => Promise.reject(Error('invalid json')) })]) {
    let requests = 0;
    const load = createSiteDataLoader({ fetchData: () => ++requests === 1 ? fail() : response({ body: '재시도 성공' }) });
    await assert.rejects(load('detail.json'));
    assert.equal((await load('detail.json')).body, '재시도 성공');
    assert.equal(requests, 2);
  }
});

test('빠른 화면 전환 후 이전 요청이 늦게 도착해도 새 화면을 덮어쓰지 않는다', async () => {
  const pending = { a: deferred(), b: deferred() }, states = [];
  const load = createSiteDataLoader({ fetchData: file => pending[file].promise });
  const leaveA = subscribeToSiteData(load, 'a', state => states.push(['a', state]));
  leaveA();
  const leaveB = subscribeToSiteData(load, 'b', state => states.push(['b', state]));
  pending.b.resolve(response({ id: 'b' }));
  await tick();
  pending.a.resolve(response({ id: 'a' }));
  await tick();
  assert.deepEqual(states.filter(([,state]) => state.data), [['b', { data: { id: 'b' }, error: false }]]);
  assert.deepEqual(await load('a'), { id: 'a' });
  leaveB();
});

test('떠난 페이지의 오류는 표시하지 않고 현재 페이지의 실패·재시도 상태는 전달한다', async () => {
  const pending = deferred(), states = [];
  const cancel = subscribeToSiteData(() => pending.promise, 'old', state => states.push(state));
  cancel();
  pending.reject(Error('late error'));
  await tick();
  assert.deepEqual(states, [{ data: null, error: false }]);
  const load = createSiteDataLoader({ fetchData: (() => { let count=0; return () => ++count === 1 ? Promise.reject(Error()) : response({ id: 'retry' }); })() });
  subscribeToSiteData(load, 'current', state => states.push(state));
  await tick();
  assert.deepEqual(states.at(-1), { data: null, error: true });
  subscribeToSiteData(load, 'current', state => states.push(state));
  await tick();
  assert.deepEqual(states.at(-1), { data: { id: 'retry' }, error: false });
});

test('준비 중에는 같은 대기 요청을 공유하고 준비된 상세는 동기적으로 읽어 로딩 화면을 건너뛴다', async () => {
  const pending=deferred();let requests=0;
  const load=createSiteDataLoader({fetchData:()=>{requests++;return pending.promise;}});
  let first,second;
  try{load.read('detail');}catch(wait){first=wait;}
  try{load.read('detail');}catch(wait){second=wait;}
  assert.ok(first instanceof Promise);assert.equal(first,second);
  pending.resolve(response({title:'준비된 내용'}));await first;
  assert.deepEqual(load.read('detail'),{data:{title:'준비된 내용'},error:false});
  assert.equal(load.read('detail'),load.read('detail'));assert.equal(requests,1);
});

test('실패한 상세는 재시도 화면으로 전달되고 명시적 재시도로 새 내용을 준비한다',async()=>{
  let requests=0;
  const load=createSiteDataLoader({fetchData:()=>++requests===1?Promise.reject(Error('offline')):response({title:'복구'})});
  let waiting;try{load.read('detail');}catch(p){waiting=p;}
  await waiting;
  assert.deepEqual(load.read('detail'),{data:null,error:true});
  const retry=load.retry('detail');assert.throws(()=>load.read('detail'),p=>p instanceof Promise);
  await retry;assert.equal(load.read('detail').data.title,'복구');assert.equal(requests,2);
});

test('관심을 보인 링크만 미리 준비하며 데이터 절약·느린 연결은 미리 받지 않는다',async()=>{
  const {prefetchSiteDetail}=await import('../src/site-data.mjs');
  const requests=[];const load=createSiteDataLoader({fetchData:file=>{requests.push(file);return response({file});}});
  const record={detailPath:'selected.json'};
  for(const connection of [{saveData:true},{effectiveType:'2g'},{effectiveType:'slow-2g'}])await prefetchSiteDetail(load,record,connection);
  await prefetchSiteDetail(load,null);assert.deepEqual(requests,[]);
  await Promise.all([prefetchSiteDetail(load,record,{effectiveType:'4g'}),prefetchSiteDetail(load,record)]);
  assert.deepEqual(requests,['selected.json']);assert.equal(load.read(record.detailPath).data.file,'selected.json');
});

test('미리 받기 오류는 밖으로 전파하지 않으며 다음 선택에서 다시 받을 수 있다',async()=>{
  const {prefetchSiteDetail}=await import('../src/site-data.mjs');let requests=0;
  const load=createSiteDataLoader({fetchData:()=>++requests===1?Promise.reject(Error('offline')):response({ok:true})});
  await prefetchSiteDetail(load,{detailPath:'detail'});
  await prefetchSiteDetail(load,{detailPath:'detail'});
  assert.deepEqual(load.read('detail'),{data:{ok:true},error:false});assert.equal(requests,2);
});
