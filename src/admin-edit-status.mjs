import { assertUnchanged } from './admin-github.mjs';

// A successful save updates the in-memory SHA immediately. Always check the
// deployed snapshot too, so that it cannot unlock editing before deployment.
export async function refreshEditingSnapshot({ client, loadSnapshot, snapshot, hasChanges }) {
  const deployed = await loadSnapshot();
  if (deployed?.version !== 1 || !deployed.files || typeof deployed.files !== 'object' || Array.isArray(deployed.files)) {
    throw Error('편집용 자료 형식을 확인해 주세요.');
  }
  await client.checkCurrent(deployed.files);
  if (hasChanges) {
    const tree = Object.entries(deployed.files).map(([path, file]) => ({ path, sha: file.sha, mode: '100644' }));
    assertUnchanged(snapshot.files, { tree }, 'edit');
    return snapshot; // Preserve unsaved edits and their original baseline.
  }
  return deployed;
}
