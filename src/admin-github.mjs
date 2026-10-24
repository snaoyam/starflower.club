// Credentials stay in the caller's memory. Never include server response bodies in errors.
import { ADMIN_ACCOUNTS_PATH, readAccounts } from './admin-auth.mjs';
export const ADMIN_TARGET = Object.freeze({ repository: 'snaoyam/starflower.club', branch: 'main' });
export function parseTokenFile(text, filename = 'starflower.token') {
  if (filename !== 'starflower.token') throw Error('파일 이름을 starflower.token으로 저장해 주세요.');
  const token = typeof text === 'string' ? text.replace(/^\uFEFF/, '').trim() : '';
  if (!/^[A-Za-z0-9_-]+$/.test(token)) throw Error('starflower.token 파일에 GitHub 토큰 값만 한 줄로 입력해 주세요.');
  return { ...ADMIN_TARGET, token };
}

export function isContentPath(path) {
  if (path === ADMIN_ACCOUNTS_PATH) return true;
  if (typeof path !== 'string' || /[\\\x00-\x1f]/.test(path) || path.split('/').some(p => !p || p.startsWith('.') || p.startsWith('_'))) return false;
  return /^content\/(설정\/(사이트정보|모집링크|푸터)\.txt|(소개|FAQ)\.txt|(소개|모집)\/커버(?:-[a-f0-9]{64})?\.(jpg|jpeg|png|webp|avif)|활동사진\/[^/]+\.(md|jpg|jpeg|png|webp|avif)|(전시|소식)\/[^/]+\/(전시정보\.txt|소식\.txt|커버(?:-[a-f0-9]{64})?\.(jpg|jpeg|png|webp|avif)|(작품|사진)\/[^/]+\.(md|jpg|jpeg|png|webp|avif)))$/i.test(path);
}
export function assertContentPath(path) {
  if (!isContentPath(path)) throw Error('허용된 콘텐츠 파일만 저장할 수 있습니다.');
}
export function assertUnchanged(files, tree) {
  if (tree.truncated) throw Error('저장소 목록이 너무 큽니다. 저장하지 않았습니다.');
  const remote = Object.fromEntries(tree.tree.filter(f => isContentPath(f.path)).map(f => [f.path, f]));
  const paths = new Set([...Object.keys(files), ...Object.keys(remote)]);
  for (const path of paths) {
    if (files[path]?.sha !== remote[path]?.sha || (remote[path] && remote[path].mode !== '100644')) throw Error('다른 변경사항이 먼저 저장되었습니다. 편집 내용을 복사해 둔 뒤 배포 완료 후 새로고침해 주세요. 덮어쓰지 않았습니다.');
  }
}
export function createGitHubClient({ token }, fetcher = fetch) {
  const credentials = { ...ADMIN_TARGET, token };
  const prefix = `/repos/${credentials.repository}`;
  async function request(path, method = 'GET', body) {
    let response;
    try {
      response = await fetcher(`https://api.github.com${prefix}${path}`, {
        method, redirect: 'error', cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer', signal: AbortSignal.timeout(60000),
        headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${credentials.token}`, 'X-GitHub-Api-Version': '2022-11-28', ...(body ? { 'Content-Type': 'application/json' } : {}) },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
    } catch { throw Error('GitHub에 연결하지 못했습니다. 연결을 확인한 뒤 다시 시도해 주세요.'); }
    if (!response.ok) {
      const reason = {401:'토큰이 만료됐거나 올바르지 않습니다.',403:'토큰 권한 또는 저장소 정책을 확인해 주세요.',404:'저장소·브랜치·배포 설정 또는 토큰의 저장소 접근 권한을 확인해 주세요.',409:'다른 변경사항과 충돌했습니다. 새로고침 후 다시 편집해 주세요.',422:'변경사항 충돌 또는 저장소 보호 규칙을 확인해 주세요.'}[response.status] || '요청을 처리하지 못했습니다.';
      throw Error(`GitHub ${response.status}: ${reason}`);
    }
    return response.status === 204 ? null : response.json();
  }
  const branchPath = credentials.branch.split('/').map(encodeURIComponent).join('/');
  return {
    actionsURL: `https://github.com/${credentials.repository}/actions/workflows/deploy.yml`,
    async publish(files, changes, progress = () => {}) {
      const entries = Object.entries(changes);
      if (!entries.length) throw Error('변경사항이 없습니다.');
      if (entries.length > 1000) throw Error('한 번에 1,000개 이하의 파일을 저장해 주세요.');
      let size = 0;
      for (const [path, value] of entries) {
        assertContentPath(path);
        if (path === ADMIN_ACCOUNTS_PATH) {
          if (!value || typeof value.text !== 'string') throw Error('최소 1명의 관리자가 남아 있어야 합니다.');
          readAccounts(value.text);
        }
        if (value && typeof value.text !== 'string' && typeof value.base64 !== 'string') throw Error('파일 내용을 확인해 주세요.');
        if (value) size += value.base64 ? value.base64.length * .75 : new TextEncoder().encode(value.text).length;
      }
      if (size > 50 * 1024 * 1024) throw Error('한 번에 50MB 이하로 저장해 주세요.');
      progress('저장소의 변경사항을 확인하고 있습니다…');
      const ref = await request(`/git/ref/heads/${branchPath}`);
      const head = ref.object.sha;
      const commit = await request(`/git/commits/${head}`);
      const tree = await request(`/git/trees/${commit.tree.sha}?recursive=1`);
      assertUnchanged(files, tree);
      const edits = [];
      for (const [path, value] of entries) {
        if (value === null) { if (files[path]) edits.push({ path, mode: '100644', type: 'blob', sha: null }); continue; }
        progress(`파일을 전송하고 있습니다… ${edits.length + 1} / ${entries.length}`);
        const blob = await request('/git/blobs', 'POST', { content: value.base64 ?? value.text, encoding: value.base64 ? 'base64' : 'utf-8' });
        edits.push({ path, mode: '100644', type: 'blob', sha: blob.sha });
      }
      const nextTree = await request('/git/trees', 'POST', { base_tree: commit.tree.sha, tree: edits });
      const nextCommit = await request('/git/commits', 'POST', { message: '관리자 화면에서 콘텐츠 수정 [skip ci]', tree: nextTree.sha, parents: [head] });
      // A concurrent update cannot be overwritten: the new commit has only head as parent.
      await request(`/git/refs/heads/${branchPath}`, 'PATCH', { sha: nextCommit.sha, force: false });
      const updated = { ...files };
      for (const edit of edits) {
        if (!edit.sha) delete updated[edit.path];
        else updated[edit.path] = { ...changes[edit.path], sha: edit.sha };
      }
      return { files: updated, sha: nextCommit.sha };
    },
    dispatch: () => request('/actions/workflows/deploy.yml/dispatches', 'POST', { ref: credentials.branch }),
  };
}
