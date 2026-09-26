import { afterEach, describe, expect, it, vi } from 'vitest'
import { AuthFetch, StorageUtils } from '@bsv/sdk'
import StorageWalletClient from './StorageWalletClient'
import { listUploadsPage } from './listUploadsPage'
const uhrpUrl = StorageUtils.getURLForHash(Array(32).fill(3))
afterEach(() => vi.restoreAllMocks())

describe('bounded authenticated file pages', () => {
  it('keeps pagination and recovery signals with verified file records', async () => {
    const fetch = vi.spyOn(AuthFetch.prototype, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      status: 'success', uploads: [{ uhrpUrl, expiryTime: 2_000_000_000 }], nextOffset: 400, legacyAdvertisementsPending: 20
    })))
    const page = await listUploadsPage('https://storage.example', new StorageWalletClient(), 200)
    expect(fetch).toHaveBeenCalledWith('https://storage.example/list?limit=200&offset=200', { method: 'GET' })
    expect(page).toEqual({ uploads: [{ uhrpUrl, expiryTime: 2_000_000_000 }], nextOffset: 400, legacyAdvertisementsPending: 20 })
  })

  it('remains compatible with a provider that omits pagination fields', async () => {
    vi.spyOn(AuthFetch.prototype, 'fetch').mockResolvedValue(new Response(JSON.stringify({ status: 'success', uploads: [] })))
    expect(await listUploadsPage('https://storage.example', new StorageWalletClient())).toEqual({ uploads: [], nextOffset: undefined, legacyAdvertisementsPending: 0 })
  })

  it('rejects oversized data, invalid records, and a nonadvancing page', async () => {
    const fetch = vi.spyOn(AuthFetch.prototype, 'fetch')
    fetch.mockResolvedValueOnce(new Response('x'.repeat(1024 * 1024 + 1)))
    await expect(listUploadsPage('https://storage.example', new StorageWalletClient())).rejects.toThrow('size limit')
    fetch.mockResolvedValueOnce(new Response(JSON.stringify({ status: 'success', uploads: [{ uhrpUrl: 'invalid', expiryTime: 1 }] })))
    await expect(listUploadsPage('https://storage.example', new StorageWalletClient())).rejects.toThrow()
    fetch.mockResolvedValueOnce(new Response(JSON.stringify({ status: 'success', uploads: [], nextOffset: 200 })))
    await expect(listUploadsPage('https://storage.example', new StorageWalletClient(), 200)).rejects.toThrow('next page')
  })
})
