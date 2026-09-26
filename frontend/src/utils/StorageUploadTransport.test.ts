import { describe, expect, it, vi } from 'vitest'
import { createStorageUploadTransport } from './StorageUploadTransport'

describe('signed storage upload transport', () => {
  it('replaces a file MIME hint with the exact signed provider type', async () => {
    const transport = vi.fn<typeof fetch>().mockResolvedValue(new Response('', { status: 200 }))
    const body = Uint8Array.from([1, 2, 3])
    await createStorageUploadTransport(transport)('https://uploads.example/file', {
      method: 'PUT', body, redirect: 'error', headers: {
        'Content-Type': 'text/plain', 'content-type': 'application/octet-stream',
        'content-length': '3', 'x-goog-if-generation-match': '0'
      }
    })
    const [, options] = transport.mock.calls[0]
    const headers = options?.headers as Headers
    expect(headers.get('content-type')).toBe('application/octet-stream')
    expect(headers.get('content-length')).toBe('3')
    expect(headers.get('x-goog-if-generation-match')).toBe('0')
    expect(options?.body).toBe(body)
    expect(options?.redirect).toBe('error')
  })

  it('leaves authenticated requests and existing Headers unchanged', async () => {
    const transport = vi.fn<typeof fetch>().mockResolvedValue(new Response('', { status: 200 }))
    const fetchClient = createStorageUploadTransport(transport)
    const post = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }
    await fetchClient('https://storage.example/upload', post)
    expect(transport).toHaveBeenLastCalledWith('https://storage.example/upload', post)
    const put = { method: 'PUT', headers: new Headers({ 'content-type': 'application/octet-stream' }) }
    await fetchClient('https://uploads.example/file', put)
    expect(transport).toHaveBeenLastCalledWith('https://uploads.example/file', put)
  })
})
