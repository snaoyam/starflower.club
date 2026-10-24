import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { createGitHubClient, parseTokenFile, ADMIN_TARGET, isContentPath, assertUnchanged } from '../src/admin-github.mjs';
import { assertRasterImage, aboutImagePath, recruitmentImagePath, mergedFiles, exhibitionSortNumber, recordPaths, serializeFields, parseFields, serializePhoto, parsePhotoMarkdown, validateEdits } from '../src/admin-model.mjs';
import { generateContent } from './build-content.mjs';

const credentials = { repository:'snaoyam/starflower.club', branch:'main', token:'dummy-test-only' };
const sourcePath='content/소식/event/소식.json';
const baseline={ [sourcePath]:{ sha:'old-file',text:"{\"제목\":\"기존 소식\",\"내용\":\"본문\"}" } };
function fixture({ conflict=false, status=200 }={}) {
  const calls=[];
  const fetcher=async(url,options)=>{
    const body=options.body&&JSON.parse(options.body);calls.push({url,...options,body});
    const route=url.replace('https://api.github.com/repos/snaoyam/starflower.club','');
    const answers={
      '/git/ref/heads/main':{object:{sha:'head'}},
      '/git/commits/head':{tree:{sha:'base-tree'}},
      '/git/trees/base-tree?recursive=1':{tree:[{path:sourcePath,type:'blob',mode:'100644',sha:conflict?'remote-change':'old-file'}]},
      '/git/blobs':{sha:'new-blob'},'/git/trees':{sha:'new-tree'},'/git/commits':{sha:'new-commit'},'/git/refs/heads/main':{},
    };
    return {ok:status<300,status:route.endsWith('/dispatches')?204:status,json:async()=>answers[route]??{}};
  };
  return {client:createGitHubClient(credentials,fetcher),calls};
}

test('starflower.token의 한 줄 토큰만 읽으며 저장소와 main 브랜치는 고정한다',()=>{
  assert.deepEqual(ADMIN_TARGET,{repository:'snaoyam/starflower.club',branch:'main'});
  assert.deepEqual(parseTokenFile('\uFEFF  dummy-test-only\r\n','starflower.token'),credentials);
  assert.equal(parseTokenFile('expired').token,'expired');
  for(const value of ['', '  ', '{}', JSON.stringify(credentials), 'token: abc', 'abc\ndef', '"abc"'])assert.throws(()=>parseTokenFile(value));
  assert.throws(()=>parseTokenFile('dummy','starflower.token.json'),/파일 이름/);
});
test('클라이언트에 다른 저장소·브랜치를 전달해도 고정 대상에만 배포 요청한다',async()=>{
  const calls=[];
  const client=createGitHubClient({repository:'evil/other',branch:'other',token:'dummy'},async(url,options)=>{calls.push({url,body:JSON.parse(options.body)});return{ok:true,status:204};});
  await client.dispatch();
  assert.equal(calls[0].url,'https://api.github.com/repos/snaoyam/starflower.club/actions/workflows/deploy.yml/dispatches');
  assert.deepEqual(calls[0].body,{ref:'main'});
});

