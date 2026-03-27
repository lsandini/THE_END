import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { generateCataclysmicFuture } from "../services/anthropic";

const BG = "#F4F4F4";
const TEXT = "#2A2A2A";
const TEXT_DIM = "#6B6B6B";

export default function Story() {
  const params = useLocalSearchParams<{ headline: string }>();
  const headline = Array.isArray(params.headline)
    ? params.headline[0]
    : params.headline;
  const [story, setStory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!headline) return;

    generateCataclysmicFuture(headline)
      .then((text) => setStory(text))
      .catch((e) => setError(e.message || "Failed to generate story"))
      .finally(() => setLoading(false));
  }, [headline]);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }).start();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, fadeAnim]);

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
          <Text style={{ marginTop: 16, color: TEXT_DIM, fontWeight: "300" }}>
            Computing the end of civilization...
          </Text>
        </View>
      ) : error ? (
        <Animated.Text
          style={{ color: "#B00020", fontWeight: "300", opacity: fadeAnim }}
        >
          {error}
        </Animated.Text>
      ) : (
        <Animated.Text
          style={{
            fontSize: 16,
            lineHeight: 26,
            color: TEXT,
            fontWeight: "300",
            opacity: fadeAnim,
          }}
        >
          {story}
        </Animated.Text>
      )}
    </ScrollView>
  );
}
