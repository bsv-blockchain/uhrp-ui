export type StorageNetwork = 'mainnet' | 'teratestnet' | 'local'

/** Defaults for the bundled providers; custom providers remain user-selectable. */
export function storageNetwork(storageURL: string): StorageNetwork {
  let host: string
  try { host = new URL(storageURL).hostname } catch { return 'mainnet' }
  if (host === 'staging-nanostore.babbage.systems') return 'teratestnet'
  if (host === 'localhost' || host === '127.0.0.1' || host === '[::1]') return 'local'
  return 'mainnet'
}
