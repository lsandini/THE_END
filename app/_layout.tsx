import { Stack } from "expo-router";

const BG = "#4F4F4F";
const TEXT = "#E0E0E0";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        animation: "fade",
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
