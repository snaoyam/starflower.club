import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { parsePhotoMarkdown } from './photo-markdown.mjs';
import { markdownLinks } from '../src/markdown-links.mjs';
import { generateContent, parseFields, parseFAQ, validateRecruitmentURL } from './build-content.mjs';

async function fixture(t) {
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'starflower-test-'));
 t.after(()=>fs.rm(root,{recursive:true,force:true}));
 const write=async(file,text)=>{const p=path.join(root,'content',file);await fs.mkdir(path.dirname(p),{recursive:true});await fs.writeFile(p,text);};
 const photo=async(file,color='blue')=>{const p=path.join(root,'content',file);await fs.mkdir(path.dirname(p),{recursive:true});await sharp({create:{width:12,height:8,channels:3,background:color}}).jpeg().toFile(p);};
 return {root,write,photo};
}
test('텍스트 설명의 여러 문단, 윈도 줄바꿈과 UTF-8 BOM을 보존한다',()=>{
 assert.deepEqual(parseFields("{\"제목\":\"오리온\",\"설명\":\"첫 문단\\n\\n둘째 문단\",\"작가\":\"별바라기\"}"),{제목:'오리온',설명:'첫 문단\n\n둘째 문단',작가:'별바라기'});
 assert.equal(parseFAQ("{\"항목\":[{\"질문\":\"가입?\",\"답변\":\"가능해요.\"},{\"질문\":\"장비?\",\"답변\":\"함께 써요.\"}]}").length,2);
});
test('모집 주소는 모든 HTTP·HTTPS 웹주소를 허용하고 잘못된 주소는 거부한다',()=>{
 assert.equal(validateRecruitmentURL(''), '');
 assert.equal(validateRecruitmentURL('https://forms.gle/testForm'), 'https://forms.gle/testForm');
 assert.equal(validateRecruitmentURL('https://docs.google.com/forms/d/e/example/viewform'),'https://docs.google.com/forms/d/e/example/viewform');
 for(const url of ['http://example.org/apply','https://example.org/apply?term=fall#form','https://forms.gle.evil.test/form'])assert.equal(validateRecruitmentURL(url),url);
 assert.equal(validateRecruitmentURL('https://example.com'),'https://example.com/');
 for(const url of ['javascript:alert(1)','data:text/html,test','file:///tmp/form','ftp://example.com/form','example.com/apply','https://','https://user:pass@example.com','https://forms.gle/one\nhttps://forms.gle/two'])assert.throws(()=>validateRecruitmentURL(url));
});
test('전시·작품·활동사진·소식을 파일만 추가/삭제해서 반영하고 사용하지 않는 이미지를 정리한다',async t=>{
 const {root,write,photo}=await fixture(t);
 await write('전시/새로운-전시/전시정보.json',"{\"제목\":\"새로운 전시\",\"날짜\":\"2026-10-22\",\"소개\":\"밤하늘의 기록\"}");
 await write('설정/모집링크.json',JSON.stringify({url:'https://forms.gle/example'}));
 await photo('전시/새로운-전시/작품/01-별 사진.jpg');
 await write('전시/새로운-전시/작품/01-별 사진.md','- 제목: 별 사진\n- 설명: 첫 사진\n\n- 추가정보\n  - 촬영자: 관측자');
 await photo('활동사진/모임.jpg','red');
 await write('소식/첫소식/소식.json',"{\"제목\":\"첫 관측회\",\"날짜\":\"2026-10-22\",\"분류\":\"이벤트\",\"내용\":\"함께 관측해요.\"}");
 let data=await generateContent({root,quiet:true});
 assert.equal(data.exhibitions[0].artworks[0].description,'첫 사진');assert.equal(data.activities.length,1);assert.equal(data.news.length,1);
 assert.equal((await fs.readdir(path.join(root,'public/media'))).length,4);
 for(const item of [data.exhibitions[0].artworks[0],data.activities[0]]) {await fs.access(path.join(root,'public',item.image.src));await fs.access(path.join(root,'public',item.image.thumb));}
 await fs.unlink(path.join(root,'content/전시/새로운-전시/작품/01-별 사진.jpg'));
 await fs.unlink(path.join(root,'content/활동사진/모임.jpg'));
 await fs.rm(path.join(root,'content/소식/첫소식'),{recursive:true});
 data=await generateContent({root,quiet:true});
 assert.equal(data.exhibitions[0].artworks.length,0);assert.equal(data.activities.length,0);assert.equal(data.news.length,0);assert.deepEqual(await fs.readdir(path.join(root,'public/media')),[]);
 await fs.rm(path.join(root,'content/전시/새로운-전시'),{recursive:true});
 data=await generateContent({root,quiet:true});assert.equal(data.exhibitions.length,0);
});
test('잘못된 날짜는 배포 전에 한국어 오류를 낸다',async t=>{
 const {root,write}=await fixture(t);
 await write('전시/test/전시정보.json',"{\"제목\":\"테스트\",\"날짜\":\"2026-02-31\"}");
 await assert.rejects(generateContent({root,quiet:true}),/YYYY-MM-DD/);
});
test('사진 설명 없이도 파일 이름으로 표시하고 숨긴 폴더는 공개하지 않는다',async t=>{
 const {root,write,photo}=await fixture(t);
 await write('전시/_준비중/전시정보.json',"{\"제목\":\"아직 미공개\"}");
 await photo('활동사진/01-함께 본 별.jpg');
 const data=await generateContent({root,quiet:true});
 assert.equal(data.activities[0].title,'함께 본 별');assert.equal(data.exhibitions.length,0);
});
test('소식의 여러 사진과 링크를 반영하고 첫 사진 삭제 시 커버를 교체한다',async t=>{
 const {root,write,photo}=await fixture(t);
 await write('소식/관측/소식.json',"{\"제목\":\"관측회\",\"날짜\":\"2026-10-22\",\"내용\":\"관측 기록\",\"링크\":\"https://www.instagram.com/p/example/\"}");
 await photo('소식/관측/사진/01.jpg','purple');await photo('소식/관측/사진/02.jpg','yellow');
 await write('소식/관측/사진/01.md','- 제목: 첫 사진\n- 설명: 이 사진의 개별 설명\n\n- 추가정보\n  - 링크: [원문](https://www.instagram.com/p/example/)');
 let data=await generateContent({root,quiet:true});
 assert.equal(data.news[0].photos.length,2);assert.equal(data.news[0].source,'https://www.instagram.com/p/example/');
 assert.deepEqual(data.news[0].cover,data.news[0].photos[0].image);
 assert.equal(data.news[0].photos[0].description,'이 사진의 개별 설명');assert.equal(data.news[0].photos[1].description,'관측 기록');assert.deepEqual(data.news[0].photos[1].metadata,[['링크','[https://www.instagram.com/p/example/](https://www.instagram.com/p/example/)']]);
 const first=data.news[0].cover.src, second=data.news[0].photos[1].image.src;
 await fs.unlink(path.join(root,'content/소식/관측/사진/01.jpg'));
 data=await generateContent({root,quiet:true});assert.equal(data.news[0].photos.length,1);assert.equal(data.news[0].cover.src,second);
 await assert.rejects(fs.access(path.join(root,'public',first)));
 await write('소식/관측/소식.json',"{\"제목\":\"관측회\",\"내용\":\"관측 기록\",\"링크\":\"javascript:alert(1)\"}");
 await assert.rejects(generateContent({root,quiet:true}),/링크는 https/);
});
test('창립연도와 천체사진 분류, 활동 카드 분류를 파일에서 읽는다',async t=>{
 const {root,write,photo}=await fixture(t);
 await write('설정/사이트정보.json',"{\"창립연도\":\"1987\",\"동아리방\":\"태울관 3101호\",\"유튜브\":\"https://www.youtube.com/@starflower\",\"활동배경\":\"monthly/01-별 사진\"}");
 await write('전시/monthly/전시정보.json',"{\"제목\":\"월간 사진\",\"분류\":\"천체사진\"}");
 await photo('활동사진/카드.jpg');await write('활동사진/카드.md','- 분류: 활동 소개 카드');
 const data=await generateContent({root,quiet:true});assert.equal(data.settings.창립연도,'1987');assert.equal(data.exhibitions[0].category,'천체사진');assert.equal(data.activities[0].category,'활동 소개 카드');assert.equal(data.settings.유튜브,'https://www.youtube.com/@starflower');assert.equal(data.settings.활동배경,'monthly/01-별 사진');
 await write('설정/사이트정보.json',"{\"창립연도\":\"1987년\"}");await assert.rejects(generateContent({root,quiet:true}),/네 자리 숫자/);
});
test('들여쓴 촬영정보의 날짜가 작품 날짜나 소식 게시일을 덮어쓰지 않는다',()=>{
 const parsed=parseFields("{\"제목\":\"별\",\"날짜\":\"2026-10-22\",\"내용\":\"사진 소개\\n날짜: 6/2\\n장소: 학교\\n#별바라기 #천체사진\",\"링크\":\"https://example.com/\"}");
 assert.equal(parsed.날짜,'2026-10-22');assert.equal(parsed.내용,'사진 소개\n날짜: 6/2\n장소: 학교\n#별바라기 #천체사진');
});
test('천체 설명의 이모지만 지우고 수치·문장·촬영정보를 유지한다',async()=>{
 const {stripEmoji,photoMetadata}=await import('./build-content.mjs');
 assert.equal(stripEmoji('🔭 M31\n거리는 250만 광년. α·β, f/1.8, ISO 3200을 기록합니다. 🌌\n#별바라기'), 'M31\n거리는 250만 광년. α·β, f/1.8, ISO 3200을 기록합니다.\n#별바라기');
 assert.deepEqual(photoMetadata({'날짜':'2026-10-22','작가':'관측자','촬영일시':'7월 13일','카메라':'EOS R10','노출':'ISO 100 / 1/100s'}),[['촬영자','관측자'],['촬영일시','7월 13일'],['카메라','EOS R10'],['노출','ISO 100 / 1/100s']]);
 assert.deepEqual(photoMetadata({'날짜':'2026-10-22'},{dateFallback:false}),[]);
});
test('월별 소식의 사진정보를 글과 확대 화면에 전달하고 사진별 정보는 우선한다',async t=>{
 const {root,write,photo}=await fixture(t);
 await write('소식/月/소식.json',"{\"제목\":\"천체사진\",\"날짜\":\"2026-10-22\",\"내용\":\"📍M31의 이야기\",\"작가\":\"촬영자\",\"촬영일시\":\"2025-11-13\",\"촬영장소\":\"태울관\",\"망원경\":\"Askar 103 APO\",\"가대\":\"EQ6\"}");
 await photo('소식/月/사진/01.jpg');await photo('소식/月/사진/02.jpg','red');
 await write('소식/月/사진/02.md','- 설명: 다른 사진\n\n- 추가정보\n  - 촬영일시: 2025-11-14\n  - 카메라: 개인 카메라');
 const data=await generateContent({root,quiet:true}),n=data.news[0];
 assert.equal(n.body,'M31의 이야기');assert.equal(n.photos[0].description,n.body);assert.deepEqual(n.photos[0].metadata,n.metadata);
 assert.deepEqual(n.photos[1].metadata,[['촬영일시','2025-11-14'],['카메라','개인 카메라']]);
 assert.ok(!n.metadata.some(([,v])=>v==='2026-10-22'));
});

