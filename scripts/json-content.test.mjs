import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {parseFields, serializeFields, validateContentRecord} from '../src/content-format.mjs';
import {updateContentField, validateEdits} from '../src/admin-model.mjs';
import {isContentPath} from '../src/admin-github.mjs';
import {generateContent} from './build-content.mjs';

const extras = JSON.parse('{"사용자 지정 키: 긴 이름도 자유롭게": {"enabled": true,"items": [1,"문자",null]},"빈 값":null,"__proto__":{"custom":true}}');

test('JSON은 임의 키·중첩 값·문단을 보존하고 프로토타입을 변경하지 않는다',()=>{
 const info={제목:'제목: 별',내용:'본문\n\n제목: 본문 속 문장\n# 해시태그',...extras};
 assert.deepEqual(parseFields('\uFEFF'+serializeFields(info)),info);
 assert.equal(Object.getPrototypeOf(parseFields(serializeFields(info))),Object.prototype);
 assert.equal({}.custom,undefined);
});

test('손상된 JSON·객체가 아닌 최상위 값·기존 필드의 잘못된 타입을 명확히 거부한다',()=>{
 for(const value of ['', '{"제목":', '{"제목":"별",}', 'null', '[]', '"text"', '제목: 별']) assert.throws(()=>parseFields(value),/JSON/);
 assert.throws(()=>validateContentRecord('사이트정보.json','{"창립연도":[1987]}'),/창립연도/);
 assert.throws(()=>validateContentRecord('전시정보.json','{"정렬숫자":[1]}'),/정렬숫자/);
 assert.throws(()=>validateContentRecord('소개.json','{"내용":{}}'),/소개.json.*내용/);
 assert.throws(()=>validateContentRecord('소식.json','{"제목":42}'),/소식.json.*제목/);
 assert.throws(()=>validateContentRecord('FAQ.json','{"항목":[{"질문":"질문","답변":false}]}'),/FAQ/);
 assert.throws(()=>validateEdits({}, {'content/소개.json':{text:'{"내용":'}}),/content\/소개.json.*JSON/);
});

test('허용 경로는 콘텐츠 JSON으로 변경하고 TXT·임의 경로 쓰기는 허용하지 않는다',()=>{
 for(const p of ['content/소개.json','content/FAQ.json','content/설정/사이트정보.json','content/설정/모집링크.json','content/설정/푸터.json','content/전시/test/전시정보.json','content/소식/test/소식.json']){
  assert.equal(isContentPath(p),true,p);
  assert.equal(isContentPath(p.replace('.json','.txt')),false,p);
 }
 for(const p of ['content/설정/token.json','content/../secrets.json','content/소식/test/unknown.json'])assert.equal(isContentPath(p),false,p);
});

test('관리자 필드 수정·빌드·재편집에서 사용자 지정 JSON 값을 잃지 않는다',async t=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'starflower-json-'));
 t.after(()=>fs.rm(root,{recursive:true,force:true}));
 const records={
  'content/소개.json':{내용:'소개',...extras},
  'content/설정/푸터.json':{내용:'주소\n연락처',...extras},
  'content/설정/사이트정보.json':{모집안내:'모집',...extras},
  'content/설정/모집링크.json':{url:'http://example.org/apply',...extras},
  'content/FAQ.json':{항목:[{질문:'질문',답변:'답변\n둘째 줄',임의키:42}],...extras},
  'content/전시/test/전시정보.json':{제목:'전시',분류:'사진',정렬숫자:20261024,...extras},
  'content/소식/test/소식.json':{제목:'소식',분류:'행사',날짜:'2026-10-24',내용:'본문',...extras},
 };
 const changes=Object.fromEntries(Object.entries(records).map(([p,info])=>[p,{text:serializeFields(info)}]));
 for(const [p,key,value] of [
  ['content/소개.json','내용','새 소개\n\n두 번째 문단'],
  ['content/설정/푸터.json','내용','새 푸터'],
  ['content/설정/사이트정보.json','모집안내','새 모집'],
  ['content/설정/모집링크.json','url','https://example.net/apply?x=1#form'],
  ['content/소식/test/소식.json','제목','새 제목'],
 ])changes[p].text=updateContentField(changes[p].text,key,value);
 validateEdits({},changes);
 for(const [p,v] of Object.entries(changes)){
  await fs.mkdir(path.dirname(path.join(root,p)),{recursive:true});await fs.writeFile(path.join(root,p),v.text);
 }
 const data=await generateContent({root,quiet:true});
 assert.equal(data.introduction,'새 소개\n\n두 번째 문단');assert.equal(data.footerText,'새 푸터');
 assert.equal(data.settings.모집안내,'새 모집');assert.equal(data.recruitmentUrl,'https://example.net/apply?x=1#form');
 assert.equal(data.news[0].title,'새 제목');assert.deepEqual(data.faqs,[{question:'질문',answer:'답변\n둘째 줄'}]);
 const snapshot=JSON.parse(await fs.readFile(path.join(root,'public/data/admin.json'),'utf8'));
 for(const [p,v] of Object.entries(changes)){
  assert.equal(snapshot.files[p].text,v.text,p);
  const info=parseFields(snapshot.files[p].text);
  for(const [key,value] of Object.entries(extras))assert.deepEqual(info[key],value,p+':'+key);
 }
 await fs.writeFile(path.join(root,'content/소개.json'),'{broken');
 await assert.rejects(generateContent({root,quiet:true}),/소개.json.*JSON/);
});
