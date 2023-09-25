import type { Chain } from "../src/types";
export default {
  "chainId": 786,
  "chain": "MAAL",
  "name": "MAAL Chain",
  "rpc": [
    "https://maal-chain.rpc.thirdweb.com/${THIRDWEB_API_KEY}",
    "https://node1-mainnet.maalscan.io/",
    "https://node2-mainnet.maalscan.io/",
    "https://node3-mainnet.maalscan.io/"
  ],
  "slug": "maal-chain",
  "icon": {
    "url": "ipfs://bafkreiexfqfe2x4impvwhra3xxa5eb25gv25zi3kkaoatdnld7wbxdzf2a",
    "width": 512,
    "height": 512,
    "format": "png"
  },
  "faucets": [],
  "nativeCurrency": {
    "name": "MAAL",
    "symbol": "MAAL",
    "decimals": 18
  },
  "infoURL": "https://www.maalchain.com/",
  "shortName": "maal",
  "testnet": false,
  "redFlags": [],
  "explorers": [
    {
      "name": "maalscan",
      "url": "https://maalscan.io",
      "standard": "EIP3091"
    }
  ],
  "features": []
} as const satisfies Chain;