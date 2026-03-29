import "dotenv/config";
import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "THE_END",
  slug: "the-end",
  version: "1.0.0",
  scheme: "the-end",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "dark",
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#0A0A0C",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.theend.app",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#0A0A0C",
      foregroundImage: "./assets/android-icon-foreground.png",
      backgroundImage: "./assets/android-icon-background.png",
      monochromeImage: "./assets/android-icon-monochrome.png",
    },
    package: "com.theend.app",
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  extra: {
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    eas: {
      projectId: "dc4a92e7-03e8-4d09-b377-db7a7b8731d4",
    },
  },
  plugins: ["expo-router"],
});
