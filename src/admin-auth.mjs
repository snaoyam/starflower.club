export const ADMIN_ACCOUNTS_PATH = 'public/admin/accounts.json';
const iterations = 600000;
const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8', { fatal: true });
const to64 = bytes => btoa(String.fromCharCode(...bytes));
const from64 = text => {
  if (typeof text !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(text) || text.length % 4) throw Error('관리자 암호화 자료 형식을 확인해 주세요.');
  try { return Uint8Array.from(atob(text), c => c.charCodeAt(0)); } catch { throw Error('관리자 암호화 자료 형식을 확인해 주세요.'); }
};
export function normalizeAdminId(id) {
  const value = typeof id === 'string' ? id.trim().toLowerCase() : '';
  if (!/^[a-z0-9][a-z0-9_.@-]{0,63}$/.test(value)) throw Error('아이디는 영문·숫자로 시작하고 영문·숫자·_ . @ -를 사용해 64자 이내로 입력해 주세요.');
  return value;
}
export function validateAccounts(value) {
  if (!value || value.version !== 1 || !Array.isArray(value.accounts) || !value.accounts.length) throw Error('최소 1명의 관리자가 남아 있어야 합니다.');
  const ids = new Set();
  for (const account of value.accounts) {
    if (!account || account.id !== normalizeAdminId(account.id) || ids.has(account.id)) throw Error('관리자 아이디가 중복되거나 올바르지 않습니다.');
    ids.add(account.id);
    if (account.kdf !== 'PBKDF2-SHA256' || account.iterations !== iterations || from64(account.salt).length !== 16 || from64(account.iv).length !== 12) throw Error('관리자 암호화 자료 형식을 확인해 주세요.');
    const length = from64(account.ciphertext).length;
    if (length < 17 || length > 16400) throw Error('관리자 암호화 자료 형식을 확인해 주세요.');
    if (Object.keys(account).some(key => !['id','kdf','iterations','salt','iv','ciphertext'].includes(key))) throw Error('관리자 자료에는 아이디와 암호화 정보만 저장할 수 있습니다.');
  }
  if (Object.keys(value).some(key => !['version','accounts'].includes(key))) throw Error('관리자 자료 형식을 확인해 주세요.');
  return value;
}
export function readAccounts(text) {
  let value;
  try { value = JSON.parse(text); } catch { throw Error('관리자 설정을 읽을 수 없습니다.'); }
  return validateAccounts(value);
}
export function serializeAccounts(value) { return JSON.stringify(validateAccounts(value), null, 2) + '\n'; }
function additionalData(id) { return encoder.encode(`starflower.club/admin/v1\0${id}`); }
async function passwordKey(password, salt, usage) {
  const material = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, material, { name: 'AES-GCM', length: 256 }, false, [usage]);
}
export async function encryptAdmin(id, password, token) {
  id = normalizeAdminId(id);
  if (typeof password !== 'string' || !password.trim()) throw Error('비밀번호를 입력해 주세요.');
  if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{1,16384}$/.test(token)) throw Error('사용할 GitHub 토큰을 확인해 주세요.');
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await passwordKey(password, salt, 'encrypt');
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: additionalData(id), tagLength: 128 }, key, encoder.encode(token));
  return { id, kdf: 'PBKDF2-SHA256', iterations, salt: to64(salt), iv: to64(iv), ciphertext: to64(new Uint8Array(ciphertext)) };
}
export async function decryptAdmin(database, id, password) {
  validateAccounts(database);
  try {
    id = normalizeAdminId(id);
    if (typeof password !== 'string' || !password) throw Error();
    const account = database.accounts.find(account => account.id === id);
    if (!account) throw Error();
    const key = await passwordKey(password, from64(account.salt), 'decrypt');
    const bytes = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: from64(account.iv), additionalData: additionalData(id), tagLength: 128 }, key, from64(account.ciphertext));
    const token = decoder.decode(bytes);
    if (!/^[A-Za-z0-9_-]{1,16384}$/.test(token)) throw Error();
    return token;
  } catch { throw Error('아이디 또는 비밀번호가 올바르지 않습니다.'); }
}
export async function addAdmin(database, id, password, token) {
  validateAccounts(database);
  id = normalizeAdminId(id);
  if (database.accounts.some(account => account.id === id)) throw Error('이미 사용 중인 관리자 아이디입니다.');
  const account = await encryptAdmin(id, password, token);
  return validateAccounts({ version: 1, accounts: [...database.accounts, account] });
}
export async function changeAdminPassword(database, id, currentPassword, newPassword, confirmation, { authenticationDatabase = database } = {}) {
  validateAccounts(database);
  id = normalizeAdminId(id);
  if (!database.accounts.some(account => account.id === id)) throw Error('삭제 예정인 계정의 비밀번호는 변경할 수 없습니다.');
  if (typeof newPassword !== 'string' || !newPassword.trim()) throw Error('새 비밀번호를 입력해 주세요.');
  if (newPassword !== confirmation) throw Error('새 비밀번호와 확인이 일치하지 않습니다.');
  let token;
  try { token = await decryptAdmin(authenticationDatabase, id, currentPassword); }
  catch { throw Error('현재 비밀번호가 올바르지 않습니다.'); }
  const replacement = await encryptAdmin(id, newPassword, token);
  return validateAccounts({ version: 1, accounts: database.accounts.map(account => account.id === id ? replacement : account) });
}
export function removeAdmin(database, id) {
  validateAccounts(database);
  if (!database.accounts.some(account => account.id === id)) throw Error('관리자를 찾을 수 없습니다.');
  if (database.accounts.length <= 1) throw Error('최소 1명의 관리자가 남아 있어야 합니다.');
  return validateAccounts({ version: 1, accounts: database.accounts.filter(account => account.id !== id) });
}
