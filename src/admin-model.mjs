import { isContentRecordPath, parseFields, serializeFields, validateContentRecord, validateRecruitmentURL, exhibitionSortNumber } from './content-format.mjs';
import { parsePhotoMarkdown } from '../scripts/photo-markdown.mjs';
import { ADMIN_ACCOUNTS_PATH, readAccounts } from './admin-auth.mjs';
import { coverImagePaths } from './upload-files.mjs';
export const isImage = path => /\.(jpg|jpeg|png|webp|avif)$/i.test(path);
export function aboutImagePath(files) {
  const paths = Object.keys(files).sort((a,b)=>a.localeCompare(b,'ko',{numeric:true}));
  return coverImagePaths(files,'content/소개/')[0]
    || paths.find(p=>/^content\/활동사진\/[^/]+$/.test(p) && isImage(p)) || '';
}
export function recruitmentImagePath(files) {
  const paths = Object.keys(files).sort((a,b)=>a.localeCompare(b,'ko',{numeric:true}));
  return coverImagePaths(files,'content/모집/')[0]
    || paths.find(p=>/^content\/활동사진\/02-천체사진-촬영장비\.(jpg|jpeg|png|webp|avif)$/i.test(p))
    || paths.find(p=>/^content\/활동사진\/[^/]+$/.test(p) && isImage(p)) || '';
}
export function assertRasterImage(bytes) {
  const ascii = (start,end) => String.fromCharCode(...bytes.subarray(start,end));
  const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const png = [137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v);
  const webp = ascii(0,4)==='RIFF' && ascii(8,12)==='WEBP';
  const avif = ascii(4,8)==='ftyp' && /avif|avis/.test(ascii(8,64));
  if (!jpeg && !png && !webp && !avif) throw Error('지원하는 사진 파일을 선택해 주세요. 확장자만 바꾼 파일은 사용할 수 없습니다.');
}
export function mergedFiles(files, changes) {
  const result = { ...files };
  for (const [path, value] of Object.entries(changes)) { if (value === null) delete result[path]; else result[path] = value; }
  return result;
}
export function serializePhoto(info) {
  const lines = ['- 제목: ' + info.title.replace(/\r?\n/g, ' '), '- 설명: ' + info.description.replace(/\r\n?/g, '\n').split('\n').join('\n  ')];
  if (info.category) lines.push('- 분류: ' + info.category.replace(/\r?\n/g, ' '));
  if (info.hasAdditionalInfo || info.metadata.length) {
    lines.push('- 추가정보');
    for (const [label, value] of info.metadata) lines.push('  - ' + (label ? label.replace(/[:：\r\n]/g, ' ') + ': ' : '') + value.replace(/\r\n?/g, '\n').split('\n').join('\n    '));
  }
  return lines.join('\n') + '\n';
}
function safeSortNumber(info) { try { return exhibitionSortNumber(info); } catch { return 0; } }
export function recordPaths(files, kind) {
  const end = kind === '전시' ? '/전시정보.md' : '/소식.md';
  return Object.keys(files).filter(p => p.startsWith(`content/${kind}/`) && p.endsWith(end)).sort((a,b) => (kind === '전시' ? safeSortNumber(parseFields(files[b].text)) - safeSortNumber(parseFields(files[a].text)) : (parseFields(files[b].text).날짜 || '').localeCompare(parseFields(files[a].text).날짜 || '')) || a.localeCompare(b,'ko'));
}
export function validateEdits(files, changes) {
  const all = mergedFiles(files, changes);
  if (Object.hasOwn(changes, ADMIN_ACCOUNTS_PATH) && !all[ADMIN_ACCOUNTS_PATH]) throw Error('최소 1명의 관리자가 남아 있어야 합니다.');
  if (all[ADMIN_ACCOUNTS_PATH]) readAccounts(all[ADMIN_ACCOUNTS_PATH].text);
  for (const [path,value] of Object.entries(all)) if (isContentRecordPath(path)) validateContentRecord(path,value.text);
  for (const path of recordPaths(all, '전시').concat(recordPaths(all, '소식'))) {
    const info = parseFields(all[path].text);
    if (!info.제목?.trim()) throw Error('모든 전시와 소식에 제목을 입력해 주세요.');
    if (path.endsWith('/소식.md') && !info.내용?.trim()) throw Error(`${info.제목}: 소식 본문을 입력해 주세요.`);
    if (path.endsWith('/전시정보.md')) exhibitionSortNumber(info);
    if (Object.hasOwn(changes,path) && changes[path]) {
      if (!info.분류?.trim()) throw Error(`${info.제목}: 분류를 입력해 주세요.`);
      if (path.endsWith('/소식.md') && !info.날짜?.trim()) throw Error(`${info.제목}: 게시 날짜를 입력해 주세요.`);
    }
    const date = new Date((info.날짜 || '') + 'T00:00:00Z');
    if (info.날짜 && (!/^\d{4}-\d{2}-\d{2}$/.test(info.날짜) || Number.isNaN(date.valueOf()) || date.toISOString().slice(0,10) !== info.날짜)) throw Error(`${info.제목}: 날짜를 확인해 주세요.`);
    if (info.링크) {
      let url; try { url = new URL(info.링크); } catch { throw Error(`${info.제목}: 링크 주소를 확인해 주세요.`); }
      if (url.protocol !== 'https:' || url.username || url.password || /\s/.test(info.링크)) throw Error(`${info.제목}: 링크는 HTTPS 주소여야 합니다.`);
    }
  }
  validateRecruitmentURL(parseFields(all['content/설정/모집링크.md']?.text).url);
  // Check sidecars with the same parser used by the public build.
  for (const [path,value] of Object.entries(changes)) if (value && path.endsWith('.md') && !isContentRecordPath(path)) parsePhotoMarkdown(value.text);
  return all;
}
export { parseFields, serializeFields, validateContentRecord, validateRecruitmentURL, parsePhotoMarkdown, exhibitionSortNumber };

export function updateContentField(text, key, value) {
  return serializeFields({...parseFields(text), [key]: value});
}
