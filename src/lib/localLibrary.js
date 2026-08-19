import { createStore, del, get, keys, set } from 'idb-keyval'

const store = createStore('mereader', 'files')

export async function saveFile(key, file) {
  await set(key, { blob: file, name: file.name, size: file.size, savedAt: Date.now() }, store)
}

export async function loadFile(key) {
  const record = await get(key, store)
  return record?.blob ?? null
}

export async function hasFile(key) {
  return (await get(key, store)) !== undefined
}

export async function availableKeys() {
  return new Set(await keys(store))
}

export async function removeFile(key) {
  await del(key, store)
}
