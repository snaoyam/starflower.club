// Photo sidecars use a small, predictable Markdown list format.
// Additional information is an array so arbitrary and repeated labels keep their order.
export function parsePhotoMarkdown(text = '') {
  const result = { title: '', description: '', category: '', metadata: [], hasAdditionalInfo: false };
  let active = null;
  for (const line of text.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').split('\n')) {
    const field = line.match(/^- (제목|설명|분류)[:：][ \t]*(.*)$/);
    if (field) {
      active = { 제목: 'title', 설명: 'description', 분류: 'category' }[field[1]];
      result[active] = field[2];
      continue;
    }
    if (/^- 추가정보[ \t]*[:：]?[ \t]*$/.test(line)) {
      result.hasAdditionalInfo = true;
      active = 'metadata';
      continue;
    }
    if (active === 'metadata') {
      const entry = line.match(/^(?: {2}|\t)-[ \t]*(.*)$/);
      if (entry) {
        const parts = /^(?:https?:\/\/|\[)/.test(entry[1]) ? null : entry[1].match(/^([^:：]+)[:：][ \t]*(.*)$/);
        result.metadata.push(parts ? [parts[1].trim(), parts[2]] : ['', entry[1]]);
      } else if (result.metadata.length) {
        result.metadata.at(-1)[1] += '\n' + line.replace(/^(?: {4}|\t)/, '');
      }
    } else if (active) result[active] += '\n' + line.replace(/^ {2}/, '');
  }
  for (const field of ['title', 'description', 'category']) result[field] = result[field].trim();
  result.metadata = result.metadata.map(([label, value]) => [label, value.trim()]);
  return result;
}
