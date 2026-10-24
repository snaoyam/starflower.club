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

test('Markdown은 임의 키·중첩 값·문단을 보존하고 프로토타입을 변경하지 않는다',()=>{
 const info={제목:'제목: 별',내용:'본문\n\n제목: 본문 속 문장\n# 해시태그',...extras};
 assert.deepEqual(parseFields('\uFEFF'+serializeFields(info)),info);
 assert.equal(Object.getPrototypeOf(parseFields(serializeFields(info))),Object.prototype);
 assert.equal({}.custom,undefined);
});

test('손상된 Markdown·목록이 아닌 최상위 값·기존 필드의 잘못된 타입을 명확히 거부한다',()=>{
 for(const value of ['{"제목":', '{"제목":"별",}', 'null', '[]', '"text"', '제목: 별']) assert.throws(()=>parseFields(value),/Markdown/);
 assert.throws(()=>validateContentRecord('사이트정보.md',serializeFields({창립연도:[1987]})),/창립연도/);
 assert.throws(()=>validateContentRecord('전시정보.md',serializeFields({정렬숫자:[1]})),/정렬숫자/);
 assert.throws(()=>validateContentRecord('소개.md',serializeFields({내용:{}})),/소개.md.*내용/);
 assert.throws(()=>validateContentRecord('소식.md',serializeFields({제목:42})),/소식.md.*제목/);
 assert.throws(()=>validateContentRecord('FAQ.md',serializeFields({항목:[{질문:'질문',답변:false}]})),/FAQ/);
 assert.throws(()=>validateEdits({}, {'content/소개.md':{text:'- 내용\n잘못된 들여쓰기'}}),/content\/소개.md.*Markdown/);
});

test('허용 경로는 콘텐츠 Markdown으로 변경하고 JSON·TXT·임의 경로 쓰기는 허용하지 않는다',()=>{
 for(const p of ['content/소개.md','content/FAQ.md','content/설정/사이트정보.md','content/설정/모집링크.md','content/설정/하단영역.md','content/전시/test/전시정보.md','content/소식/test/소식.md']){
  assert.equal(isContentPath(p),true,p);
  assert.equal(isContentPath(p.replace('.md','.txt')),false,p);
  assert.equal(isContentPath(p.replace('.md','.json')),false,p);
 }
 for(const p of ['content/설정/token.json','content/../secrets.json','content/소식/test/unknown.json'])assert.equal(isContentPath(p),false,p);
});

test('관리자 필드 수정·빌드·재편집에서 사용자 지정 값을 잃지 않는다',async t=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'starflower-markdown-'));
 t.after(()=>fs.rm(root,{recursive:true,force:true}));
 const records={
  'content/소개.md':{내용:'소개',...extras},
  'content/설정/하단영역.md':{내용:'주소\n연락처',...extras},
  'content/설정/사이트정보.md':{모집안내:'모집',...extras},
  'content/설정/모집링크.md':{url:'http://example.org/apply',...extras},
  'content/FAQ.md':{항목:[{질문:'질문',답변:'답변\n둘째 줄',임의키:42}],...extras},
  'content/전시/test/전시정보.md':{제목:'전시',분류:'사진',정렬숫자:20261024,...extras},
  'content/소식/test/소식.md':{제목:'소식',분류:'행사',날짜:'2026-10-24',내용:'본문',...extras},
 };
 const changes=Object.fromEntries(Object.entries(records).map(([p,info])=>[p,{text:serializeFields(info)}]));
 for(const [p,key,value] of [
  ['content/소개.md','내용','새 소개\n\n두 번째 문단'],
  ['content/설정/하단영역.md','내용','새 하단영역'],
  ['content/설정/사이트정보.md','모집안내','새 모집'],
  ['content/설정/모집링크.md','url','https://example.net/apply?x=1#form'],
  ['content/소식/test/소식.md','제목','새 제목'],
 ])changes[p].text=updateContentField(changes[p].text,key,value);
 validateEdits({},changes);
 for(const [p,v] of Object.entries(changes)){
  await fs.mkdir(path.dirname(path.join(root,p)),{recursive:true});await fs.writeFile(path.join(root,p),v.text);
 }
 const data=await generateContent({root,quiet:true});
 assert.equal(data.introduction,'새 소개\n\n두 번째 문단');assert.equal(data.footerText,'새 하단영역');
 assert.equal(data.settings.모집안내,'새 모집');assert.equal(data.recruitmentUrl,'https://example.net/apply?x=1#form');
 assert.equal(data.news[0].title,'새 제목');assert.deepEqual(data.faqs,[{question:'질문',answer:'답변\n둘째 줄'}]);
 const snapshot=JSON.parse(await fs.readFile(path.join(root,'public/data/admin.json'),'utf8'));
 for(const [p,v] of Object.entries(changes)){
  assert.equal(snapshot.files[p].text,v.text,p);
  const info=parseFields(snapshot.files[p].text);
  for(const [key,value] of Object.entries(extras))assert.deepEqual(info[key],value,p+':'+key);
 }
 await fs.writeFile(path.join(root,'content/소개.md'),'{broken');
 await assert.rejects(generateContent({root,quiet:true}),/소개.md.*Markdown/);
});

test('문자열과 숫자·불리언·빈 값, 중첩 목록의 자료형을 구분해 왕복 보존한다',()=>{
 const strings=['','true','false','null','[]','{}','1987','1e999','001','"인용문"','첫 줄\n\n둘째 줄','\n첫 줄','끝 줄\n','공백  ','첫 줄\n  들여쓴 줄','탭\t끝','CR\r\nLF'];
 const info={문자열:strings,숫자:[0,-1,1.5,1e20],상태:[true,false,null,[],{}],중첩:[{항목:[['',1],{추가:'값'}]}], '이름: 콜론':'자유 키', '':'빈 키', ' 여러 단어 ':'공백 키'};
 const markdown=serializeFields(info);
 assert.deepEqual(parseFields(markdown),info);
 assert.deepEqual(parseFields('\uFEFF'+markdown.replaceAll('\n','\r\n')),info);
 assert.deepEqual(parseFields(''),{});
 assert.deepEqual(parseFields('- 추가정보\n  - 임의 키: 값\n- 설명: 첫 줄\n\n  두 번째 줄\n'),{추가정보:{'임의 키':'값'},설명:'첫 줄\n\n두 번째 줄'});
});

test('중복된 키와 깨진 중첩 목록은 저장 전에 거부한다',()=>{
 for(const text of ['- 제목: 첫째\n- 제목: 둘째','- 항목\n내용','- 항목\n    1. 값\n  - 틀린 깊이: 값','- "닫히지 않은 키: 값']) assert.throws(()=>parseFields(text),/Markdown/);
 const cycle={};cycle.self=cycle;
 assert.throws(()=>serializeFields(cycle),/순환/);
 assert.throws(()=>serializeFields({value:undefined}));
});

test('사진의 중복 추가정보는 사진 전용 형식으로 유지하고 콘텐츠 MD와 혼동하지 않는다',()=>{
 assert.doesNotThrow(()=>validateEdits({}, {
  'content/소개.md':{text:'- 내용: 소개\n'},
  'content/소식/test/사진/01.md':{text:'- 제목: 별\n- 설명: 설명\n- 추가정보\n  - 필터: L\n  - 필터: R\n'},
 }));
});
