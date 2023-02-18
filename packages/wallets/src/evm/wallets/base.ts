import { AsyncStorage } from "../../core/AsyncStorage";
import { thirdwebChains } from "../constants/chains";
import { ConnectParams, TWConnector } from "../interfaces/tw-connector";
import { AbstractWallet } from "./abstract";
import type { Chain } from "@wagmi/core";

export type WalletOptions<TOpts extends Record<string, any> = {}> = {
  chains?: Chain[];
  // default: true
  shouldAutoConnect?: boolean;
  coordinatorStorage: AsyncStorage;
  walletStorage: AsyncStorage;
  appName: string;
} & TOpts;

export abstract class AbstractBrowserWallet<
  TAdditionalOpts extends Record<string, any> = {},
  TConnectParams extends Record<string, any> = {},
> extends AbstractWallet {
  #wallletId;
  protected coordinatorStorage;
  protected walletStorage;
  protected chains;
  protected options: WalletOptions<TAdditionalOpts>;

  constructor(walletId: string, options: WalletOptions<TAdditionalOpts>) {
    super();
    this.#wallletId = walletId;
    this.options = options;
    this.chains = options.chains || thirdwebChains;
    this.coordinatorStorage = options.coordinatorStorage;
    // make sure walletStorage is having the name walletId
    this.walletStorage = options.walletStorage;
    // if (options.shouldAutoConnect !== false) {
    //   this.autoConnect();
    // }
  }

  protected abstract getConnector(): Promise<TWConnector<TConnectParams>>;

  async autoConnect() {
    const lastConnectedWallet = await this.coordinatorStorage.getItem(
      "lastConnectedWallet",
    );

    console.log('autoConnect', this.#wallletId)
    if (lastConnectedWallet === this.#wallletId) {
      const lastConnectionParamsJson = await this.walletStorage.getItem(
        "lastConnectedParams",
      );

      let parsedParams: ConnectParams<TConnectParams> | undefined;

      try {
        parsedParams = JSON.parse(lastConnectionParamsJson as string);
      } catch {
        parsedParams = undefined;
      }

      console.log('parsedParams', parsedParams)

      const connector = await this.getConnector();

      console.log('connector.isConnected')
      if (!await connector.isConnected()) {
        return await this.connect(parsedParams);
      }
    }
  }

  async connect(
    connectOptions?: ConnectParams<TConnectParams>,
  ): Promise<string> {
    const connector = await this.getConnector();
    console.log('getConnector')

    // setup listeners to re-expose events
    connector.on("connect", (data) => {
      console.log('on.Connect')
      this.coordinatorStorage.setItem("lastConnectedWallet", this.#wallletId);
      this.emit("connect", { address: data.account, chainId: data.chain?.id });
      if (data.chain?.id) {
        this.walletStorage.setItem("lastConnectedChain", data.chain?.id);
      }
    });
    connector.on("change", (data) => {
      console.log('on.change')
      this.emit("change", { address: data.account, chainId: data.chain?.id });
      if (data.chain?.id) {
        this.walletStorage.setItem("lastConnectedChain", data.chain?.id);
      }
    });
    connector.on("message", (data) => this.emit("message", data));
    connector.on("disconnect", () => this.emit("disconnect"));
    connector.on("error", (error) => this.emit("error", error));

    console.log('right before connect', connectOptions)
    // end event listener setups
    let connectedAddress = await connector.connect(connectOptions);
    // do not break on coordinator error
    try {
      await this.walletStorage.setItem(
        "lastConnectedParams",
        JSON.stringify(connectOptions),
      );
      await this.coordinatorStorage.setItem(
        "lastConnectedWallet",
        this.#wallletId,
      );
    } catch { }

    return connectedAddress;
  }

  async getSigner() {
    const connector = await this.getConnector();
    if (!connector) {
      throw new Error("Wallet not connected");
    }
    return await connector.getSigner();
  }

  public async disconnect() {
    const connector = await this.getConnector();
    if (connector) {
      connector.removeAllListeners();
      await connector.disconnect();
      // get the last connected wallet and check if it's this wallet, if so, remove it
      const lastConnectedWallet = await this.coordinatorStorage.getItem(
        "lastConnectedWallet",
      );
      if (lastConnectedWallet === this.#wallletId) {
        await this.coordinatorStorage.removeItem("lastConnectedWallet");
      }
    }
  }

  async switchChain(chainId: number): Promise<void> {
    const connector = await this.getConnector();
    if (!connector) {
      throw new Error("Wallet not connected");
    }
    if (!connector.switchChain) {
      throw new Error("Wallet does not support switching chains");
    }
    return await connector.switchChain(chainId);
  }
}
