import { AuthFetch, StorageUtils, type WalletInterface } from '@bsv/sdk'

export interface StoredUpload { uhrpUrl: string; expiryTime: number }
export interface UploadPage { uploads: StoredUpload[]; nextOffset?: number; legacyAdvertisementsPending: number }

/** Read one bounded, authenticated wallet page, including migration/paging signals. */
export async function listUploadsPage(storageURL: string, wallet: WalletInterface, offset = 0): Promise<UploadPage> {
  const host = new URL(storageURL)
  if (host.protocol !== 'https:' || host.username || host.password || host.pathname !== '/' || host.search || host.hash) {
    throw new Error('Storage server must be an HTTPS origin.')
  }
  if (!Number.isSafeInteger(offset) || offset < 0 || offset > 100_000) throw new Error('Invalid upload page offset.')
  const url = new URL('/list', host)
  url.searchParams.set('limit', '200')
  url.searchParams.set('offset', String(offset))
  const response = await new AuthFetch(wallet).fetch(url.toString(), { method: 'GET' })
  if (!response.ok) throw new Error(`File listing failed: HTTP ${response.status}`)
  if (response.body == null) throw new Error('Storage server returned an empty file listing.')
  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.length
    if (size > 1024 * 1024) {
      await reader.cancel()
      throw new Error('File listing exceeds the page size limit.')
    }
    chunks.push(value)
  }
  const bytes = new Uint8Array(size)
  let position = 0
  for (const chunk of chunks) { bytes.set(chunk, position); position += chunk.length }
  const data = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes))
  if (data.status !== 'success' || !Array.isArray(data.uploads) || data.uploads.length > 200) {
    throw new Error('Storage server returned an invalid upload page.')
  }
  const uploads = data.uploads.map((item: StoredUpload) => {
    if (typeof item.uhrpUrl !== 'string' || item.uhrpUrl.length > 256 || !Number.isSafeInteger(item.expiryTime) || item.expiryTime < 0) {
      throw new Error('Storage server returned an invalid upload record.')
    }
    StorageUtils.getHashFromURL(item.uhrpUrl)
    return { uhrpUrl: item.uhrpUrl, expiryTime: item.expiryTime }
  })
  if (data.nextOffset !== undefined && (!Number.isSafeInteger(data.nextOffset) || data.nextOffset <= offset || data.nextOffset > 100_000)) {
    throw new Error('Storage server returned an invalid next page.')
  }
  const pending = data.legacyAdvertisementsPending ?? 0
  if (!Number.isSafeInteger(pending) || pending < 0 || pending > 200) throw new Error('Storage server returned an invalid migration count.')
  return { uploads, nextOffset: data.nextOffset, legacyAdvertisementsPending: pending }
}
