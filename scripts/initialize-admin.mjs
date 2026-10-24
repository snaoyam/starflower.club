import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseTokenFile } from '../src/admin-github.mjs';
import { ADMIN_ACCOUNTS_PATH, encryptAdmin, serializeAccounts, decryptAdmin } from '../src/admin-auth.mjs';

// Reads the token directly from disk; it never appears in command arguments or logs.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
try {
  if (!process.argv[2]) throw Error('사용법: node scripts/initialize-admin.mjs /개인보관위치/starflower.token');
  const file = path.resolve(process.argv[2]);
  const { token } = parseTokenFile(await fs.readFile(file, 'utf8'), path.basename(file));
  const database = { version: 1, accounts: [await encryptAdmin('admin', 'admin', token)] };
  if (await decryptAdmin(database, 'admin', 'admin') !== token) throw Error('초기 관리자 확인에 실패했습니다.');
  const target = path.join(root, ADMIN_ACCOUNTS_PATH);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, serializeAccounts(database), { flag: 'wx' });
  console.log('최초 관리자 admin 생성 완료. 암호화된 정보만 저장했습니다.');
} catch (error) {
  console.error(error.code === 'EEXIST' ? '관리자 설정이 이미 있습니다. 기존 계정은 변경하지 않았습니다.' : error.message);
  process.exitCode = 1;
}
