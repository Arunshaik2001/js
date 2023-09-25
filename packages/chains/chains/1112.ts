import type { Chain } from "../src/types";
export default {
  "chainId": 1112,
  "chain": "TWEMIX",
  "name": "WEMIX3.0 Testnet",
  "rpc": [
    "https://wemix3-0-testnet.rpc.thirdweb.com/${THIRDWEB_API_KEY}",
    "https://api.test.wemix.com",
    "wss://ws.test.wemix.com"
  ],
  "slug": "wemix3-0-testnet",
  "faucets": [
    "https://wallet.test.wemix.com/faucet"
  ],
  "nativeCurrency": {
    "name": "TestnetWEMIX",
    "symbol": "tWEMIX",
    "decimals": 18
  },
  "infoURL": "https://wemix.com",
  "shortName": "twemix",
  "testnet": true,
  "redFlags": [],
  "explorers": [
    {
      "name": "WEMIX Testnet Microscope",
      "url": "https://microscope.test.wemix.com",
      "standard": "EIP3091"
    }
  ],
  "features": []
} as const satisfies Chain;