import type { WalletOptions, ConfiguredWallet } from "@thirdweb-dev/react-core";
import {
  FrameWallet,
  assertWindowEthereum,
  createAsyncLocalStorage,
  walletIds,
} from "@thirdweb-dev/wallets";
import { FrameConnectUI } from "./FrameConnectUI";

export const frameWallet = () => {
  const configuredWallet = {
    id: FrameWallet.id,
    meta: {
      name: "Frame Wallet",
      iconURL:
        "https://frame.nyc3.digitaloceanspaces.com/bundle/home/favicon.8f0e1342.png",
      urls: {
        chrome:
          "https://chrome.google.com/webstore/detail/frame-companion/ldcoohedfbjoobcadoglnnmmfbdlmmhf",
        firefox:
          "https://addons.mozilla.org/en-US/firefox/addon/frame-extension",
      },
    },
    create(options: WalletOptions) {
      const walletStorage = createAsyncLocalStorage(walletIds.frame);
      return new FrameWallet({ ...options, walletStorage });
    },
    connectUI(props) {
      return <FrameConnectUI {...props} configuredWallet={configuredWallet} />;
    },
    isInstalled() {
      if (assertWindowEthereum(globalThis.window)) {
        return (
          globalThis.window.ethereum?.isFrame ||
          globalThis.window.ethereum?.providers?.some((p) => p.isFrame) ||
          false
        );
      }
      return false;
    },
  } satisfies ConfiguredWallet<FrameWallet>;

  return configuredWallet;
};
