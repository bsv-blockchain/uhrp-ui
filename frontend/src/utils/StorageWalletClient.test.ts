import { afterEach, describe, expect, it, vi } from 'vitest'
import { WalletClient } from '@bsv/sdk'
import StorageWalletClient from './StorageWalletClient'

afterEach(() => vi.restoreAllMocks())

describe('binary wallet payment compatibility', () => {
  it('copies a validated binary transaction into the array representation required by AuthFetch', async () => {
    const tx = Uint8Array.from([0, 255, 1, 127])
    const response = { txid: 'a'.repeat(64), tx }
    const create = vi.spyOn(WalletClient.prototype, 'createAction').mockResolvedValue(response)
    const args = { description: 'Storage request payment', outputs: [] }
    const result = await new StorageWalletClient().createAction(args)
    expect(create).toHaveBeenCalledWith(args)
    expect(Array.isArray(result.tx)).toBe(true)
    expect(result).toEqual({ ...response, tx: [0, 255, 1, 127] })
    tx[0] = 99
    expect(result.tx?.[0]).toBe(0)
  })

  it('preserves JSON wallet results and propagates SDK validation failures', async () => {
    const response = { tx: [1, 2, 3] }
    const create = vi.spyOn(WalletClient.prototype, 'createAction').mockResolvedValue(response)
    const wallet = new StorageWalletClient()
    const args = { description: 'Storage request payment', outputs: [] }
    expect(await wallet.createAction(args)).toBe(response)
    create.mockRejectedValueOnce(new Error('Wallet output does not match request'))
    await expect(wallet.createAction(args)).rejects.toThrow('Wallet output does not match request')
  })
})
