import { Stack } from "expo-router";

const BG = "#F4F4F4";
const TEXT = "#2A2A2A";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        animation: "fade",
        animationDuration: 1500,
        headerStyle: { backgroundColor: BG },
        headerTintColor: TEXT,
        headerTitleStyle: { fontWeight: "300" },
        contentStyle: { backgroundColor: BG },
      }}
    >
      <Stack.Screen name="index" options={{ title: "THE END" }} />
      <Stack.Screen name="story" options={{ title: "The End Begins..." }} />
    </Stack>
  );
}