test('콘텐츠 경로만 허용하고 워크플로·바로가기·숨김 파일·경로 이탈을 거부한다',()=>{
  assert.ok(isContentPath(sourcePath));assert.ok(isContentPath('content/전시/2026/작품/별 사진.md'));
  for(const p of ['.github/workflows/deploy.yml','content/../token.json','content/소식/x/사진/../../token.md','content/소식/_초안/소식.json','content/설정/token.json','content/소식/x/사진/a.svg','content\\소식\\x'])assert.equal(isContentPath(p),false,p);
  assert.throws(()=>assertUnchanged(baseline,{truncated:true,tree:[]}));
  assert.throws(()=>assertUnchanged(baseline,{tree:[{path:sourcePath,sha:'old-file',mode:'120000'}]}));
});
test('여러 파일을 한 커밋으로 저장한 뒤 별도로 Actions를 실행하고 토큰을 본문에 넣지 않는다',async()=>{
  const {client,calls}=fixture();
  const newPath='content/소식/new/사진/01.jpg';
  const result=await client.publish(baseline,{[sourcePath]:{text:"{\"제목\":\"바꾼 소식\",\"내용\":\"본문\"}"},[newPath]:{base64:'aW1hZ2U='}});
  assert.equal(result.files[sourcePath].sha,'new-blob');assert.equal(result.sha,'new-commit');
  const tree=calls.find(c=>c.url.endsWith('/git/trees')&&c.method==='POST');
  assert.equal(tree.body.base_tree,'base-tree');assert.equal(tree.body.tree.length,2);
  assert.deepEqual(calls.find(c=>c.method==='PATCH').body,{sha:'new-commit',force:false});
  assert.ok(calls.find(c=>c.url.endsWith('/git/commits')&&c.method==='POST').body.message.includes('[skip ci]'));
  assert.equal(calls.some(c=>c.url.endsWith('/dispatches')),false);
  await client.dispatch();
  assert.deepEqual(calls.at(-1).body,{ref:'main'});
  for(const c of calls){assert.ok(c.url.startsWith('https://api.github.com/repos/snaoyam/starflower.club/'));assert.equal(c.headers.Authorization,'Bearer dummy-test-only');assert.equal(c.redirect,'error');assert.equal(c.credentials,'omit');assert.ok(!JSON.stringify(c.body||{}).includes(credentials.token));}
});
test('먼저 저장된 콘텐츠가 있거나 GitHub 권한이 없으면 쓰기를 시작하지 않는다',async()=>{
  const {client,calls}=fixture({conflict:true});
  await assert.rejects(client.publish(baseline,{[sourcePath]:{text:'교체'}}),/덮어쓰지/);
  assert.ok(calls.every(c=>c.method==='GET'));
  const denied=fixture({status:401});await assert.rejects(denied.client.publish(baseline,{[sourcePath]:{text:'교체'}}),/401/);
  assert.equal(denied.calls.length,1);
  const blocked=fixture();await assert.rejects(blocked.client.publish(baseline,{'.github/workflows/deploy.yml':{text:'bad'}}),/허용된/);assert.equal(blocked.calls.length,0);
});
test('삭제는 null 트리 항목으로 기록하고 네트워크 오류에서 토큰과 서버 응답을 숨긴다',async()=>{
  const {client,calls}=fixture();const result=await client.publish(baseline,{[sourcePath]:null});
  assert.equal(result.files[sourcePath],undefined);assert.equal(calls.find(c=>c.url.endsWith('/git/trees')&&c.method==='POST').body.tree[0].sha,null);
  const fail=createGitHubClient(credentials,async()=>{throw Error(credentials.token);});
  await assert.rejects(fail.dispatch(),e=>!e.message.includes(credentials.token));
});
test('설명 속 필드 문구·문단·중복 촬영정보를 저장 형식으로 안전하게 왕복한다',()=>{
  const info={제목:'뉴스',날짜:'2026-10-24',내용:'첫 문단\n\n제목: 본문 속 제목\n날짜: 본문 속 날짜\n# 본문 메모',작가:'원래 작가'};
  assert.deepEqual(parseFields(serializeFields(info)),info);
  const photo={title:'별',description:'첫 문단\n\n- 제목: 설명의 일부',category:'사진',metadata:[['촬영자','한 명'],['촬영자','다른 사람'],['비고','여러 줄\n\n  - 메모'],['','[원문](https://example.com/)']],hasAdditionalInfo:true};
  assert.deepEqual(parsePhotoMarkdown(serializePhoto(photo)),photo);
  assert.throws(()=>validateEdits(baseline,{[sourcePath]:{text:"{\"제목\":\"제목만\"}"}}),/본문/);
  assert.throws(()=>validateEdits(baseline,{'content/설정/모집링크.json':{text:serializeFields({url:'javascript:alert(1)'})}}),/모집링크/);
});
test('관리 화면의 추가·모집 변경은 실제 공개 빌드에 반영되고 스냅샷에 비밀 파일을 넣지 않는다',async t=>{
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'starflower-admin-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));
  const write=async(p,text)=>{await fs.mkdir(path.dirname(path.join(root,p)),{recursive:true});await fs.writeFile(path.join(root,p),text);};
  const changes={
    'content/전시/new/전시정보.json':{text:serializeFields({제목:'새 전시',날짜:'2026-10-24',분류:'전시',소개:'첫 문단\n\n둘째 문단',장소:'온라인'})},
    [sourcePath]:{text:serializeFields({제목:'새 소식',내용:'소식 본문',날짜:'2026-10-24',분류:'소식'})},
    'content/설정/사이트정보.json':{text:serializeFields({모집안내:'새 모집 안내'})},
    'content/설정/모집링크.json':{text:serializeFields({url:'https://example.org/apply?term=fall#form'})},
  };
  validateEdits({},changes);for(const[p,v]of Object.entries(changes))await write(p,v.text);
  await write('content/설정/token.json','secret');await write('content/소식/_숨김/소식.json',"{\"제목\":\"비공개\"}");
  const data=await generateContent({root,quiet:true});assert.equal(data.news[0].title,'새 소식');assert.equal(data.settings.모집안내,'새 모집 안내');assert.equal(data.exhibitions[0].description,'첫 문단\n\n둘째 문단');assert.equal(data.recruitmentUrl,'https://example.org/apply?term=fall#form');
  const snapshot=JSON.parse(await fs.readFile(path.join(root,'public/data/admin.json'),'utf8'));
  assert.equal(snapshot.files[sourcePath].sha.length,40);assert.equal(Object.keys(snapshot.files).length,4);assert.ok(!JSON.stringify(snapshot).includes('secret'));
});

