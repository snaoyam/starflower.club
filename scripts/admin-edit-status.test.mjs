import test from 'node:test';
import assert from 'node:assert/strict';
import { refreshEditingSnapshot } from '../src/admin-edit-status.mjs';
import { assertUnchanged, EDIT_STATE_MISMATCH_MESSAGE } from '../src/admin-github.mjs';

const path='content/소개.md';
const snapshot=(sha,text)=>({version:1,files:{[path]:{sha,text}}});
const old=snapshot('old','- 내용: 이전 소개');
const latest=snapshot('new','- 내용: 새 소개');
const client={checkCurrent:async files=>assertUnchanged(files,{tree:[{path,sha:'new',mode:'100644'}]},'edit')};

test('상태 새로고침은 최신 배포 자료와 GitHub가 일치하면 새 편집 자료를 반환한다',async()=>{
  assert.equal(await refreshEditingSnapshot({client,loadSnapshot:async()=>latest,snapshot:old,hasChanges:false}),latest);
});
test('저장 직후 메모리의 SHA가 최신이어도 배포 자료가 이전 상태이면 편집을 허용하지 않는다',async()=>{
  await assert.rejects(refreshEditingSnapshot({client,loadSnapshot:async()=>old,snapshot:latest,hasChanges:false}),{message:EDIT_STATE_MISMATCH_MESSAGE});
});
test('배포 완료 후 다시 확인하면 편집을 허용한다',async()=>{
  let deployed=old;
  const options={client,loadSnapshot:async()=>deployed,snapshot:latest,hasChanges:false};
  await assert.rejects(refreshEditingSnapshot(options));
  deployed=latest;
  assert.equal(await refreshEditingSnapshot(options),latest);
});
test('저장하지 않은 변경사항이 있을 때 원래 기준 자료를 유지한다',async()=>{
  const copy=structuredClone(latest);
  assert.equal(await refreshEditingSnapshot({client,loadSnapshot:async()=>copy,snapshot:latest,hasChanges:true}),latest);
});
test('저장하지 않은 변경사항이 있고 다른 사람이 저장·배포했다면 기준 자료를 교체하지 않는다',async()=>{
  const preserved=structuredClone(old);
  await assert.rejects(refreshEditingSnapshot({client,loadSnapshot:async()=>latest,snapshot:old,hasChanges:true}),{message:EDIT_STATE_MISMATCH_MESSAGE});
  assert.deepEqual(old,preserved);
});
test('배포 자료 요청 실패·잘못된 자료·GitHub 확인 실패는 편집을 허용하지 않는다',async()=>{
  for(const loadSnapshot of [async()=>{throw Error('연결 실패');},async()=>null,async()=>({version:1,files:[]})]){
    await assert.rejects(refreshEditingSnapshot({client,loadSnapshot,snapshot:old,hasChanges:false}));
  }
  await assert.rejects(refreshEditingSnapshot({client:{checkCurrent:async()=>{throw Error('권한 오류');}},loadSnapshot:async()=>latest,snapshot:old,hasChanges:false}),/권한 오류/);
});
