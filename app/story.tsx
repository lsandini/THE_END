import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  Platform,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { generateCataclysmicFuture } from "../services/anthropic";
import { C, T, glow, textGlow } from "../theme";

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
  const buttonPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(contentFade, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }, 400);
    return () => clearTimeout(timer);
  }, [contentFade]);

  // subtle button pulse
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(buttonPulse, {
          toValue: 0.85,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(buttonPulse, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [buttonPulse]);

  useEffect(() => {
    if (story || error) {
      storyFade.setValue(0);
      const timer = setTimeout(() => {
        Animated.timing(storyFade, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }).start();
      }, 300);
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
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{
        padding: 20,
        paddingBottom: 60,
        maxWidth: 640,
        width: "100%",
        alignSelf: "center" as any,
      }}
    >
      <Animated.View style={{ opacity: contentFade }}>
        <Text style={{ ...T.title, marginBottom: 10 }}>{headline}</Text>

        {source ? (
          <Text style={{ ...T.caption, marginBottom: 20 }}>{source}</Text>
        ) : null}

        {description ? (
          <Text
            style={{
              ...T.body,
              color: C.textDim,
              marginBottom: 32,
            }}
          >
            {description}
          </Text>
        ) : null}

        {!story && !loading && !error ? (
          <Animated.View style={{ alignSelf: "center", opacity: buttonPulse }}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleGenerate}
              style={{
                backgroundColor: C.surface,
                borderWidth: 1,
                borderColor: C.accent + "50",
                paddingVertical: 16,
                paddingHorizontal: 36,
                borderRadius: 2,
                ...glow(C.accent + "30", 16),
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "400",
                  color: C.accent,
                  textAlign: "center",
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  ...textGlow(C.accent + "50", 8),
                }}
              >
                How it all ends
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ) : null}

        {loading ? (
          <View style={{ alignItems: "center", marginTop: 32 }}>
            <ActivityIndicator size="large" color={C.accent} />
            <Text
              style={{
                marginTop: 20,
                ...T.caption,
                ...textGlow(C.accent + "40", 10),
              }}
            >
              Computing the end of civilization...
            </Text>
          </View>
        ) : null}
      </Animated.View>

      {error ? (
        <Animated.Text
          style={{
            ...T.body,
            color: C.error,
            marginTop: 24,
            opacity: storyFade,
          }}
        >
          {error}
        </Animated.Text>
      ) : null}

      {story ? (
        <Animated.View style={{ opacity: storyFade }}>
          {/* Divider */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 36,
              marginBottom: 28,
              gap: 12,
            }}
          >
            <View
              style={{
                flex: 1,
                height: 1,
                backgroundColor: C.accent + "30",
              }}
            />
            <Text
              style={{
                fontSize: 10,
                fontWeight: "400",
                color: C.accent + "80",
                letterSpacing: 3,
                ...textGlow(C.accent + "40", 6),
              }}
            >
              THE END BEGINS
            </Text>
            <View
              style={{
                flex: 1,
                height: 1,
                backgroundColor: C.accent + "30",
              }}
            />
          </View>

          <Text style={{ ...T.body, lineHeight: 28 }}>{story}</Text>
        </Animated.View>
      ) : null}
    </ScrollView>
  );
}
