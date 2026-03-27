import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function Story() {
  const { headline } = useLocalSearchParams<{ headline: string }>();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>{headline}</Text>
    </View>
  );
}
