import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "THE END" }} />
      <Stack.Screen name="story" options={{ title: "The End Begins..." }} />
    </Stack>
  );
}
