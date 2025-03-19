import WalletClient from '@bsv/sdk/wallet/WalletClient'

const client = new WalletClient('auto')

export default async function checkForMetaNetClient() { // TODO Add new check for Metanet
  try {
    const { network: result } = await client.getNetwork()
    if (result === 'mainnet' || result === 'testnet') {
      return 1
    } else {
      return -1
    }
  } catch (e) {
    return 0
  }
}
