// Offline-first IndexedDB edge cache for student answer resilience

const DB_NAME = 'examind_offline_db'
const DB_VERSION = 1
const STORE_NAME = 'answers_cache'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function saveLocalAnswer(sessionId: number, questionId: number, response: string): Promise<void> {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const key = `${sessionId}_${questionId}`
    store.put({ key, sessionId, questionId, response, updatedAt: Date.now() })
  } catch (err) {
    console.warn('[IndexedDB] Failed to save answer locally:', err)
  }
}

export async function getAllLocalAnswers(sessionId: number): Promise<Array<{ questionId: number; response: string }>> {
  try {
    const db = await openDB()
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const request = store.getAll()

      request.onsuccess = () => {
        const all = request.result || []
        const filtered = all
          .filter((item: any) => item.sessionId === sessionId)
          .map((item: any) => ({ questionId: item.questionId, response: item.response }))
        resolve(filtered)
      }
      request.onerror = () => resolve([])
    })
  } catch {
    return []
  }
}

export async function clearLocalAnswers(sessionId: number): Promise<void> {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const request = store.getAll()

    request.onsuccess = () => {
      const all = request.result || []
      for (const item of all) {
        if (item.sessionId === sessionId) {
          store.delete(item.key)
        }
      }
    }
  } catch (err) {
    console.warn('[IndexedDB] Failed to clear local answers:', err)
  }
}
