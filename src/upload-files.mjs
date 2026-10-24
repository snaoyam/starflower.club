const imageExtension = /\.(jpg|jpeg|png|webp|avif)$/i;

export const isCoverFilename = name => /^커버(?:-[a-f0-9]{64})?\.(jpg|jpeg|png|webp|avif)$/i.test(name);

export function coverImagePaths(files, prefix) {
  return Object.keys(files).filter(path => path.startsWith(prefix) && isCoverFilename(path.slice(prefix.length)))
    .sort((a,b) => a.localeCompare(b, 'ko', { numeric: true }));
}

export async function createUploadName(filename, { selectedAt = Date.now(), cover = false, order = 1, existingNames = new Set(), cryptoProvider = globalThis.crypto } = {}) {
  const extension = filename.match(imageExtension)?.[1].toLowerCase();
  if (!extension) throw Error('사진은 JPG·PNG·WebP·AVIF 형식으로 선택해 주세요.');
  const stem = [...filename.replace(imageExtension, '').normalize('NFC').replace(/[^\p{L}\p{N}_-]+/gu, '-').replace(/^-+|-+$/g, '')].slice(0, 40).join('') || '사진';
  // The picker time identifies the selection; a fresh nonce separates files even in the same millisecond or on another device.
  for (let attempt = 0; attempt < 5; attempt++) {
    const input = JSON.stringify([selectedAt, cryptoProvider.randomUUID(), filename]);
    const digest = await cryptoProvider.subtle.digest('SHA-256', new TextEncoder().encode(input));
    const hash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
    const name = `${cover ? '커버' : `${String(order).padStart(3, '0')}-${stem}`}-${hash}.${extension}`;
    if (!existingNames.has(name)) {
      existingNames.add(name);
      return name;
    }
  }
  throw Error('사진 파일의 고유 이름을 만들지 못했습니다. 사진을 다시 선택해 주세요.');
}