test('Markdown 제목·문단·임의 항목·중복 키·빈 값을 작성 순서대로 보존한다',()=>{
 const text='\uFEFF- 제목: 1월: 안드로메다 은하 M31\r\n- 설명: 첫 문단\r\n\r\n  둘째 문단: 우주 이야기\r\n\r\n- 추가정보\r\n  - 사용자 지정 정보: 자유롭게\r\n  - 촬영자: 전준하\r\n  - 링크: [원문](https://example.com/)\r\n  - 촬영자: 다른 촬영자\r\n  - <아무 텍스트>: <아무 글>\r\n  - 빈 값:\r\n  - 항목명 없이도 표시\r\n  - 여러 줄: 첫 줄\r\n    다음 줄\r\n\r\n    다음 문단\r\n';
 assert.deepEqual(parsePhotoMarkdown(text),{title:'1월: 안드로메다 은하 M31',description:'첫 문단\n\n둘째 문단: 우주 이야기',category:'',hasAdditionalInfo:true,metadata:[['사용자 지정 정보','자유롭게'],['촬영자','전준하'],['링크','[원문](https://example.com/)'],['촬영자','다른 촬영자'],['<아무 텍스트>','<아무 글>'],['빈 값',''],['','항목명 없이도 표시'],['여러 줄','첫 줄\n다음 줄\n\n다음 문단']]});
});
test('추가정보 링크는 항목 이름에 관계없이 웹 링크만 연결하고 HTML은 텍스트로 둔다',()=>{
 assert.deepEqual(markdownLinks('첫 [A](https://example.com/a_(b)) 그리고 [B](http://example.org/)'),[{text:'첫 '},{text:'A',href:'https://example.com/a_(b)'},{text:' 그리고 '},{text:'B',href:'http://example.org/'}]);
 for(const href of ['javascript:alert(1)','data:text/html,test','https://user:pass@example.com/'])assert.ok(markdownLinks(`[링크](${href})`).every(p=>!p.href));
 assert.deepEqual(markdownLinks('<img src=x onerror=alert(1)>'),[{text:'<img src=x onerror=alert(1)>'}]);
});
test('사진 md 수정은 반영되고 작가·날짜·링크는 별도 필드로 생성하지 않는다',async t=>{
 const {root,write,photo}=await fixture(t);
 await photo('활동사진/01.jpg');
 await write('활동사진/01.txt',"{\"제목\":\"사용하지 않는 옛 파일\"}");
 await write('활동사진/01.md','- 제목: 1월: M31\n- 설명: 🌌 우주의 이야기\n- 추가정보\n  - 임의항목: 3:30\n  - 촬영자: 관측자\n  - 촬영일시: 겨울 어느 날\n  - 참고자료: [원문](https://example.com/)');
 let p=(await generateContent({root,quiet:true})).activities[0];
 assert.equal(p.title,'1월: M31');assert.equal(p.description,'우주의 이야기');
 assert.deepEqual(p.metadata,[['임의항목','3:30'],['촬영자','관측자'],['촬영일시','겨울 어느 날'],['참고자료','[원문](https://example.com/)']]);
 for(const field of ['author','date','source'])assert.ok(!(field in p));
 await write('활동사진/01.md','- 제목: 바꾼 제목\n- 추가정보\n  - 마지막: 이제 첫 번째');
 p=(await generateContent({root,quiet:true})).activities[0];assert.equal(p.title,'바꾼 제목');assert.deepEqual(p.metadata,[['마지막','이제 첫 번째']]);
});
test('소식 사진의 추가정보 생략은 상속하고 빈 블록은 상속 없이 숨긴다',async t=>{
 const {root,write,photo}=await fixture(t);
 await write('소식/test/소식.json',"{\"제목\":\"소식\",\"내용\":\"이야기\",\"작가\":\"관측자\",\"링크\":\"https://example.com/\"}");
 await photo('소식/test/사진/01.jpg');await photo('소식/test/사진/02.jpg');
 await write('소식/test/사진/01.md','- 제목: 상속');
 await write('소식/test/사진/02.md','- 제목: 빈 추가정보\n- 추가정보');
 const n=(await generateContent({root,quiet:true})).news[0];
 assert.deepEqual(n.photos[0].metadata,n.metadata);assert.deepEqual(n.photos[1].metadata,[]);
});

