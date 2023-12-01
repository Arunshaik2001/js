import {
  SetModalConfigCtx,
  WalletUIStatesProvider,
} from "../../../evm/providers/wallet-ui-states-provider";
import {
  modalMaxWidthCompact,
  defaultTheme,
  reservedScreens,
} from "../constants";
import { ConnectModalContent } from "./ConnectModal";
import { useScreen } from "./screen";
import { isMobile } from "../../../evm/utils/isMobile";
import { DynamicHeight } from "../../../components/DynamicHeight";
import {
  CustomThemeProvider,
  useCustomTheme,
} from "../../../design-system/CustomThemeProvider";
import { ComponentProps, useContext, useEffect, useRef, useState } from "react";
import { useTWLocale } from "../../../evm/providers/locale-provider";
import { StyledDiv } from "../../../design-system/elements";
import { Theme, radius } from "../../../design-system";
import {
  WalletConfig,
  useConnectionStatus,
  useThirdwebAuthContext,
  useUser,
} from "@thirdweb-dev/react-core";
import { Container } from "../../../components/basic";
import { Spinner } from "../../../components/Spinner";

export type ConnectEmbedProps = {
  className?: string;
  theme?: "dark" | "light" | Theme;

  style?: React.CSSProperties;

  /**
   * If provided, Embed will show a Terms of Service message at the bottom with below link
   */
  termsOfServiceUrl?: string;

  /**
   * If provided, Embed will show a Privacy Policy message at the bottom with below link
   */
  privacyPolicyUrl?: string;

  /**
   * Callback to be called when wallet is connected ( and user is authenticated if `auth` is enabled )
   */
  onComplete?: () => void;

  /**
   * Enable [Auth](https://portal.thirdweb.com/auth) to enforce user to sign a message after connecting wallet.
   * This also requires setting `authConfig` in `ThirdwebProvider`
   *
   * @defaultValue true ( if authConfig is provided in `ThirdwebProvider` )
   */
  auth?: boolean;
};

export const ConnectEmbed = (props: ConnectEmbedProps) => {
  const connectionStatus = useConnectionStatus();
  const [show, setShow] = useState(true);
  const isOnConnectCalled = useRef(false);
  const { screen, setScreen, initialScreen } = useScreen();
  const { user } = useUser();
  const authConfig = useThirdwebAuthContext();
  const { onComplete } = props;

  const requiresSignIn =
    props.auth === false
      ? false
      : !!authConfig?.authUrl &&
        !user?.address &&
        connectionStatus === "connected";

  const isWrapperWalletUI =
    typeof screen === "object" && !!screen.personalWallets;

  useEffect(() => {
    if (onComplete && !show && !isOnConnectCalled.current) {
      onComplete();
      isOnConnectCalled.current = true;
    }
  }, [onComplete, show]);

  useEffect(() => {
    if (requiresSignIn && screen === reservedScreens.main) {
      setScreen(reservedScreens.signIn);
    }
  }, [requiresSignIn, screen, setScreen]);

  useEffect(() => {
    if (connectionStatus === "connected") {
      if (requiresSignIn) {
        setShow(true);
      } else {
        if (isWrapperWalletUI) {
          setShow(true);
        } else {
          setShow(false);
        }
      }
    } else {
      setShow(true);
    }
  }, [connectionStatus, isWrapperWalletUI, requiresSignIn]);

  if (show) {
    return (
      <ConnectEmbedContent
        {...props}
        onClose={() => {
          setScreen(initialScreen);
        }}
        screen={screen}
        setScreen={setScreen}
        initialScreen={initialScreen}
      />
    );
  }

  return null;
};

const ConnectEmbedContent = (
  props: Omit<ConnectEmbedProps, "onConnect"> & {
    onClose: () => void;
    screen: string | WalletConfig;
    setScreen: (screen: string | WalletConfig) => void;
    initialScreen: string | WalletConfig;
  },
) => {
  const modalSize = "compact" as const;
  const connectionStatus = useConnectionStatus();

  let content = (
    <ConnectModalContent
      initialScreen={props.initialScreen}
      screen={props.screen}
      setScreen={props.setScreen}
      isOpen={true}
      onClose={props.onClose}
      onHide={() => {
        // no op
      }}
      onShow={() => {
        // no op
      }}
    />
  );

  if (
    connectionStatus === "connecting" &&
    props.screen === reservedScreens.main
  ) {
    content = (
      <Container
        flex="column"
        center="both"
        style={{
          minHeight: "300px",
        }}
      >
        <Spinner size="xl" color="accentText" />
      </Container>
    );
  }

  const walletUIStatesProps = {
    theme: props.theme || defaultTheme,
    modalSize: modalSize,
    title: undefined,
    termsOfServiceUrl: props.termsOfServiceUrl,
    privacyPolicyUrl: props.privacyPolicyUrl,
    isEmbed: true,
  };

  return (
    <WalletUIStatesProvider {...walletUIStatesProps}>
      <CustomThemeProvider theme={walletUIStatesProps.theme}>
        <EmbedContainer
          className={props.className}
          style={{
            height: "auto",
            maxWidth: modalMaxWidthCompact,
            ...props.style,
          }}
        >
          <DynamicHeight> {content} </DynamicHeight>
          <SyncedWalletUIStates {...walletUIStatesProps} />
        </EmbedContainer>
      </CustomThemeProvider>
    </WalletUIStatesProvider>
  );
};

export function SyncedWalletUIStates(
  props: ComponentProps<typeof WalletUIStatesProvider>,
) {
  const setModalConfig = useContext(SetModalConfigCtx);
  const locale = useTWLocale();

  // update modalConfig on props change
  useEffect(() => {
    setModalConfig((c) => ({
      ...c,
      title: props.title || locale.connectWallet.defaultModalTitle,
      theme: props.theme || "dark",
      modalSize: (isMobile() ? "compact" : props.modalSize) || "wide",
      termsOfServiceUrl: props.termsOfServiceUrl,
      privacyPolicyUrl: props.privacyPolicyUrl,
      welcomeScreen: props.welcomeScreen,
      titleIconUrl: props.titleIconUrl,
    }));
  }, [
    props.title,
    props.theme,
    props.modalSize,
    props.termsOfServiceUrl,
    props.privacyPolicyUrl,
    props.welcomeScreen,
    props.titleIconUrl,
    setModalConfig,
    locale.connectWallet.defaultModalTitle,
  ]);

  return <WalletUIStatesProvider {...props} />;
}

const EmbedContainer = /* @__PURE__ */ StyledDiv(() => {
  const theme = useCustomTheme();
  return {
    color: theme.colors.primaryText,
    background: theme.colors.modalBg,
    width: "100%",
    boxSizing: "border-box",
    position: "relative",
    lineHeight: "normal",
    borderRadius: radius.xl,
    border: `1px solid ${theme.colors.borderColor}`,
    overflow: "hidden",
    fontFamily: theme.fontFamily,
    "& *::selection": {
      backgroundColor: theme.colors.primaryText,
      color: theme.colors.modalBg,
    },
  };
});
