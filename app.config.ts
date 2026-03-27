import "dotenv/config";
import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "THE_END",
  slug: "the-end",
  version: "1.0.0",
  scheme: "the-end",
  extra: {
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  },
  plugins: ["expo-router"],
});
