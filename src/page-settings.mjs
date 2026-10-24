export const HOME_DEFAULTS = Object.freeze({
  대표문구: '별이 좋아 모인 사람들과\n밤하늘을 보고, 사진으로 남깁니다.',
  활동표제: 'CLUB LIFE',
  활동제목: '별바라기 활동사진',
  활동설명: '동아리 활동사진과 최신 소식은\n별바라기 Instagram을 확인해 주세요.',
  활동링크이름: 'Instagram',
  활동링크: 'https://www.instagram.com/kaist_starflower/',
  모집표제: 'RECRUITMENT',
  모집제목: '밤하늘이 궁금하다면, 별바라기로',
  모집설명: '천문학에 관심이 많은 사람, 그냥 별이 좋은 사람, 밤하늘이 예쁘다고 생각하는 사람이라면 지금 바로 지원해주세요!',
  모집버튼: '신입부원 모집 안내',
});
export function homeSettings(info = {}, settings = {}) {
  return {...HOME_DEFAULTS, ...(settings.인스타그램 ? {활동링크: settings.인스타그램} : {}), ...info};
}
export const LINK_ICONS = Object.freeze([
  ['instagram', 'Instagram'], ['youtube', 'YouTube'], ['facebook', 'Facebook'],
  ['email', '이메일'], ['link', '링크'], ['none', '아이콘 없음'],
]);
export function linkURL(value, {webOnly = false} = {}) {
  if (typeof value !== 'string' || !value.trim() || /[\s\x00-\x1f\x7f]/.test(value.trim())) throw Error('올바른 링크 주소를 입력해 주세요.');
  let url;
  try { url = new URL(value.trim()); } catch { throw Error('올바른 링크 주소를 입력해 주세요.'); }
  const protocols = webOnly ? ['http:', 'https:'] : ['http:', 'https:', 'mailto:', 'tel:'];
  if (!protocols.includes(url.protocol) || url.username || url.password || (!url.pathname && ['mailto:', 'tel:'].includes(url.protocol))) throw Error('웹주소(http/https), 이메일(mailto), 전화(tel) 링크를 확인해 주세요.');
  return url.href;
}
export function footerLinks(info = {}, settings = {}) {
  if (Object.hasOwn(info, '링크')) return info.링크;
  return [['인스타그램','Instagram','instagram'], ['유튜브','YouTube','youtube']]
    .filter(([key]) => /^https:\/\//.test(settings[key] || ''))
    .map(([key,이름,아이콘]) => ({이름, 주소:settings[key], 아이콘}));
}
export function validatePageSettings(name, info) {
  if (name === '홈.json') {
    for (const key of Object.keys(HOME_DEFAULTS)) if (Object.hasOwn(info,key) && typeof info[key] !== 'string') throw Error(`${key} 값은 문자열이어야 합니다.`);
    if (info.활동링크?.trim()) linkURL(info.활동링크, {webOnly:true});
  }
  if (name === '푸터.json' && Object.hasOwn(info,'링크')) {
    if (!Array.isArray(info.링크)) throw Error('푸터 링크는 배열이어야 합니다.');
    for (const [i, item] of info.링크.entries()) {
      if (!item || typeof item.이름 !== 'string' || !item.이름.trim()) throw Error(`링크 ${i+1}: 표시 이름을 입력해 주세요.`);
      try { linkURL(item.주소); } catch (error) { throw Error(`링크 ${i+1}: ${error.message}`); }
      if (!LINK_ICONS.some(([key]) => key === item.아이콘)) throw Error(`링크 ${i+1}: 아이콘을 선택해 주세요.`);
    }
  }
}
