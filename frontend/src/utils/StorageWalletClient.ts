import { WalletClient, type CreateActionArgs, type CreateActionResult } from '@bsv/sdk'

/** Bridge SDK 2.8.8's binary wallet results to its array-only BRC-105 client. */
export default class StorageWalletClient extends WalletClient {
  async createAction(args: CreateActionArgs): Promise<CreateActionResult> {
    const result = await super.createAction(args)
    // The SDK has already validated and bound the wallet result to the request.
    // Copy only the documented AtomicBEEF representation; preserve every byte.
    return result.tx instanceof Uint8Array
      ? { ...result, tx: Array.from(result.tx) }
      : result
  }
}
