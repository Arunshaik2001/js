import {
  WalletConfig,
  ConnectUIProps,
  WalletOptions,
  useWalletConnectionSetup,
  useWalletContext,
} from "@thirdweb-dev/react-core";
import { SmartWallet } from "@thirdweb-dev/wallets";
import { SmartWalletConfig, SmartWalletConfigOptions } from "./types";
import { SmartWalletConnecting } from "./SmartWalletConnecting";
import { HeadlessConnectUI } from "../headlessConnectUI";

export const smartWallet = (
  wallet: WalletConfig<any>,
  config: SmartWalletConfigOptions,
): SmartWalletConfig => {
  const WalletSelectUI = wallet.selectUI;

  return {
    ...wallet,
    create: (options: WalletOptions) =>
      new SmartWallet({ ...options, ...config }),
    connectUI(props) {
      return <SmartConnectUI {...props} personalWalletConfig={wallet} />;
    },
    selectUI: WalletSelectUI
      ? (props) => {
          return <WalletSelectUI {...props} walletConfig={wallet} />;
        }
      : undefined,
    personalWallets: [wallet],
  };
};

export const SmartConnectUI = (
  props: ConnectUIProps<SmartWallet> & { personalWalletConfig: WalletConfig },
) => {
  const { walletSetupData } = useWalletContext();
  const { walletConfig } = props;
  const { personalWalletConfig, ...restProps } = props;
  const personalWalletConnection = useWalletConnectionSetup(walletSetupData);

  if (!personalWalletConnection.activeWallet) {
    const _props: ConnectUIProps = {
      ...restProps,
      walletConfig: personalWalletConfig,
      supportedWallets: [personalWalletConfig],
      connected: () => {
        // override to no-op
      },
      connect(options) {
        console.log("personal wallet connected");
        return personalWalletConnection.connectWallet(
          personalWalletConfig,
          options,
        );
      },
      setConnectedWallet(wallet) {
        console.log("personal wallet set");
        personalWalletConnection.setConnectedWallet(wallet);
      },
      setConnectionStatus(status) {
        console.log("personal wallet status set");
        personalWalletConnection.setConnectionStatus(status);
      },
    };

    if (personalWalletConfig.connectUI) {
      return <personalWalletConfig.connectUI {..._props} />;
    }

    return <HeadlessConnectUI {..._props} />;
  }

  return (
    <SmartWalletConnecting
      onBack={props.goBack}
      onConnect={() => {
        console.log("smart wallet connected");
        props.connected();
      }}
      smartWallet={walletConfig}
      personalWalletConfig={personalWalletConfig}
      personalWallet={personalWalletConnection.activeWallet}
      personalWalletChainId={personalWalletConnection.connectedChainId || 1}
      switchChainPersonalWallet={personalWalletConnection.switchChain}
    />
  );
};