test('전시의 정렬숫자는 게시 날짜를 보존하면서 공개 전시 순서를 바꾼다',async t=>{
 const {root,write}=await fixture(t);
 await write('전시/old/전시정보.json',"{\"제목\":\"옛 전시\",\"날짜\":\"2020-01-01\",\"정렬숫자\":\"99999999\"}");
 await write('전시/new/전시정보.json',"{\"제목\":\"새 전시\",\"날짜\":\"2026-09-30\"}");
 let data=await generateContent({root,quiet:true});
 assert.deepEqual(data.exhibitions.map(e=>e.id),['old','new']);
 assert.equal(data.exhibitions[0].date,'2020-01-01');
 assert.equal(data.exhibitions[1].sortNumber,20260930);
 await write('전시/old/전시정보.json',"{\"제목\":\"옛 전시\",\"날짜\":\"2020-01-01\",\"정렬숫자\":\"1\"}");
 data=await generateContent({root,quiet:true});assert.deepEqual(data.exhibitions.map(e=>e.id),['new','old']);
 await write('전시/old/전시정보.json',"{\"제목\":\"옛 전시\",\"정렬숫자\":\"-1\"}");
 await assert.rejects(generateContent({root,quiet:true}),/정렬숫자/);
});

test('공개 목록에서 본문·작품 정보를 분리하고 상세·관리자 자료에는 전체 내용을 보존한다',async t=>{
 const {root,write,photo}=await fixture(t);
 await write('전시/별/전시정보.json',"{\"제목\":\"별 전시\",\"날짜\":\"2026-09-30\",\"소개\":\"전시 설명\",\"장소\":\"로비\"}");
 await photo('전시/별/작품/01.jpg');
 await write('전시/별/작품/01.md','- 제목: 대표 사진\n- 설명: 작품 이야기\n- 추가정보\n  - 촬영자: 관측자');
 await write('소식/새 소식/소식.json',"{\"제목\":\"소식 제목\",\"날짜\":\"2026-10-22\",\"내용\":\"뉴스 본문\",\"작가\":\"관측자\"}");
 await photo('소식/새 소식/사진/01.jpg');
 await photo('활동사진/활동.jpg');
 const data=await generateContent({root,quiet:true});
 const read=async file=>JSON.parse(await fs.readFile(path.join(root,'public',file),'utf8'));
 const catalog=await read('data/site.json');
 assert.equal(catalog.version,2);
 assert.equal(catalog.exhibitions[0].title,data.exhibitions[0].title);
 for(const field of ['description','source','location','artworks'])assert.ok(!(field in catalog.exhibitions[0]));
 for(const field of ['body','metadata','source','cover','photos'])assert.ok(!(field in catalog.news[0]));
 assert.deepEqual(await read(catalog.exhibitions[0].detailPath),data.exhibitions[0]);
 assert.deepEqual(await read(catalog.news[0].detailPath),data.news[0]);
 assert.deepEqual(catalog.home.hero,{title:'대표 사진',image:data.exhibitions[0].artworks[0].image});
 assert.deepEqual(catalog.home.activity,catalog.home.hero);
 assert.deepEqual(catalog.activities[0],{id:data.activities[0].id,title:data.activities[0].title,image:data.activities[0].image});
 const admin=await read('data/admin.json');
 assert.match(admin.files['content/소식/새 소식/소식.json'].text,/뉴스 본문/);
 await generateContent({root,quiet:true});
 assert.deepEqual(await read('data/site.json'),catalog);
 await write('소식/새 소식/소식.json',"{\"제목\":\"소식 제목\",\"날짜\":\"2026-10-22\",\"내용\":\"수정한 본문\"}");
 await generateContent({root,quiet:true});
 const changed=await read('data/site.json');
 assert.equal(changed.exhibitions[0].detailPath,catalog.exhibitions[0].detailPath);
 assert.notEqual(changed.news[0].detailPath,catalog.news[0].detailPath);
 assert.equal((await read(changed.news[0].detailPath)).body,'수정한 본문');
 await assert.rejects(read(catalog.news[0].detailPath));
 await fs.rm(path.join(root,'content/소식'),{recursive:true});
 await generateContent({root,quiet:true});
 assert.deepEqual((await read('data/site.json')).news,[]);
 assert.deepEqual(await fs.readdir(path.join(root,'public/data/details/news')),[]);
});

