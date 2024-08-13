/// <reference types="vite/client" />

type ImportMetaEnvAugmented =
  import("@julr/vite-plugin-validate-env").ImportMetaEnvAugmented<
    typeof import("./env").default
  >;

interface ImportMetaEnv extends ImportMetaEnvAugmented {}

interface Window {
  __BUILD_INFO__?: {
    version: string;
  };
}
