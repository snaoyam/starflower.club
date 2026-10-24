const keys = new Set(['제목', '날짜', '정렬숫자', '기간', '장소', '소개', '작가', '촬영정보', '설명', '내용', '분류', '이름', '영문이름', '이메일', '페이스북', '인스타그램', '유튜브', '활동배경', '모집안내', '출처', '창립연도', '동아리방', '천체', '촬영일시', '촬영장소', '망원경', '카메라', '렌즈', '보정렌즈', '가대', '삼각대', '가이드장비', '필터', '촬영장비', '노출', '보정프로그램', '비고']);

export function parseFields(text = '') {
  const result = {}; let active = null;
  for (const line of text.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').split('\n')) {
    if (line.startsWith('#')) continue;
    const match = line.match(/^([^\s:：][^:：]{0,19})[:：]\s*(.*)$/);
    if (match && keys.has(match[1].trim())) {
      active = match[1].trim(); result[active] = match[2];
    } else if (active) result[active] += '\n' + line.replace(/^  /, '');
  }
  return Object.fromEntries(Object.entries(result).map(([key, value]) => [key, value.trim()]));
}
export function meaningfulText(text = '') {
  return text.replace(/^\uFEFF/, '').split(/\r?\n/).filter(line => !line.trimStart().startsWith('#')).join('\n').trim();
}
export function validateRecruitmentURL(text) {
  const value = meaningfulText(text);
  if (!value) return '';
  if (/\s/.test(value)) throw new Error('모집링크.txt: 주소 하나만 한 줄로 입력해 주세요.');
  let url;
  try { url = new URL(value); } catch { throw new Error('모집링크.txt: Google Form 주소를 한 줄로 입력해 주세요.'); }
  if (url.protocol !== 'https:' || url.username || url.password || !((url.hostname === 'forms.gle' && url.pathname.length > 1) || (url.hostname === 'docs.google.com' && url.pathname.startsWith('/forms/')))) {
    throw new Error('모집링크.txt: https://forms.gle/... 또는 https://docs.google.com/forms/... 주소만 사용할 수 있습니다.');
  }
  return url.href;
}

export function serializeFields(fields) {
  return Object.entries(fields).map(([key,value]) => `${key}: ${String(value ?? "").replace(/\r\n?/g, "\n").split("\n").join("\n  ")}`).join("\n") + "\n";
}

export function exhibitionSortNumber(info) {
  if (!Object.hasOwn(info, '정렬숫자')) return Number((info.날짜 || '').replaceAll('-', '')) || 0;
  const value = String(info.정렬숫자).trim();
  if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value))) throw Error('정렬숫자는 0 이상의 정수로 입력해 주세요.');
  return Number(value);
}
