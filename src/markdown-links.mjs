// Render text and web links only. React escapes all text; HTML is never interpreted.
export function markdownLinks(text = '') {
  const parts = [];
  // Only standard Markdown [label](URL) creates a link.
  const pattern = /\[([^\]\n]*)\]\(((?:[^()\s]|\([^()\s]*\))+)\)/g;
  let end = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index > end) parts.push({ text: text.slice(end, match.index) });
    const label = match[1];
    const destination = match[2];
    let href;
    try {
      const url = new URL(destination);
      if (['http:', 'https:'].includes(url.protocol) && !url.username && !url.password) href = url.href;
    } catch { /* Invalid links remain readable text. */ }
    parts.push(href ? { text: label || destination, href } : { text: match[0] });
    end = match.index + match[0].length;
  }
  if (end < text.length) parts.push({ text: text.slice(end) });
  return parts;
}
