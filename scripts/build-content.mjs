import { homeSettings, footerLinks, linkURL } from '../src/page-settings.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { parsePhotoMarkdown } from './photo-markdown.mjs';
import { validateContentRecord, validateRecruitmentURL, exhibitionSortNumber } from '../src/content-format.mjs';
import { generateAdminSnapshot } from './admin-snapshot.mjs';
import { isCoverFilename } from '../src/upload-files.mjs';
export { parseFields, validateRecruitmentURL } from '../src/content-format.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);


export function stripEmoji(text = '') {
  return text.replace(/[\p{Extended_Pictographic}\p{Regional_Indicator}\p{Emoji_Modifier}\uFE0E\uFE0F\u200D\u20E3]/gu, '').replace(/[ \t]+$/gm, '').trim();
}
export function photoMetadata(info, { dateFallback = true } = {}) {
  return [
    ['천체', info.천체], ['촬영자', info.작가], ['촬영일시', info.촬영일시 || (dateFallback ? info.날짜 : '')],
    ['촬영장소', info.촬영장소], ['망원경', info.망원경], ['카메라', info.카메라], ['렌즈', info.렌즈],
    ['보정렌즈', info.보정렌즈], ['가대', info.가대], ['삼각대', info.삼각대], ['가이드장비', info.가이드장비],
    ['필터', info.필터], ['촬영장비', info.촬영장비], ['노출', info.노출], ['보정프로그램', info.보정프로그램],
    ['비고', info.비고], ['추가정보', info.촬영정보]
  ].map(([label, value]) => [label, stripEmoji(typeof value === 'string' ? value : value == null ? '' : JSON.stringify(value))]).filter(([,value]) => value);
}


