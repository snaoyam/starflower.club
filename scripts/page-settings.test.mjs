import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { homeSettings, footerLinks, linkURL } from '../src/page-settings.mjs';
import { validateEdits, updateContentField } from '../src/admin-model.mjs';
import { isContentPath } from '../src/admin-github.mjs';
import { createUploadName, coverImagePaths } from '../src/upload-files.mjs';
import { generateContent } from './build-content.mjs';

test('홈 편집과 두 배경 교체, 푸터 링크 변경이 공개 빌드와 재편집 자료에 반영된다', async t => {
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'starflower-pages-'));
  t.after(()=>fs.rm(root,{recursive:true,force:true}));
  const homePath='content/설정/홈.json', footerPath='content/설정/푸터.json';
  const files={
    [homePath]:{text:JSON.stringify({대표문구:'기존',추가값:{보존:true}})},
    [footerPath]:{text:JSON.stringify({내용:'주소\n연락처',추가값:42})},
    'content/설정/사이트정보.json':{text:JSON.stringify({인스타그램:'https://instagram.com/test',유튜브:'https://youtube.com/test'})},
  };
  const changes={};
  changes[homePath]={text:updateContentField(files[homePath].text,'대표문구','새 첫 문장\n두 번째 줄')};
  for(const [key,value] of Object.entries({활동표제:'활동',활동제목:'새 활동 제목',활동설명:'활동 설명\n다음 줄',활동링크:'https://example.com/activity',활동링크이름:'활동 보기',활동링크아이콘:'youtube',모집표제:'지원',모집제목:'새 모집 제목',모집설명:'새 모집 설명',모집버튼:'지원 안내'})) changes[homePath].text=updateContentField(changes[homePath].text,key,value);
  const links=[{이름:'문의',주소:'mailto:test@example.com',아이콘:'email',추가값:'보존'},{이름:'홈페이지',주소:'https://example.com',아이콘:'none'}];
  changes[footerPath]={text:updateContentField(files[footerPath].text,'링크',links)};
  for(const [folder,color] of [['대표','blue'],['활동','red']]) {
    const name=await createUploadName('동일사진.png',{cover:true,selectedAt:Date.now(),existingNames:new Set()});
    const p=`content/홈/${folder}/${name}`;
    assert.ok(isContentPath(p));
    changes[p]={base64:(await sharp({create:{width:12,height:8,channels:3,background:color}}).png().toBuffer()).toString('base64')};
  }
  let all=validateEdits(files,changes);
  async function writeAll(records) {
    for(const [p,value] of Object.entries(records)) {
      assert.ok(isContentPath(p),p);
      await fs.mkdir(path.dirname(path.join(root,p)),{recursive:true});
      await fs.writeFile(path.join(root,p),value.text??Buffer.from(value.base64,'base64'));
    }
  }
  await writeAll(all);
  let data=await generateContent({root,quiet:true});
  let catalog=JSON.parse(await fs.readFile(path.join(root,'public/data/site.json'),'utf8'));
  assert.equal(catalog.home.copy.대표문구,'새 첫 문장\n두 번째 줄');
  assert.equal(catalog.home.copy.모집제목,'새 모집 제목');
  assert.equal(catalog.home.copy.활동링크,'https://example.com/activity');
  assert.equal(catalog.home.copy.활동링크아이콘,'youtube');
  assert.notEqual(catalog.home.hero.image.src,catalog.home.activity.image.src);
  assert.deepEqual(catalog.footerLinks,links.map(item=>({...item,주소:linkURL(item.주소)})));
  const snapshot=JSON.parse(await fs.readFile(path.join(root,'public/data/admin.json'),'utf8'));
  assert.deepEqual(JSON.parse(snapshot.files[homePath].text).추가값,{보존:true});
  assert.equal(JSON.parse(snapshot.files[footerPath].text).추가값,42);
  for(const folder of ['대표','활동']) {
    const p=coverImagePaths(all,`content/홈/${folder}/`)[0];
    assert.ok(snapshot.files[p]);await fs.access(path.join(root,'public',snapshot.files[p].preview));
  }
  const prior=data.home.hero.image.src;
  const oldPath=coverImagePaths(all,'content/홈/대표/')[0];
  const replacement='content/홈/대표/커버.jpg';
  const next={[footerPath]:{text:updateContentField(snapshot.files[footerPath].text,'링크',[])},[oldPath]:null,[replacement]:{base64:(await sharp({create:{width:9,height:9,channels:3,background:'green'}}).jpeg().toBuffer()).toString('base64')}};
  all=validateEdits(all,next);
  await fs.unlink(path.join(root,oldPath));await writeAll(all);
  data=await generateContent({root,quiet:true});
  assert.deepEqual(data.footerLinks,[]);assert.notEqual(data.home.hero.image.src,prior);
  assert.equal(data.home.hero.image.width,9);
  await assert.rejects(fs.access(path.join(root,'public',prior)));
});

test('기존 설정을 유지하면서 빈 링크 배열과 빈 홈 문구는 삭제 의도를 보존한다',()=>{
  const settings={인스타그램:'https://instagram.com/test'};
  assert.equal(footerLinks({},settings).length,1);
  assert.deepEqual(footerLinks({링크:[]},settings),[]);
  assert.equal(homeSettings({대표문구:''},settings).대표문구,'');
  assert.equal(homeSettings({},settings).활동링크,settings.인스타그램);
  assert.equal(homeSettings({},settings).활동링크아이콘,'instagram');
  assert.equal(homeSettings({활동링크아이콘:'none'},settings).활동링크아이콘,'none');
  assert.doesNotThrow(()=>validateEdits({}, {'content/설정/홈.json':{text:'{"활동링크아이콘":"none"}'}}));
});

test('관리자 저장에서 잘못된 링크·아이콘·홈 값과 허용 범위 밖 사진 경로를 거부한다',()=>{
  for(const 주소 of ['javascript:alert(1)','data:text/html,test','https://user:pass@example.com','https://example.com/\nfoo']) assert.throws(()=>validateEdits({}, {'content/설정/푸터.json':{text:JSON.stringify({링크:[{이름:'링크',주소,아이콘:'link'}]})}}));
  for(const 링크 of [null,[{이름:'',주소:'https://example.com',아이콘:'link'}],[{이름:'링크',주소:'https://example.com',아이콘:'unknown'}]]) assert.throws(()=>validateEdits({}, {'content/설정/푸터.json':{text:JSON.stringify({링크})}}));
  assert.throws(()=>validateEdits({}, {'content/설정/홈.json':{text:'{"대표문구":42}'}}));
  assert.throws(()=>validateEdits({}, {'content/설정/홈.json':{text:'{"활동링크":"mailto:test@example.com"}'}}));
  assert.throws(()=>validateEdits({}, {'content/설정/홈.json':{text:'{"활동링크아이콘":"unknown"}'}}));
  for(const p of ['content/홈/대표/커버.svg','content/홈/활동/../커버.jpg','content/홈/임의/커버.png','content/설정/홈.txt']) assert.equal(isContentPath(p),false,p);
});
