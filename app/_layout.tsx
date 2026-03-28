import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { C } from "../theme";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          animation: "fade",
          animationDuration: 1200,
          headerStyle: {
            backgroundColor: C.bg,
          },
          headerTintColor: C.textDim,
          headerTitleStyle: {
            fontWeight: "300",
            fontSize: 13,
          },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: C.bg },
        }}
      >
        <Stack.Screen name="index" options={{ title: "THE END" }} />
        <Stack.Screen name="story" options={{ title: "" }} />
      </Stack>
    </>
  );
}
