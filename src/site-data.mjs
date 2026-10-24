// Share pending requests as well as completed results during this page session.
// Failed requests are removed so the retry button can issue a fresh request.
export function createSiteDataLoader({ fetchData = (...args) => fetch(...args), resolve = value => value } = {}) {
  const cache = new Map(), results = new Map(), waiting = new Map();
  function load(file) {
    if (!cache.has(file)) {
      results.delete(file);
      const request = Promise.resolve().then(async () => {
        const response = await fetchData(resolve(file), file === 'data/site.json' ? { cache: 'no-cache' } : {});
        if (!response.ok) throw new Error('사이트 내용을 불러오지 못했습니다.');
        return response.json();
      }).then(data => {
        results.set(file, { data, error: false });
        return data;
      }).catch(error => {
        results.set(file, { data: null, error: true });
        cache.delete(file);
        throw error;
      });
      cache.set(file, request);
      // Suspense waits for settlement; failures render the existing retry UI.
      waiting.set(file, request.then(() => {}, () => {}));
    }
    return cache.get(file);
  }
  load.read = file => {
    if (results.has(file)) return results.get(file);
    load(file);
    throw waiting.get(file);
  };
  load.retry = file => {
    results.delete(file);
    cache.delete(file);
    return load(file);
  };
  return load;
}

// Only preload a link the visitor interacts with, and respect reduced-data connections.
export function prefetchSiteDetail(load, record, connection) {
  if (!record?.detailPath || connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '')) return;
  return load(record.detailPath).catch(() => {});
}

// A response from a page we have left must not update the new page's state.
// The shared request can still finish and populate the cache for a later visit.
export function subscribeToSiteData(load, file, onState) {
  let active = true;
  onState({ data: null, error: false });
  load(file).then(
    data => { if (active) onState({ data, error: false }); },
    () => { if (active) onState({ data: null, error: true }); },
  );
  return () => { active = false; };
}