test('사진 확장자를 가장한 SVG·HTML은 업로드와 배포에서 거부한다',async t=>{
  assert.throws(()=>assertRasterImage(new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"></svg>')),/지원하는/);
  const bytes=await sharp({create:{width:12,height:8,channels:3,background:'blue'}}).jpeg().toBuffer();assert.doesNotThrow(()=>assertRasterImage(bytes));
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'starflower-image-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));
  await fs.mkdir(path.join(root,'content/활동사진'),{recursive:true});
  await fs.writeFile(path.join(root,'content/활동사진/renamed.jpg'),'<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10"/></svg>');
  await assert.rejects(generateContent({root,quiet:true}),/지원하는 사진/);
});

test('전시 정렬숫자는 날짜 8자리로 기본값을 만들고 숫자 크기대로 목록을 정렬한다',()=>{
  assert.equal(exhibitionSortNumber({날짜:'2026-09-30'}),20260930);
  assert.equal(exhibitionSortNumber({날짜:'2026-09-30',정렬숫자:'100'}),100);
  assert.equal(exhibitionSortNumber({정렬숫자:'0'}),0);
  for(const value of ['', '-1', '1.5', 'abc', '9007199254740992'])assert.throws(()=>exhibitionSortNumber({정렬숫자:value}),/정렬숫자/);
  const files={
    'content/전시/a/전시정보.json':{text:"{\"제목\":\"A\",\"날짜\":\"2026-09-30\"}"},
    'content/전시/b/전시정보.json':{text:"{\"제목\":\"B\",\"날짜\":\"2020-01-01\",\"정렬숫자\":\"99999999\"}"},
  };
  assert.equal(recordPaths(files,'전시')[0],'content/전시/b/전시정보.json');
});
test('수정한 뉴스의 필수 항목과 전시 정렬숫자를 저장 전에 검증한다',()=>{
  const complete={제목:'뉴스',날짜:'2026-10-24',분류:'이벤트',내용:'본문'};
  for(const [key,pattern]of [['제목',/제목/],['날짜',/날짜/],['분류',/분류/],['내용',/본문/]]) {
    assert.throws(()=>validateEdits({}, {[sourcePath]:{text:serializeFields({...complete,[key]:''})}}),pattern);
  }
  const ex='content/전시/a/전시정보.json';
  assert.throws(()=>validateEdits({}, {[ex]:{text:serializeFields({제목:'전시',분류:'전시',정렬숫자:'1.5'})}}),/정렬숫자/);
  assert.doesNotThrow(()=>validateEdits({}, {[ex]:{text:serializeFields({제목:'전시',분류:'전시',정렬숫자:'99999999'})}}));
});


test('동아리 소개 사진은 전용 커버를 우선하고 없으면 활동사진의 첫 사진을 사용한다',()=>{
  const files={'content/활동사진/10.jpg':{},'content/활동사진/02.jpg':{},'content/활동사진/02.md':{text:'설명'}};
  assert.equal(aboutImagePath(files),'content/활동사진/02.jpg');
  const edited=mergedFiles(files,{'content/소개/커버.png':{base64:'test'}});
  assert.equal(aboutImagePath(edited),'content/소개/커버.png');
  assert.equal(aboutImagePath(mergedFiles(edited,{'content/소개/커버.png':null})),'content/활동사진/02.jpg');
  assert.equal(aboutImagePath({}),'');
  for(const ext of ['jpg','jpeg','png','webp','avif'])assert.ok(isContentPath(`content/소개/커버.${ext}`));
  for(const p of ['content/소개/커버.svg','content/소개/다른파일.json','content/소개/../커버.jpg'])assert.ok(!isContentPath(p));
});

test('소개 글과 교체 사진이 공개 데이터·관리자 자료에 반영되며 원래 활동사진은 보존한다',async t=>{
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'starflower-about-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));
  const write=async(p,bytes)=>{await fs.mkdir(path.dirname(path.join(root,p)),{recursive:true});await fs.writeFile(path.join(root,p),bytes);};
  const original=await sharp({create:{width:12,height:8,channels:3,background:'blue'}}).jpeg().toBuffer();
  await write('content/활동사진/01.jpg',original);
  let data=await generateContent({root,quiet:true});
  assert.deepEqual(data.introductionImage,data.activities[0].image);
  const replacement=await sharp({create:{width:8,height:12,channels:3,background:'red'}}).png().toBuffer();
  const changes={'content/소개.json':{text:serializeFields({내용:'새 소개 첫 문단.\n\n둘째 문단.'})},'content/소개/커버.png':{base64:replacement.toString('base64')}};
  validateEdits({},changes);
  for(const [p,v] of Object.entries(changes)){assert.ok(isContentPath(p));await write(p,v.text??Buffer.from(v.base64,'base64'));}
  data=await generateContent({root,quiet:true});
  assert.equal(data.introduction,parseFields(changes['content/소개.json'].text).내용);
  assert.notEqual(data.introductionImage.src,data.activities[0].image.src);
  assert.equal(data.introductionImage.width,8);assert.equal(data.introductionImage.height,12);
  assert.deepEqual(await fs.readFile(path.join(root,'content/활동사진/01.jpg')),original);
  const catalog=JSON.parse(await fs.readFile(path.join(root,'public/data/site.json'),'utf8'));
  assert.deepEqual(catalog.introductionImage,data.introductionImage);
  const snapshot=JSON.parse(await fs.readFile(path.join(root,'public/data/admin.json'),'utf8'));
  assert.equal(snapshot.files['content/소개.json'].text,changes['content/소개.json'].text);
  assert.equal(snapshot.files['content/소개/커버.png'].sha.length,40);
  await fs.access(path.join(root,'public',snapshot.files['content/소개/커버.png'].preview));
  const priorImage=data.introductionImage.src;
  await fs.unlink(path.join(root,'content/소개/커버.png'));
  await write('content/소개/커버.jpg',await sharp(replacement).jpeg().toBuffer());
  data=await generateContent({root,quiet:true});
  assert.notEqual(data.introductionImage.src,priorImage);
  await assert.rejects(fs.access(path.join(root,'public',priorImage)));
});


test('모집 사진은 전용 커버, 기존 촬영장비 사진, 첫 활동사진 순으로 선택한다',()=>{
  const files={'content/활동사진/01.jpg':{},'content/활동사진/02-천체사진-촬영장비.jpg':{}};
  assert.equal(recruitmentImagePath(files),'content/활동사진/02-천체사진-촬영장비.jpg');
  const edited=mergedFiles(files,{'content/모집/커버.png':{base64:'test'}});
  assert.equal(recruitmentImagePath(edited),'content/모집/커버.png');
  assert.equal(recruitmentImagePath(mergedFiles(edited,{'content/모집/커버.png':null})),'content/활동사진/02-천체사진-촬영장비.jpg');
  assert.equal(recruitmentImagePath({'content/활동사진/10.jpg':{},'content/활동사진/02.jpg':{}}),'content/활동사진/02.jpg');
  assert.equal(recruitmentImagePath({}),'');
  for(const ext of ['jpg','jpeg','png','webp','avif'])assert.ok(isContentPath(`content/모집/커버.${ext}`));
  for(const p of ['content/모집/커버.svg','content/모집/다른파일.json','content/모집/../커버.jpg'])assert.ok(!isContentPath(p));
});

test('모집 사진 교체·형식 변경·제거는 공개 빌드에 반영되며 소개 사진과 활동사진을 보존한다',async t=>{
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'starflower-recruitment-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));
  const write=async(p,bytes)=>{await fs.mkdir(path.dirname(path.join(root,p)),{recursive:true});await fs.writeFile(path.join(root,p),bytes);};
  const original=await sharp({create:{width:12,height:8,channels:3,background:'blue'}}).jpeg().toBuffer();
  await write('content/활동사진/01.jpg',original);
  let data=await generateContent({root,quiet:true});
  assert.deepEqual(data.recruitmentImage,data.activities[0].image);
  const equipment=await sharp({create:{width:16,height:9,channels:3,background:'green'}}).jpeg().toBuffer();
  await write('content/활동사진/02-천체사진-촬영장비.jpg',equipment);
  data=await generateContent({root,quiet:true});
  assert.deepEqual(data.recruitmentImage,data.activities[1].image);
  const introductionImage=data.introductionImage;
  const replacement=await sharp({create:{width:8,height:12,channels:3,background:'red'}}).png().toBuffer();
  const changes={'content/모집/커버.png':{base64:replacement.toString('base64')}};
  validateEdits({},changes);
  await write('content/모집/커버.png',replacement);
  data=await generateContent({root,quiet:true});
  assert.notEqual(data.recruitmentImage.src,data.activities[1].image.src);
  assert.equal(data.recruitmentImage.width,8);assert.equal(data.recruitmentImage.height,12);
  assert.deepEqual(data.introductionImage,introductionImage);
  assert.deepEqual(await fs.readFile(path.join(root,'content/활동사진/02-천체사진-촬영장비.jpg')),equipment);
  const catalog=JSON.parse(await fs.readFile(path.join(root,'public/data/site.json'),'utf8'));
  assert.deepEqual(catalog.recruitmentImage,data.recruitmentImage);
  const snapshot=JSON.parse(await fs.readFile(path.join(root,'public/data/admin.json'),'utf8'));
  assert.equal(snapshot.files['content/모집/커버.png'].sha.length,40);
  await fs.access(path.join(root,'public',snapshot.files['content/모집/커버.png'].preview));
  const priorImage=data.recruitmentImage.src;
  await fs.unlink(path.join(root,'content/모집/커버.png'));
  await write('content/모집/커버.jpg',await sharp(replacement).jpeg().toBuffer());
  data=await generateContent({root,quiet:true});
  assert.notEqual(data.recruitmentImage.src,priorImage);
  await assert.rejects(fs.access(path.join(root,'public',priorImage)));
  await fs.unlink(path.join(root,'content/모집/커버.jpg'));
  data=await generateContent({root,quiet:true});
  assert.deepEqual(data.recruitmentImage,data.activities[1].image);
  assert.deepEqual(data.introductionImage,introductionImage);
});

test('푸터 안내를 저장·빌드·관리자 재편집할 때 줄바꿈과 빈 내용이 유지된다',async t=>{
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'starflower-footer-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));
  const footerPath='content/설정/푸터.json';
  const text='새 소속\n새 주소\n\n담당자: 별바라기\ncontact@example.test\n계좌 안내';
  const json=serializeFields({내용:text});
  const changes={[footerPath]:{text:json}};
  assert.ok(isContentPath(footerPath));
  validateEdits(baseline,changes);
  const {client,calls}=fixture();
  const saved=await client.publish(baseline,changes);
  assert.equal(saved.files[footerPath].text,json);
  assert.ok(calls.some(c=>c.url.endsWith('/git/blobs')&&c.body.content===json));
  await fs.mkdir(path.join(root,'content/설정'),{recursive:true});
  await fs.writeFile(path.join(root,footerPath),json);
  await generateContent({root,quiet:true});
  const readJSON=async name=>JSON.parse(await fs.readFile(path.join(root,'public/data',name),'utf8'));
  assert.equal((await readJSON('site.json')).footerText,text);
  assert.equal((await readJSON('admin.json')).files[footerPath].text,json);
  await fs.writeFile(path.join(root,footerPath),serializeFields({내용:''}));
  await generateContent({root,quiet:true});
  assert.equal((await readJSON('site.json')).footerText,'');
  assert.equal((await readJSON('admin.json')).files[footerPath].text,serializeFields({내용:''}));
});


test('폐기한 현재 전시 설정은 관리자 편집과 공개 데이터에 포함하지 않는다',async t=>{
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'starflower-retired-current-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));
  const retired='content/설정/현재전시.txt';
  assert.equal(isContentPath(retired),false);
  await fs.mkdir(path.join(root,'content/설정'),{recursive:true});
  await fs.writeFile(path.join(root,retired),'없는전시');
  assert.doesNotThrow(()=>validateEdits({[retired]:{text:'없는전시'}},{}));
  const data=await generateContent({root,quiet:true});
  assert.ok(!Object.hasOwn(data,'currentExhibition'));
  const catalog=JSON.parse(await fs.readFile(path.join(root,'public/data/site.json'),'utf8'));
  assert.ok(!Object.hasOwn(catalog,'currentExhibition'));
  const snapshot=JSON.parse(await fs.readFile(path.join(root,'public/data/admin.json'),'utf8'));
  assert.ok(!Object.hasOwn(snapshot.files,retired));
});

test('관리자 배포 요청은 사용자 지정 키를 포함한 JSON 파일을 그대로 전송하고 다시 편집할 수 있다',async()=>{
  const custom={...parseFields(baseline[sourcePath].text),임의키:{활성:true,순서:[1,2]},내용:'새 본문\n\n여러 문단'};
  const text=serializeFields(custom);
  const {client,calls}=fixture();
  const saved=await client.publish(baseline,{[sourcePath]:{text}});
  assert.ok(calls.some(c=>c.url.endsWith('/git/blobs')&&c.body.content===text));
  const treeCall=calls.find(c=>c.url.endsWith('/git/trees')&&c.method==='POST');
  assert.equal(treeCall.body.tree[0].path,sourcePath);
  assert.ok(sourcePath.endsWith('.json'));
  assert.deepEqual(parseFields(saved.files[sourcePath].text),custom);
});