test('홈 대표 사진과 지정한 활동 배경을 상세 파일 없이 표시하고 빈 전시도 처리한다',async t=>{
 const {root,write,photo}=await fixture(t);
 await write('전시/사진/전시정보.json',"{\"제목\":\"사진 전시\",\"날짜\":\"2026-09-30\"}");
 for(let i=1;i<=7;i++){
  await photo(`전시/사진/작품/0${i}.jpg`);
  await write(`전시/사진/작품/0${i}.md`,`- 제목: 사진 ${i}`);
 }
 await write('전시/빈전시/전시정보.json',"{\"제목\":\"빈 전시\",\"날짜\":\"2026-10-22\"}");
 await write('설정/사이트정보.json',"{\"활동배경\":\"사진/02\"}");
 await generateContent({root,quiet:true});
 const read=async()=>JSON.parse(await fs.readFile(path.join(root,'public/data/site.json'),'utf8'));
 let catalog=await read();
 assert.equal(catalog.home.hero.title,'사진 7');assert.equal(catalog.home.activity.title,'사진 2');
 await fs.rm(path.join(root,'content/전시/사진'),{recursive:true});
 await generateContent({root,quiet:true});catalog=await read();
 assert.equal(catalog.home.hero,null);assert.equal(catalog.home.activity,null);
 assert.equal(typeof catalog.home.copy.대표문구,'string');
});
