// Content records use Markdown lists, just like photo sidecars. A colon starts
// a scalar field; a field without a colon contains a nested list. Numbered
// lists represent arrays. Field names are unrestricted.
const numberPattern = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/;
function scalar(text) {
  if (text.startsWith('"')) {
    let value;
    try { value = JSON.parse(text); } catch { throw Error('따옴표로 감싼 문자열을 확인해 주세요.'); }
    if (typeof value !== 'string') throw Error('문자열 형식을 확인해 주세요.');
    return value;
  }
  if (text === 'true') return true;
  if (text === 'false') return false;
  if (text === 'null') return null;
  if (text === '[]') return [];
  if (text === '{}') return {};
  if (numberPattern.test(text)) {
    const value = Number(text);
    if (!Number.isFinite(value)) throw Error('유한한 숫자를 입력해 주세요.');
    return value;
  }
  return text;
}
function field(text) {
  if (text.startsWith('"')) {
    const match = text.match(/^("(?:[^"\\]|\\.)*")(.*)$/);
    if (!match) throw Error('항목 이름의 따옴표를 확인해 주세요.');
    const key = scalar(match[1]), rest = match[2];
    if (!rest) return {key, nested:true};
    if (!/^[:：]/.test(rest)) throw Error('항목 이름 뒤에 :를 입력해 주세요.');
    return {key, value:rest.slice(1).replace(/^ /,'')};
  }
  const index = text.search(/[:：]/);
  const key = (index < 0 ? text : text.slice(0,index)).trim();
  if (!key) throw Error('항목 이름을 입력해 주세요.');
  return index < 0 ? {key,nested:true} : {key,value:text.slice(index+1).replace(/^ /,'')};
}
export function parseMarkdownFields(text = '') {
  if (typeof text !== 'string') throw Error('Markdown 내용은 문자열이어야 합니다.');
  const lines = text.replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n').split('\n');
  let cursor = 0;
  const blank = line => !line.trim();
  const indentation = line => line.match(/^ */)[0].length;
  const skipBlank = () => { while (cursor < lines.length && blank(lines[cursor])) cursor++; };
  function block(indent, array = false, depth = 0) {
    if (depth > 64) throw Error('목록 들여쓰기가 너무 깊습니다.');
    const result = array ? [] : {};
    while (cursor < lines.length) {
      skipBlank();
      if (cursor === lines.length || indentation(lines[cursor]) < indent) break;
      if (indentation(lines[cursor]) !== indent) throw Error('목록의 들여쓰기를 확인해 주세요.');
      const line = lines[cursor].slice(indent);
      const match = array ? line.match(/^\d+\.(?: (.*))?$/) : line.match(/^- (.+)$/);
      if (!match) throw Error(array ? '배열 항목은 1. 형식의 번호 목록으로 작성해 주세요.' : '항목은 - 이름: 값 형식으로 작성해 주세요.');
      const entry = array ? {nested:match[1] === undefined || match[1] === '',value:match[1]} : field(match[1]);
      cursor++;
      let value;
      if (entry.nested) {
        skipBlank();
        if (cursor === lines.length || indentation(lines[cursor]) <= indent) throw Error('하위 목록을 들여쓰거나 빈 목록을 []로 입력해 주세요.');
        const childIndent = indentation(lines[cursor]);
        value = block(childIndent, /^\d+\.(?: |$)/.test(lines[cursor].slice(childIndent)), depth+1);
      } else {
        const continuation = indent + (array ? 4 : 2);
        const parts = [entry.value];
        let pendingBlank = 0;
        while (cursor < lines.length) {
          if (blank(lines[cursor])) { pendingBlank++;cursor++;continue; }
          if (indentation(lines[cursor]) < continuation) break;
          parts.push(...Array(pendingBlank).fill(''),lines[cursor].slice(continuation));
          pendingBlank = 0;cursor++;
        }
        value = parts.length > 1 ? parts.join('\n') : scalar(entry.value);
      }
      if (array) result.push(value);
      else {
        if (Object.hasOwn(result,entry.key)) throw Error(`중복된 항목 이름입니다: ${entry.key}`);
        Object.defineProperty(result,entry.key,{value,enumerable:true,writable:true,configurable:true});
      }
    }
    return result;
  }
  try {
    skipBlank();
    return cursor === lines.length ? {} : block(0);
  } catch (error) { throw Error(`Markdown ${Math.min(cursor+1,lines.length)}번째 줄: ${error.message}`); }
}
function keyText(key) {
  return !key || key !== key.trim() || /[:：\r\n\t"\\]/.test(key) ? JSON.stringify(key) : key;
}
function scalarText(value) {
  if (typeof value === 'string') {
    if (/[\r\x00-\x08\x0b\x0c\x0e-\x1f]/.test(value) || value.startsWith('\n') || value.endsWith('\n') || value.split('\n').some(line=>/[\t ]$/.test(line))) return JSON.stringify(value);
    if (value.includes('\n')) return value;
    if (!value || value.startsWith('"') || numberPattern.test(value) || typeof scalar(value) !== 'string') return JSON.stringify(value);
    return value;
  }
  if (value === null || typeof value === 'boolean' || typeof value === 'number' && Number.isFinite(value)) return JSON.stringify(value);
  if (Array.isArray(value) && !value.length) return '[]';
  if (value && Object.getPrototypeOf(value) === Object.prototype && !Object.keys(value).length) return '{}';
  throw Error('Markdown 콘텐츠에 저장할 수 없는 값입니다.');
}
export function serializeMarkdownFields(fields) {
  if (!fields || typeof fields !== 'object' || Array.isArray(fields) || Object.getPrototypeOf(fields) !== Object.prototype) throw Error('콘텐츠의 최상위 값은 항목 객체여야 합니다.');
  const active = new Set();
  function block(value, indent = 0) {
    if (active.has(value)) throw Error('순환 참조는 저장할 수 없습니다.');
    active.add(value);
    const array = Array.isArray(value), pad = ' '.repeat(indent), lines = [];
    for (const [key,item] of Object.entries(value)) {
      const prefix = array ? `${pad}1.` : `${pad}- ${keyText(key)}`;
      if (item && typeof item === 'object' && Object.keys(item).length) {
        if (!Array.isArray(item) && Object.getPrototypeOf(item) !== Object.prototype) throw Error('항목 값의 형식을 확인해 주세요.');
        lines.push(prefix,...block(item,indent+4));
      } else {
        const parts = scalarText(item).split('\n');
        lines.push(prefix+(array?' ':':')+(array?'':parts[0]?' ':'')+parts[0]);
        for (const line of parts.slice(1)) lines.push(line ? ' '.repeat(indent+(array?4:2))+line : '');
      }
    }
    active.delete(value);
    return lines;
  }
  return block(fields).join('\n')+'\n';
}
