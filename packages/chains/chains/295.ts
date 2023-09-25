import type { Chain } from "../src/types";
export default {
  "chainId": 295,
  "chain": "Hedera",
  "name": "Hedera Mainnet",
  "rpc": [
    "https://hedera.rpc.thirdweb.com/${THIRDWEB_API_KEY}",
    "https://mainnet.hashio.io/api"
  ],
  "slug": "hedera",
  "icon": {
    "url": "ipfs://QmQikzhvZKyMmbZJd7BVLZb2YTBDMgNDnaMCAErsVjsfuz",
    "width": 1500,
    "height": 1500,
    "format": "png"
  },
  "faucets": [],
  "nativeCurrency": {
    "name": "hbar",
    "symbol": "HBAR",
    "decimals": 18
  },
  "infoURL": "https://hedera.com",
  "shortName": "hedera-mainnet",
  "testnet": false,
  "redFlags": [],
  "explorers": [
    {
      "name": "HashScan",
      "url": "https://hashscan.io/mainnet/dashboard",
      "standard": "none"
    },
    {
      "name": "Arkhia Explorer",
      "url": "https://explorer.arkhia.io",
      "standard": "none"
    },
    {
      "name": "DragonGlass",
      "url": "https://app.dragonglass.me",
      "standard": "none"
    },
    {
      "name": "Hedera Explorer",
      "url": "https://hederaexplorer.io",
      "standard": "none"
    },
    {
      "name": "Ledger Works Explore",
      "url": "https://explore.lworks.io",
      "standard": "none"
    }
  ],
  "features": [
    {
      "name": "EIP155"
    },
    {
      "name": "EIP1559"
    }
  ]
} as const satisfies Chain;