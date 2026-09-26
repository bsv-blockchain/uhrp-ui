import { createPublicHTTPSFetch } from '@bsv/sdk'

/** Preserve provider-required header values without combining casing variants. */
export function createStorageUploadTransport(transport = createPublicHTTPSFetch()): typeof fetch {
  return async (input, init) => {
    if (init?.method !== 'PUT' || init.headers == null || init.headers instanceof Headers || Array.isArray(init.headers)) {
      return transport(input, init)
    }
    const headers = new Headers()
    // SDK 2.8.8 puts the file's Content-Type before normalized provider headers.
    // HTTP names are case-insensitive; the required value must replace the hint.
    for (const [name, value] of Object.entries(init.headers)) headers.set(name, value)
    return transport(input, { ...init, headers })
  }
}
