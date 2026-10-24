import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { isContentPath } from '../src/admin-github.mjs';
import { ADMIN_ACCOUNTS_PATH, readAccounts } from '../src/admin-auth.mjs';

export async function generateAdminSnapshot(root) {
  const files = {};
  async function walk(relative) {
    for (const entry of await fs.readdir(path.join(root, relative), { withFileTypes: true })) {
      if (/^[._]/.test(entry.name)) continue;
      const name = `${relative}/${entry.name.normalize('NFC')}`;
      if (entry.isSymbolicLink()) throw Error('관리자 자료에 바로가기 파일을 넣을 수 없습니다.');
      if (entry.isDirectory()) await walk(name);
      else if (isContentPath(name)) {
        const bytes = await fs.readFile(path.join(root, name));
        const sha = crypto.createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
        files[name] = /\.(md|json)$/.test(name) ? { sha, text: bytes.toString('utf8') } : { sha, preview: `media/${crypto.createHash('sha256').update(bytes).digest('hex').slice(0,20)}-thumb.webp` };
      }
    }
  }
  await walk('content');
  try {
    const source = path.join(root, ADMIN_ACCOUNTS_PATH);
    if ((await fs.lstat(source)).isSymbolicLink()) throw Error('관리자 자료에 바로가기 파일을 넣을 수 없습니다.');
    const bytes = await fs.readFile(source);
    const text = bytes.toString('utf8');
    readAccounts(text);
    files[ADMIN_ACCOUNTS_PATH] = { sha: crypto.createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex'), text };
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  await fs.writeFile(path.join(root, 'public/data/admin.json'), JSON.stringify({ version: 1, files }));
}
