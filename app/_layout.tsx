import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { TouchableOpacity, Text } from "react-native";
import { C, textGlowIntense } from "../theme";

function BackButton() {
  const router = useRouter();
  return (
    <TouchableOpacity
      onPress={() => router.back()}
      style={{ paddingHorizontal: 12, paddingVertical: 6 }}
    >
      <Text
        style={{
          color: C.accentHi,
          fontSize: 28,
          fontWeight: "300",
          ...textGlowIntense(C.accentHi + "60"),
        }}
      >
        ‹
      </Text>
    </TouchableOpacity>
  );
}

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
            color: C.textDim,
          },
          headerShadowVisible: false,
          headerBackVisible: false,
          contentStyle: { backgroundColor: C.bg },
        }}
      >
        <Stack.Screen name="index" options={{ title: "THE END" }} />
        <Stack.Screen
          name="story"
          options={{
            title: "THE END",
            headerLeft: () => <BackButton />,
          }}
        />
      </Stack>
    </>
  );
}
