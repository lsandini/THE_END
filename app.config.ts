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
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#F4F4F4",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.theend.app",
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
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
  },
  plugins: ["expo-router"],
});
