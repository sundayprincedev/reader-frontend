import { createStore, del, get, keys, set } from 'idb-keyval'
import { api } from './api'

const store = createStore('mereader', 'files')

export async function cacheFile(key, blob) {
  await set(key, blob, store)
}

export async function cachedKeys() {
  return new Set(await keys(store))
}

export async function dropFile(key) {
  await del(key, store)
}

export async function resolveFile(key, { synced = true } = {}) {
  const cached = await get(key, store)

  if (cached) {
    if (!synced) {
      await api.uploadFile(key, new File([cached], key)).catch(() => undefined)
    }
    return cached
  }

  const blob = await api.downloadFile(key)
  await cacheFile(key, blob)
  return blob
}
