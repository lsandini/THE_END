import { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { generateCataclysmicFuture } from "../services/anthropic";

export default function Story() {
  const params = useLocalSearchParams<{ headline: string }>();
  const headline = Array.isArray(params.headline) ? params.headline[0] : params.headline;
  const [story, setStory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!headline) return;

    generateCataclysmicFuture(headline)
      .then((text) => setStory(text))
      .catch((e) => setError(e.message || "Failed to generate story"))
      .finally(() => setLoading(false));
  }, [headline]);

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 16 }}>
        {headline}
      </Text>

      {loading ? (
        <View style={{ alignItems: "center", marginTop: 32 }}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 16 }}>
            Computing the end of civilization...
          </Text>
        </View>
      ) : error ? (
        <Text style={{ color: "red" }}>{error}</Text>
      ) : (
        <Text style={{ fontSize: 16, lineHeight: 24 }}>{story}</Text>
      )}
    </ScrollView>
  );
}
