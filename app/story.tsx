import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { generateCataclysmicFuture } from "../services/anthropic";

const BG = "#F4F4F4";
const TEXT = "#2A2A2A";
const TEXT_DIM = "#6B6B6B";
const BORDER = "#D8D8D8";

export default function Story() {
  const params = useLocalSearchParams<{
    headline: string;
    description: string;
    source: string;
  }>();
  const headline = Array.isArray(params.headline)
    ? params.headline[0]
    : params.headline;
  const description = Array.isArray(params.description)
    ? params.description[0]
    : params.description;
  const source = Array.isArray(params.source)
    ? params.source[0]
    : params.source;

  const [story, setStory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contentFade = useRef(new Animated.Value(0)).current;
  const storyFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(contentFade, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }).start();
    }, 1000);
    return () => clearTimeout(timer);
  }, [contentFade]);

  useEffect(() => {
    if (story || error) {
      const timer = setTimeout(() => {
        Animated.timing(storyFade, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }).start();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [story, error, storyFade]);

  const handleGenerate = () => {
    if (!headline) return;
    setLoading(true);
    setError(null);
    generateCataclysmicFuture(headline)
      .then((text) => setStory(text))
      .catch((e) => setError(e.message || "Failed to generate story"))
      .finally(() => setLoading(false));
  };

  return (
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: BG }}>
      <Animated.View style={{ opacity: contentFade }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "400",
            color: TEXT,
            marginBottom: 8,
          }}
        >
          {headline}
        </Text>

        {source ? (
          <Text
            style={{
              fontSize: 12,
              color: TEXT_DIM,
              fontWeight: "300",
              marginBottom: 16,
            }}
          >
            {source}
          </Text>
        ) : null}

        {description ? (
          <Text
            style={{
              fontSize: 15,
              lineHeight: 24,
              color: TEXT,
              fontWeight: "300",
              marginBottom: 24,
            }}
          >
            {description}
          </Text>
        ) : null}

        {!story && !loading && !error ? (
          <TouchableOpacity
            onPress={handleGenerate}
            style={{
              borderWidth: 1,
              borderColor: BORDER,
              paddingVertical: 14,
              paddingHorizontal: 24,
              alignSelf: "center",
              marginTop: 8,
            }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: "300",
                color: TEXT,
                textAlign: "center",
              }}
            >
              How it all ends
            </Text>
          </TouchableOpacity>
        ) : null}

        {loading ? (
          <View style={{ alignItems: "center", marginTop: 24 }}>
            <ActivityIndicator size="large" color={TEXT_DIM} />
            <Text
              style={{ marginTop: 16, color: TEXT_DIM, fontWeight: "300" }}
            >
              Computing the end of civilization...
            </Text>
          </View>
        ) : null}
      </Animated.View>

      {error ? (
        <Animated.Text
          style={{
            color: "#B00020",
            fontWeight: "300",
            marginTop: 24,
            opacity: storyFade,
          }}
        >
          {error}
        </Animated.Text>
      ) : null}

      {story ? (
        <Animated.Text
          style={{
            fontSize: 16,
            lineHeight: 26,
            color: TEXT,
            fontWeight: "300",
            marginTop: 24,
            paddingBottom: 48,
            opacity: storyFade,
          }}
        >
          {story}
        </Animated.Text>
      ) : null}
    </ScrollView>
  );
}
