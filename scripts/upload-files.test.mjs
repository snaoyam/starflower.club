import {serializeFields} from '../src/content-format.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash, webcrypto } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import sharp from 'sharp';
import { createUploadName, isCoverFilename, coverImagePaths } from '../src/upload-files.mjs';
import { aboutImagePath, recruitmentImagePath, mergedFiles, serializePhoto } from '../src/admin-model.mjs';
import { isContentPath } from '../src/admin-github.mjs';
import { generateContent } from './build-content.mjs';

const selectedAt = 1792800000123;
const fixedCrypto = { subtle: webcrypto.subtle, randomUUID: () => 'fixed-test-nonce' };

test('파일 선택 시각을 SHA-256에 포함하고 원래 사진 이름과 확장자를 보존한다', async () => {
  const filename = '밤하늘.JPG';
  const hash = createHash('sha256').update(JSON.stringify([selectedAt, 'fixed-test-nonce', filename])).digest('hex');
  const name = await createUploadName(filename, { selectedAt, order: 3, cryptoProvider: fixedCrypto });
  assert.equal(name, `003-밤하늘-${hash}.jpg`);
  assert.notEqual(name, await createUploadName(filename, { selectedAt: selectedAt + 1, order: 3, cryptoProvider: fixedCrypto }));
  const unusual = await createUploadName('../별 : 사진?'.repeat(40) + '.PNG', { selectedAt });
  assert.ok(!/[\\/:?]/.test(unusual));
  assert.ok(Buffer.byteLength(unusual) <= 255);
  await assert.rejects(createUploadName('별.svg'), /형식/);
});

test('동일한 파일명·선택 시각으로 여러 위치와 배치에서 업로드해도 각각 다른 해시를 만든다', async () => {
  const names = await Promise.all(Array.from({ length: 100 }, () => createUploadName('별.jpg', { selectedAt })));
  assert.equal(new Set(names).size, 100);
  const covers = await Promise.all(Array.from({ length: 100 }, () => createUploadName('별.jpg', { selectedAt, cover: true })));
  assert.equal(new Set(covers).size, 100);
  assert.ok(covers.every(isCoverFilename));
});

test('기존 파일·같은 배치의 파일과 충돌하면 다시 생성하며 끝내 충돌할 경우 덮어쓰지 않는다', async () => {
  const existingNames = new Set();
  const first = await createUploadName('별.jpg', { selectedAt, existingNames, cryptoProvider: fixedCrypto });
  assert.ok(existingNames.has(first));
  let calls = 0;
  const retryCrypto = { subtle: webcrypto.subtle, randomUUID: () => ++calls === 1 ? 'fixed-test-nonce' : 'new-test-nonce' };
  const second = await createUploadName('별.jpg', { selectedAt, existingNames, cryptoProvider: retryCrypto });
  assert.notEqual(first, second);
  assert.equal(calls, 2);
  await assert.rejects(createUploadName('별.jpg', { selectedAt, existingNames, cryptoProvider: fixedCrypto }), /고유 이름/);
  assert.equal(existingNames.size, 2);
});

test('새 커버와 기존 커버를 함께 교체하되 다른 위치의 사진은 삭제하지 않는다', async () => {
  const name = await createUploadName('별.PNG', { selectedAt, cover: true });
  const prefix = 'content/소개/';
  const files = { [prefix+'커버.jpg']: {}, [prefix+name]: {}, ['content/모집/'+name]: {}, [prefix+'하위/'+name]: {} };
  assert.deepEqual(new Set(coverImagePaths(files, prefix)), new Set([prefix+'커버.jpg', prefix+name]));
  const changes = Object.fromEntries(coverImagePaths(files, prefix).map(p => [p, null]));
  const replacement = await createUploadName('별.PNG', { selectedAt, cover: true });
  changes[prefix+replacement] = {};
  const merged = mergedFiles(files, changes);
  assert.equal(aboutImagePath(merged), prefix+replacement);
  assert.equal(recruitmentImagePath(merged), 'content/모집/'+name);
  for (const folder of ['소개', '모집', '전시/test', '소식/test']) {
    assert.ok(isContentPath(`content/${folder}/${name}`));
    assert.ok(isContentPath(`content/${folder}/커버.jpg`));
    assert.ok(!isContentPath(`content/${folder}/커버-${'g'.repeat(64)}.png`));
    assert.ok(!isContentPath(`content/${folder}/커버-${'a'.repeat(64)}.svg`));
  }
});

test('고유 파일명 커버·작품·첨부사진이 공개 빌드와 관리자 자료에 반영되고 원래 제목을 유지한다', async t => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'starflower-upload-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const write = async (p, bytes) => { await fs.mkdir(path.dirname(path.join(root,p)), { recursive: true }); await fs.writeFile(path.join(root,p), bytes); };
  await write('content/전시/test/전시정보.md', "- 제목: 테스트 전시\n- 정렬숫자: \"1\"\n");
  await write('content/소식/test/소식.md', "- 제목: 테스트 소식\n- 내용: 본문\n- 날짜: 2026-10-24\n");
  const images = [];
  for (const [i,folder] of ['소개', '모집', '전시/test', '소식/test'].entries()) {
    const name = await createUploadName('같은 사진.PNG', { selectedAt, cover: true });
    const p = `content/${folder}/${name}`;
    await write(p, await sharp({ create: { width: 12+i, height: 8, channels: 3, background: 'blue' } }).png().toBuffer());
    images.push(p);
  }
  const photoBytes = await sharp({ create: { width: 20, height: 10, channels: 3, background: 'red' } }).png().toBuffer();
  for (const folder of ['전시/test/작품', '소식/test/사진']) {
    for (let order=1; order<=2; order++) {
      const name = await createUploadName('같은 사진.PNG', { selectedAt, order });
      const p = `content/${folder}/${name}`;
      await write(p, photoBytes);
      await write(p.replace(/\.png$/, '.md'), serializePhoto({ title: '같은 사진', description: '원래 설명', metadata: [], hasAdditionalInfo: false }));
      images.push(p);
    }
  }
  const data = await generateContent({ root, quiet: true });
  assert.equal(data.introductionImage.width, 12);
  assert.equal(data.recruitmentImage.width, 13);
  assert.equal(data.exhibitions[0].cover.width, 14);
  assert.equal(data.news[0].cover.width, 15);
  for (const photos of [data.exhibitions[0].artworks, data.news[0].photos]) {
    assert.equal(photos.length, 2);
    assert.notEqual(photos[0].id, photos[1].id);
    assert.ok(photos.every(p => p.title === '같은 사진' && p.description === '원래 설명'));
  }
  const snapshot = JSON.parse(await fs.readFile(path.join(root, 'public/data/admin.json'), 'utf8'));
  for (const p of images) {
    assert.equal(snapshot.files[p].sha.length, 40);
    await fs.access(path.join(root, 'public', snapshot.files[p].preview));
  }
});