export function parseFAQ(text = '') {
  const info = validateContentRecord('FAQ.md', text);
  return (info.항목 || []).map(item => ({question: item.질문, answer: item.답변}));
}
function date(value, label) {
  if (!value) return '';
  const d = new Date(value + 'T00:00:00Z');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(d.valueOf()) || d.toISOString().slice(0, 10) !== value) throw new Error(`${label}: 날짜는 2026-10-22처럼 YYYY-MM-DD로 입력해 주세요.`);
  return value;
}
function sourceURL(value, label) {
  if (!value) return '';
  let url;
  try { url = new URL(value); } catch { throw new Error(`${label}: 링크는 https://로 시작하는 웹 주소여야 합니다.`); }
  if (url.protocol !== 'https:' || url.username || url.password || /\s/.test(value)) throw new Error(`${label}: 링크는 https://로 시작하는 웹 주소여야 합니다.`);
  return url.href;
}
async function textFile(file, fallback = '') {
  try { const stat = await fs.lstat(file); if (stat.isSymbolicLink()) throw new Error(`바로가기 파일은 지원하지 않습니다: ${file}`); return await fs.readFile(file, 'utf8'); }
  catch (error) { if (error.code === 'ENOENT') return fallback; throw error; }
}
async function entries(dir) {
  try {
    const result = await fs.readdir(dir, { withFileTypes: true });
    if (result.some(item => item.isSymbolicLink())) throw new Error(`바로가기 파일은 지원하지 않습니다: ${dir}`);
    return result.filter(item => !/^[._]/.test(item.name)).sort((a, b) => a.name.localeCompare(b.name, 'ko', { numeric: true }));
  } catch (error) { if (error.code === 'ENOENT') return []; throw error; }
}
export async function generateContent({ root = projectRoot, quiet = false } = {}) {
  const content = path.join(root, 'content');
  const output = path.join(root, 'public', 'data');
  const media = path.join(root, 'public', 'media');
  await fs.mkdir(output, { recursive: true }); await fs.mkdir(media, { recursive: true });
  const usedFiles = new Set();
  async function picture(file) {
    const bytes = await fs.readFile(file); const hash = crypto.createHash('sha256').update(bytes).digest('hex').slice(0, 20);
    const src = `${hash}.webp`, thumb = `${hash}-thumb.webp`;
    usedFiles.add(src); usedFiles.add(thumb);
    const metadata = await sharp(bytes).metadata();
    if (!['jpeg','png','webp','heif','avif'].includes(metadata.format)) throw Error('지원하는 사진 형식이 아닙니다: ' + path.basename(file));
    for (const [name, width, quality] of [[src, 2400, 88], [thumb, 960, 82]]) {
      try { await fs.access(path.join(media, name)); }
      catch { await sharp(bytes).rotate().resize({ width, height: width, fit: 'inside', withoutEnlargement: true }).webp({ quality }).toFile(path.join(media, name)); }
    }
    return { src: `media/${src}`, thumb: `media/${thumb}`, width: metadata.width, height: metadata.height };
  }
  async function photos(dir, fallback = {}) {
    const items = [];
    for (const file of await entries(dir)) {
      if (!file.isFile() || !imageExtensions.has(path.extname(file.name).toLowerCase())) continue;
      const stem = path.parse(file.name).name;
      const sidecar = await textFile(path.join(dir, stem + '.md'), null);
      const info = parsePhotoMarkdown(sidecar ?? '');
      items.push({ id: stem, title: info.title || stem.replace(/^\d+[-_ ]*/, ''), category: info.category || '사진', description: stripEmoji(info.description || fallback.description), metadata: sidecar !== null ? info.metadata : fallback.metadata || [], image: await picture(path.join(dir, file.name)) });
    }
    return items;
  }
  async function cover(dir) {
    const file = (await entries(dir)).find(e => e.isFile() && isCoverFilename(e.name));
    return file ? picture(path.join(dir, file.name)) : null;
  }
  async function contentFile(file) {
    return validateContentRecord(path.relative(root,file), await textFile(file, ''));
  }
  const settings = await contentFile(path.join(content, '설정', '사이트정보.md'));
  const recruitmentUrl = validateRecruitmentURL((await contentFile(path.join(content, '설정', '모집링크.md'))).url);
  const exhibitions = [];
  for (const folder of await entries(path.join(content, '전시'))) {
    if (!folder.isDirectory()) continue;
    const dir = path.join(content, '전시', folder.name);
    const info = await contentFile(path.join(dir, '전시정보.md'));
    if (!info.제목) throw new Error(`전시/${folder.name}/전시정보.md에 제목 속성을 입력해 주세요.`);
    const artworks = await photos(path.join(dir, '작품'));
    exhibitions.push({ sortNumber: exhibitionSortNumber(info), id: folder.name, title: info.제목, category: info.분류 || '전시', date: date(info.날짜, `전시/${folder.name}`), period: info.기간 || '', location: info.장소 || '', description: info.소개 || '', source: sourceURL(info.링크, `전시/${folder.name}`), cover: await cover(dir) || artworks[0]?.image || null, artworks });
  }
  exhibitions.sort((a, b) => b.sortNumber - a.sortNumber || a.title.localeCompare(b.title, 'ko'));
  const news = [];
  for (const folder of await entries(path.join(content, '소식'))) {
    if (!folder.isDirectory()) continue;
    const dir = path.join(content, '소식', folder.name);
    const info = await contentFile(path.join(dir, '소식.md'));
    if (!info.제목 || !info.내용) throw new Error(`소식/${folder.name}/소식.md에 제목과 내용을 입력해 주세요.`);
    const metadata = photoMetadata(info, { dateFallback: false });
    const source = sourceURL(info.링크, `소식/${folder.name}`);
    if (source) metadata.push(['링크', `[${source}](${source})`]);
    const gallery = await photos(path.join(dir, '사진'), { description: info.내용, metadata });
    news.push({ id: folder.name, title: info.제목, date: date(info.날짜, `소식/${folder.name}`), category: info.분류 || '소식', body: stripEmoji(info.내용), metadata, source, cover: await cover(dir) || gallery[0]?.image || null, photos: gallery });
  }
  news.sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title, 'ko'));
  const footer = await contentFile(path.join(content, '설정', '하단영역.md'));
  const homeCopy = homeSettings(await contentFile(path.join(content, '설정', '홈.md')), settings);
  homeCopy.활동링크 = homeCopy.활동링크.trim() ? linkURL(homeCopy.활동링크,{webOnly:true}) : '';
  const data = { settings, footerText: footer.내용 || '', footerLinks: footerLinks(footer, settings).map(item => ({...item, 주소:linkURL(item.주소)})), recruitmentUrl, introduction: (await contentFile(path.join(content, '소개.md'))).내용 || '', faqs: parseFAQ(await textFile(path.join(content, 'FAQ.md'), '')), exhibitions, activities: await photos(path.join(content, '활동사진')), news };
  data.introductionImage = await cover(path.join(content, '소개')) || data.activities[0]?.image || null;
  data.recruitmentImage = await cover(path.join(content, '모집')) || data.activities.find(item=>item.id==='02-천체사진-촬영장비')?.image || data.activities[0]?.image || null;
  // Lists stay small; bodies and photo metadata are fetched only on detail pages.
  // Content hashes keep a cached detail from being mistaken for a newer version.
  const detailFiles = new Set();
  async function detailPath(kind, item) {
    const json = JSON.stringify(item);
    const hash = crypto.createHash('sha256').update(json).digest('hex');
    const file = `details/${kind}/${hash}.json`;
    await fs.mkdir(path.dirname(path.join(output, file)), { recursive: true });
    await fs.writeFile(path.join(output, file), json);
    detailFiles.add(file);
    return `data/${file}`;
  }
  const latest = exhibitions[0];
  const heroExhibition = latest?.artworks.length ? latest : exhibitions.find(e => e.artworks.length) || latest;
  const hero = heroExhibition?.artworks[6] || heroExhibition?.artworks[0];
  const [activityExhibitionId, activityPhotoId] = (settings.활동배경 || '').split('/');
  const activity = exhibitions.find(e => e.id === activityExhibitionId)?.artworks.find(p => p.id === activityPhotoId) || hero;
  const homePhoto = photo => photo ? { title: photo.title, image: photo.image } : null;
  const heroImage = await cover(path.join(content, '홈', '대표'));
  const activityImage = await cover(path.join(content, '홈', '활동'));
  data.home = { copy:homeCopy, hero:heroImage ? {title:'', image:heroImage} : homePhoto(hero), activity:activityImage ? {title:'', image:activityImage} : homePhoto(activity) };
  const catalog = {
    ...data,
    version: 2,
    home: data.home,
    activities: data.activities.map(({ id, title, image }) => ({ id, title, image })),
    exhibitions: await Promise.all(exhibitions.map(async ({ id, title, category, date, period, cover, ...rest }) => ({
      id, title, category, date, period, cover,
      detailPath: await detailPath('exhibitions', { id, title, category, date, period, cover, ...rest }),
    }))),
    news: await Promise.all(news.map(async item => ({
      id: item.id, title: item.title, category: item.category, date: item.date,
      detailPath: await detailPath('news', item),
    }))),
  };
  await fs.writeFile(path.join(output, 'site.json'), JSON.stringify(catalog));
  for (const kind of ['exhibitions', 'news']) {
    const dir = path.join(output, 'details', kind);
    await fs.mkdir(dir, { recursive: true });
    for (const file of await fs.readdir(dir)) {
      if (/^[a-f0-9]{64}\.json$/.test(file) && !detailFiles.has(`details/${kind}/${file}`)) await fs.unlink(path.join(dir, file));
    }
  }
  await generateAdminSnapshot(root);
  for (const file of await fs.readdir(media)) if (/^[a-f0-9]{20}(-thumb)?\.webp$/.test(file) && !usedFiles.has(file)) await fs.unlink(path.join(media, file));
  await fs.writeFile(path.join(root, 'public', '.nojekyll'), '');
  if (!quiet) console.log(`콘텐츠 반영 완료: 전시 ${exhibitions.length}개 · 작품 ${exhibitions.reduce((n, e) => n + e.artworks.length, 0)}개 · 활동사진 ${data.activities.length}개 · 소식 ${news.length}개`);
  return data;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { await generateContent(); } catch (error) { console.error('\n콘텐츠 확인이 필요합니다.\n' + error.message); process.exitCode = 1; }
}
