import { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { generateCataclysmicFuture } from "../services/anthropic";

const BG = "#4F4F4F";
const TEXT = "#E0E0E0";
const TEXT_DIM = "#A0A0A0";

export default function Story() {
  const params = useLocalSearchParams<{ headline: string }>();
  const headline = Array.isArray(params.headline)
    ? params.headline[0]
    : params.headline;
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
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: BG }}>
      <Text
        style={{
          fontSize: 18,
          fontWeight: "400",
          marginBottom: 16,
          color: TEXT,
        }}
      >
        {headline}
      </Text>

      {loading ? (
        <View style={{ alignItems: "center", marginTop: 32 }}>
          <ActivityIndicator size="large" color={TEXT_DIM} />
          <Text
            style={{ marginTop: 16, color: TEXT_DIM, fontWeight: "300" }}
          >
            Computing the end of civilization...
          </Text>
        </View>
      ) : error ? (
        <Text style={{ color: "#CF6679", fontWeight: "300" }}>{error}</Text>
      ) : (
        <Text
          style={{
            fontSize: 16,
            lineHeight: 26,
            color: TEXT,
            fontWeight: "300",
          }}
        >
          {story}
        </Text>
      )}
    </ScrollView>
  );
}
