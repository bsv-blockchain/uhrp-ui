import { describe, expect, it } from 'vitest'
import { storageNetwork } from './storageNetwork'
describe('provider download defaults', () => {
  it.each([
    ['https://nanostore.babbage.systems', 'mainnet'],
    ['https://staging-nanostore.babbage.systems', 'teratestnet'],
    ['https://custom.example', 'mainnet'],
    ['invalid provider', 'mainnet'],
    ['http://localhost:3104', 'local'],
    ['http://127.0.0.1:3104', 'local'],
    ['http://[::1]:3104', 'local']
  ])('uses the network for %s', (url, network) => expect(storageNetwork(url)).toBe(network))
})
