// Render text and web links only. React escapes all text; HTML is never interpreted.
export function markdownLinks(text = '') {
  const parts = [];
  const pattern = /\[([^\]\n]*)\]\(((?:[^()\s]|\([^()\s]*\))+)\)/g;
  let end = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index > end) parts.push({ text: text.slice(end, match.index) });
    let href;
    try {
      const url = new URL(match[2]);
      if (['http:', 'https:'].includes(url.protocol) && !url.username && !url.password) href = url.href;
    } catch { /* Invalid links remain readable text. */ }
    parts.push(href ? { text: match[1] || match[2], href } : { text: match[0] });
    end = match.index + match[0].length;
  }
  if (end < text.length) parts.push({ text: text.slice(end) });
  return parts;
}
