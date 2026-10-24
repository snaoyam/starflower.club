import { validatePageSettings } from './page-settings.mjs';
import { parseMarkdownFields, serializeMarkdownFields } from './markdown-fields.mjs';
export const parseFields = parseMarkdownFields;
export const serializeFields = serializeMarkdownFields;

export function isContentRecordPath(path) {
  return /^content\/(설정\/(사이트정보|모집링크|하단영역|홈)\.md|(소개|FAQ)\.md|전시\/[^/]+\/전시정보\.md|소식\/[^/]+\/소식\.md)$/.test(path.normalize('NFC'));
}

export function validateContentRecord(path, text) {
  try {
    const info = parseFields(text);
    const name = path.normalize('NFC').split('/').at(-1);
    const stringFields = {
      '전시정보.md': ['제목', '날짜', '분류', '기간', '장소', '소개', '링크'],
      '소식.md': ['제목', '날짜', '분류', '내용', '링크'],
      '사이트정보.md': ['이름', '영문이름', '인스타그램', '유튜브', '활동배경', '모집안내'],
      '소개.md': ['내용'], '하단영역.md': ['내용'], '모집링크.md': ['url'],
    }[name] || [];
    for (const key of stringFields) if (Object.hasOwn(info,key) && typeof info[key] !== 'string') throw Error(`${key} 값은 문자열이어야 합니다.`);
    validatePageSettings(name, info);
    if (name === '전시정보.md') exhibitionSortNumber(info);
    if (name === '사이트정보.md' && Object.hasOwn(info,'창립연도') && (!['string','number'].includes(typeof info.창립연도) || !/^\d{4}$/.test(info.창립연도))) throw Error('창립연도는 네 자리 숫자로 입력해 주세요.');
    if (name === '모집링크.md') validateRecruitmentURL(info.url);
    if (name === 'FAQ.md' && Object.hasOwn(info,'항목')) {
      if (!Array.isArray(info.항목) || info.항목.some(item => !item || typeof item.질문 !== 'string' || typeof item.답변 !== 'string')) throw Error('FAQ 항목은 질문과 답변 문자열을 가진 객체의 배열이어야 합니다.');
    }
    return info;
  } catch (error) { throw Error(`${path}: ${error.message}`); }
}

export function validateRecruitmentURL(text) {
  const value = String(text ?? '').trim();
  if (!value) return '';
  if (/\s/.test(value)) throw new Error('모집링크.md: 주소 하나만 한 줄로 입력해 주세요.');
  let url;
  try { url = new URL(value); } catch { throw new Error('모집링크.md: http:// 또는 https://로 시작하는 올바른 주소를 입력해 주세요.'); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
    throw new Error('모집링크.md: http:// 또는 https://로 시작하고 로그인 정보가 포함되지 않은 웹주소를 입력해 주세요.');
  }
  return url.href;
}

export function exhibitionSortNumber(info) {
  if (!Object.hasOwn(info, '정렬숫자')) return Number((info.날짜 || '').replaceAll('-', '')) || 0;
  if (!['string','number'].includes(typeof info.정렬숫자)) throw Error('정렬숫자는 숫자 또는 숫자 문자열로 입력해 주세요.');
  const value = String(info.정렬숫자).trim();
  if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value))) throw Error('정렬숫자는 0 이상의 정수로 입력해 주세요.');
  return Number(value);
}
