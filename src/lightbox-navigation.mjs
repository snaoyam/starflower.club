// Keep decoded images available for the current photo and nearby navigation.
export function createImagePreloader(createImage = () => new Image(), capacity = 6) {
  const cache = new Map();
  return function preload(src, priority = 'low') {
    const cached = cache.get(src);
    if (cached) {
      cache.delete(src);
      cache.set(src, cached);
      if (priority === 'high') cached.image.fetchPriority = priority;
      return cached.promise;
    }
    const image = createImage();
    image.decoding = 'async';
    image.fetchPriority = priority;
    image.src = src;
    const entry = { image, ready: false, promise: null };
    entry.promise = image.decode().then(() => {
      entry.ready = true;
      for (const [key, value] of cache) {
        if (cache.size <= capacity) break;
        if (value.ready) cache.delete(key);
      }
      return image;
    }, error => {
      cache.delete(src);
      throw error;
    });
    cache.set(src, entry);
    return entry.promise;
  };
}

// A late image must never replace a more recent selection or update a closed viewer.
export function createPhotoNavigation({ initialIndex, count, load, onState }) {
  let shown = initialIndex;
  let requested = initialIndex;
  let request = 0;
  let disposed = false;
  const publish = (loading, error = '') => onState({ index: shown, loading, error });
  function prefetch() {
    load(shown, 'high').catch(() => {});
    for (const i of [shown - 1, shown + 1]) {
      if (i >= 0 && i < count) load(i, 'low').catch(() => {});
    }
  }
  prefetch();
  return {
    async move(direction) {
      if (disposed) return;
      const next = requested + direction;
      if (next < 0 || next >= count) return;
      requested = next;
      const target = requested;
      const ticket = ++request;
      if (target === shown) { publish(false); return; }
      publish(true);
      try {
        await load(target, 'high');
        if (disposed || ticket !== request) return;
        shown = target;
        publish(false);
        prefetch();
      } catch {
        if (disposed || ticket !== request) return;
        requested = shown;
        publish(false, '사진을 불러오지 못했습니다. 화살표를 눌러 다시 시도해 주세요.');
      }
    },
    dispose() { disposed = true; request++; },
  };
}
