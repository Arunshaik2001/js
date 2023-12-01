import { ScanScreen } from "../../ConnectWallet/screens/ScanScreen";
import {
  useCreateWalletInstance,
  useWalletContext,
} from "@thirdweb-dev/react-core";
import { useEffect, useRef, useState } from "react";
import type { MetaMaskWallet } from "@thirdweb-dev/wallets";
import type { ConnectionStatus, WalletConfig } from "@thirdweb-dev/react-core";
import { useTWLocale } from "../../../evm/providers/locale-provider";

export const MetamaskScan: React.FC<{
  onBack: () => void;
  onGetStarted: () => void;
  onConnected: () => void;
  walletConfig: WalletConfig<MetaMaskWallet>;
  hideBackButton: boolean;
  setConnectionStatus: (status: ConnectionStatus) => void;
  setConnectedWallet: (wallet: MetaMaskWallet) => void;
}> = (props) => {
  const {
    onBack,
    onConnected,
    onGetStarted,
    walletConfig,
    hideBackButton,
    setConnectionStatus,
    setConnectedWallet,
  } = props;

  const locale = useTWLocale().wallets.metamaskWallet;
  const createInstance = useCreateWalletInstance();
  const [qrCodeUri, setQrCodeUri] = useState<string | undefined>();
  const { chainToConnect } = useWalletContext();

  const scanStarted = useRef(false);
  useEffect(() => {
    if (scanStarted.current) {
      return;
    }
    scanStarted.current = true;

    const metamask = createInstance(walletConfig);

    setConnectionStatus("connecting");
    metamask.connectWithQrCode({
      chainId: chainToConnect?.chainId,
      onQrCodeUri(uri) {
        setQrCodeUri(uri);
      },
      onConnected() {
        setConnectedWallet(metamask);
        onConnected();
      },
    });
  }, [
    createInstance,
    chainToConnect,
    onConnected,
    walletConfig,
    setConnectedWallet,
    setConnectionStatus,
  ]);

  return (
    <ScanScreen
      qrScanInstruction={locale.scanScreen.instruction}
      onBack={onBack}
      onGetStarted={onGetStarted}
      qrCodeUri={qrCodeUri}
      walletName={walletConfig.meta.name}
      walletIconURL={walletConfig.meta.iconURL}
      hideBackButton={hideBackButton}
      getStartedLink={locale.getStartedLink}
    />
  );
};
