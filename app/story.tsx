import { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  Platform,
  PanResponder,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { generateCataclysmicFuture } from "../services/anthropic";
import { C, T, glowIntense, textGlow, textGlowIntense } from "../theme";
import BurningSkyline from "../components/BurningSkyline";

const SWIPE_THRESHOLD = 40;

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
  const [paragraphs, setParagraphs] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1); // -1 = not started
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const endButtonFade = useRef(new Animated.Value(0)).current;
  const endButtonPulse = useRef(new Animated.Value(1)).current;

  const contentFade = useRef(new Animated.Value(0)).current;
  const buttonPulse = useRef(new Animated.Value(1)).current;
  const hintPulse = useRef(new Animated.Value(1)).current;
  const paragraphFade = useRef(new Animated.Value(0)).current;
  const paragraphSlide = useRef(new Animated.Value(0)).current;
  const isTransitioning = useRef(false);

  const isWeb = Platform.OS === "web";
  const storyStarted = currentIndex >= 0;
  const allRevealed = currentIndex >= paragraphs.length - 1 && paragraphs.length > 0;

  // refs for stable access in callbacks
  const currentIndexRef = useRef(currentIndex);
  const paragraphsRef = useRef(paragraphs);
  currentIndexRef.current = currentIndex;
  paragraphsRef.current = paragraphs;

  // split story into paragraphs
  useEffect(() => {
    if (story) {
      let parts = story
        .split(/\n\n+/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0);
      // skip a title-like first line (short, no period)
      if (parts.length > 1 && parts[0].length < 80 && !parts[0].includes(".")) {
        parts = parts.slice(1);
      }
      setParagraphs(parts);
    }
  }, [story]);

  // reveal first paragraph once paragraphs are ready
  useEffect(() => {
    if (paragraphs.length > 0 && currentIndex === -1) {
      const timer = setTimeout(() => showParagraph(0), 600);
      return () => clearTimeout(timer);
    }
  }, [paragraphs]);

  const showParagraph = (index: number) => {
    paragraphFade.setValue(0);
    paragraphSlide.setValue(16);
    setCurrentIndex(index);
    Animated.parallel([
      Animated.timing(paragraphFade, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(paragraphSlide, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const advance = useCallback(() => {
    if (isTransitioning.current) return;
    const ci = currentIndexRef.current;
    const pars = paragraphsRef.current;
    if (ci >= pars.length - 1) return;

    isTransitioning.current = true;

    // fade out current
    Animated.timing(paragraphFade, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      // fade in next
      showParagraph(ci + 1);
      isTransitioning.current = false;
    });
  }, []);

  // end button animation
  useEffect(() => {
    if (!allRevealed) return;
    Animated.timing(endButtonFade, {
      toValue: 1,
      duration: 1000,
      delay: 500,
      useNativeDriver: true,
    }).start();

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(endButtonPulse, {
          toValue: 0.85,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(endButtonPulse, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [allRevealed]);

  // content fade on mount
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

  // button pulse
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

  // hint pulse
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(hintPulse, {
          toValue: 0.3,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(hintPulse, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [hintPulse]);

  // keyboard listener for web
  useEffect(() => {
    if (!isWeb) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "ArrowDown" || e.key === "Enter") {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [advance]);

  // web: wheel scroll to advance
  useEffect(() => {
    if (!isWeb) return;
    let cooldown = false;
    const handler = (e: WheelEvent) => {
      if (
        currentIndexRef.current < 0 ||
        currentIndexRef.current >= paragraphsRef.current.length - 1
      )
        return;
      if (e.deltaY > 30 && !cooldown) {
        e.preventDefault();
        cooldown = true;
        advance();
        setTimeout(() => {
          cooldown = false;
        }, 600);
      }
    };
    window.addEventListener("wheel", handler, { passive: false });
    return () => window.removeEventListener("wheel", handler);
  }, [advance]);

  // pan responder for native swipe
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dy) > SWIPE_THRESHOLD,
      onPanResponderRelease: (_, gs) => {
        if (gs.dy < -SWIPE_THRESHOLD) {
          advance();
        }
      },
    })
  ).current;

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
    <View
      style={{
        flex: 1,
        backgroundColor: C.bg,
        padding: 20,
      }}
      {...(storyStarted && !isWeb ? panResponder.panHandlers : {})}
    >
      <View
        style={{
          maxWidth: 640,
          width: "100%",
          alignSelf: "center",
          flex: 1,
        }}
      >
        {!storyStarted ? (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View style={{ opacity: contentFade }}>
              <Text style={{ ...T.title, color: C.textWarm, marginBottom: 10 }}>{headline}</Text>

              {source ? (
                <Text style={{ ...T.caption, marginBottom: 16 }}>{source}</Text>
              ) : null}

              {description ? (
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "300",
                    color: C.textDim,
                    lineHeight: 20,
                    letterSpacing: 0.15,
                    marginBottom: 28,
                  }}
                >
                  {description}
                </Text>
              ) : null}

              {/* Button / Loading — fixed-height container */}
              {!story && !error ? (
                <View style={{ alignItems: "center", justifyContent: "center", height: 80, marginTop: 40, marginBottom: 80 }}>
                  {!loading ? (
                    <Animated.View style={{ opacity: buttonPulse }}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={handleGenerate}
                        style={{
                          backgroundColor: C.surface,
                          borderWidth: 1,
                          borderColor: C.accent + "90",
                          paddingVertical: 16,
                          paddingHorizontal: 36,
                          borderRadius: 2,
                          ...glowIntense(C.accent + "70"),
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color: C.accentHi,
                            textAlign: "center",
                            letterSpacing: 2,
                            textTransform: "uppercase",
                            ...textGlowIntense(C.accentHi + "AA"),
                          }}
                        >
                          Make it all end
                        </Text>
                      </TouchableOpacity>
                    </Animated.View>
                  ) : (
                    <View style={{ alignItems: "center" }}>
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
                  )}
                </View>
              ) : null}

              {/* Error */}
              {error ? (
                <Text style={{ ...T.body, color: C.error, marginTop: 24 }}>
                  {error}
                </Text>
              ) : null}
            </Animated.View>
          </ScrollView>
        ) : null}

        {/* Current paragraph */}
        {storyStarted ? (
          <View style={{ flex: 1 }}>
            {/* Divider */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 8,
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

            {/* Single paragraph */}
            <Animated.View
              style={{
                opacity: paragraphFade,
                transform: [{ translateY: paragraphSlide }],
              }}
            >
              <Text style={{ ...T.body, lineHeight: 28 }}>
                {paragraphs[currentIndex]}
              </Text>
            </Animated.View>

            {/* Hint or end marker */}
            <View style={{ alignItems: "center", marginTop: 32 }}>
              {!allRevealed ? (
                <Animated.View
                  style={{ opacity: hintPulse, alignItems: "center" }}
                >
                  <Text style={{ fontSize: 18, color: C.textDim, marginBottom: 4 }}>
                    ↑
                  </Text>
                  <Text style={{ ...T.caption, fontSize: 10, letterSpacing: 2 }}>
                    {isWeb ? "scroll or press space" : "swipe up to continue"}
                  </Text>
                </Animated.View>
              ) : (
                <Animated.View
                  style={{
                    opacity: Animated.multiply(endButtonFade, endButtonPulse),
                  }}
                >
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => router.back()}
                    style={{
                      backgroundColor: C.surface,
                      borderWidth: 1,
                      borderColor: C.accent + "90",
                      paddingVertical: 14,
                      paddingHorizontal: 32,
                      borderRadius: 2,
                      ...glowIntense(C.accent + "70"),
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        color: C.accentHi,
                        textAlign: "center",
                        letterSpacing: 2,
                        textTransform: "uppercase",
                        ...textGlowIntense(C.accentHi + "AA"),
                      }}
                    >
                      Find another way to end it all
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </View>
          </View>
        ) : null}
      </View>

      <BurningSkyline />
    </View>
  );
}
