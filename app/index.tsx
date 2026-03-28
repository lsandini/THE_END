import { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Animated,
} from "react-native";
import { useRouter, useNavigation } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { fetchHeadlines } from "../services/news";
import { getMostNegative, ScoredHeadline } from "../services/sentiment";
import { C, T, doomColor, glow, glowIntense, textGlow, textGlowIntense } from "../theme";
import BurningSkyline from "../components/BurningSkyline";

const INTRO_PHRASES = [
  "THE END",
  "The world is on fire",
  "Only you can put it out of its misery",
  "Pick any news headline,\nyou know what to do next ...",
];

const PHASE_FADE_IN = 1200;
const PHASE_HOLD = 2000;
const PHASE_FADE_OUT = 900;
const PHASE_GAP = 500;

export default function Headlines() {
  const router = useRouter();
  const navigation = useNavigation();
  const [headlines, setHeadlines] = useState<ScoredHeadline[]>([]);
  const [introComplete, setIntroComplete] = useState(false);
  const [introPhraseDone, setIntroPhraseDone] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const introFade = useRef(new Animated.Value(0)).current;
  const introPulse = useRef(new Animated.Value(1)).current;
  const buttonFade = useRef(new Animated.Value(0)).current;
  const buttonPulse = useRef(new Animated.Value(1)).current;
  const [introIndex, setIntroIndex] = useState(0);
  const listFade = useRef(new Animated.Value(0)).current;
  const itemAnims = useRef<Animated.Value[]>([]).current;

  // fetch headlines immediately (runs during intro)
  const loadHeadlines = useCallback(async () => {
    try {
      setError(null);
      const allHeadlines = await fetchHeadlines();
      const topNegative = getMostNegative(allHeadlines, 6);
      setHeadlines(topNegative);
      itemAnims.length = 0;
      topNegative.forEach(() => itemAnims.push(new Animated.Value(0)));
      setDataReady(true);
    } catch (e) {
      setError("Failed to fetch headlines. Pull to retry.");
      setDataReady(true);
    }
  }, []);

  useEffect(() => {
    loadHeadlines();
  }, [loadHeadlines]);

  // intro pulse
  useEffect(() => {
    if (introComplete) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(introPulse, {
          toValue: 0.7,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(introPulse, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [introComplete]);

  // intro sequence
  useEffect(() => {
    if (introComplete) return;

    const runPhrase = (index: number) => {
      if (index >= INTRO_PHRASES.length) {
        setIntroPhraseDone(true);
        return;
      }
      setIntroIndex(index);
      introFade.setValue(0);

      Animated.sequence([
        Animated.timing(introFade, {
          toValue: 1,
          duration: PHASE_FADE_IN,
          useNativeDriver: true,
        }),
        Animated.delay(PHASE_HOLD),
        Animated.timing(introFade, {
          toValue: 0,
          duration: PHASE_FADE_OUT,
          useNativeDriver: true,
        }),
        Animated.delay(PHASE_GAP),
      ]).start(() => runPhrase(index + 1));
    };

    const timer = setTimeout(() => runPhrase(0), 500);
    return () => clearTimeout(timer);
  }, []);

  // show button after phrases finish
  useEffect(() => {
    if (!introPhraseDone) return;
    Animated.timing(buttonFade, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

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
  }, [introPhraseDone]);

  // transition to headlines once intro is done AND data is ready
  const showHeadlines = introComplete && dataReady;

  // toggle header: hidden during intro, back button during headlines
  useEffect(() => {
    if (!showHeadlines) {
      navigation.setOptions({ headerShown: false });
    } else {
      navigation.setOptions({
        headerShown: true,
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => {
              setIntroComplete(false);
              setIntroPhraseDone(true);
            }}
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
        ),
      });
    }
  }, [showHeadlines]);

  useEffect(() => {
    if (showHeadlines) {
      listFade.setValue(0);
      Animated.timing(listFade, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();

      // stagger items
      if (itemAnims.length > 0) {
        const anims = itemAnims.map((anim, i) =>
          Animated.timing(anim, {
            toValue: 1,
            duration: 500,
            delay: i * 120,
            useNativeDriver: true,
          })
        );
        Animated.parallel(anims).start();
      }
    }
  }, [showHeadlines]);

  // re-fade on focus (back navigation)
  useFocusEffect(
    useCallback(() => {
      if (showHeadlines) {
        listFade.setValue(0);
        const timer = setTimeout(() => {
          Animated.timing(listFade, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }).start();
        }, 300);
        return () => clearTimeout(timer);
      }
    }, [showHeadlines])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHeadlines()
      .then((allHeadlines) => {
        const topNegative = getMostNegative(allHeadlines, 6);
        setHeadlines(topNegative);
        itemAnims.length = 0;
        topNegative.forEach(() => itemAnims.push(new Animated.Value(0)));
        const anims = itemAnims.map((anim, i) =>
          Animated.timing(anim, {
            toValue: 1,
            duration: 500,
            delay: i * 120,
            useNativeDriver: true,
          })
        );
        Animated.parallel(anims).start();
      })
      .catch(() => setError("Failed to fetch headlines. Pull to retry."))
      .finally(() => setRefreshing(false));
  }, []);

  // --- Intro screen ---
  if (!showHeadlines) {
    const isTitle = introIndex === 0;
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: C.bg,
          justifyContent: "center",
          alignItems: "center",
          padding: 32,
        }}
      >
        {/* Phrases */}
        {!introPhraseDone ? (
          <Animated.View
            style={{
              opacity: Animated.multiply(introFade, introPulse),
              ...(isTitle ? glowIntense(C.accent + "70") : {}),
              ...(isTitle
                ? {
                    borderWidth: 1,
                    borderColor: C.accent + "90",
                    backgroundColor: C.surface,
                    paddingVertical: 20,
                    paddingHorizontal: 40,
                    borderRadius: 2,
                  }
                : {}),
            }}
          >
            <Text
              style={{
                textAlign: "center",
                color: isTitle ? C.accentHi : C.textWarm,
                fontSize: isTitle ? 28 : 18,
                fontWeight: isTitle ? "600" : "300",
                letterSpacing: isTitle ? 6 : 1.5,
                lineHeight: isTitle ? 36 : 28,
                ...(isTitle
                  ? textGlowIntense(C.accentHi + "AA")
                  : textGlowIntense("#C4302B50")),
              }}
            >
              {INTRO_PHRASES[introIndex]}
            </Text>
          </Animated.View>
        ) : null}

        {/* Enter button */}
        {introPhraseDone ? (
          <Animated.View
            style={{
              opacity: Animated.multiply(buttonFade, buttonPulse),
            }}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIntroComplete(true)}
              style={{
                backgroundColor: C.surface,
                borderWidth: 1,
                borderColor: C.accent + "90",
                paddingVertical: 18,
                paddingHorizontal: 44,
                borderRadius: 2,
                ...glowIntense(C.accent + "70"),
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: C.accentHi,
                  textAlign: "center",
                  letterSpacing: 2.5,
                  textTransform: "uppercase",
                  ...textGlowIntense(C.accentHi + "AA"),
                }}
              >
                See what's happening in the world right now...
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ) : null}

        <BurningSkyline />
      </View>
    );
  }

  // --- Headlines screen ---
  const renderItem = ({
    item,
    index,
  }: {
    item: ScoredHeadline;
    index: number;
  }) => {
    const color = doomColor(item.score);
    const anim = itemAnims[index];
    const opacity = anim || new Animated.Value(1);
    const translateY = anim
      ? anim.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        })
      : 0;

    return (
      <Animated.View
        style={{
          opacity,
          transform: [{ translateY: translateY as any }],
        }}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() =>
            router.push({
              pathname: "/story",
              params: {
                headline: item.title,
                description: item.description,
                source: item.source,
              },
            })
          }
          style={{
            paddingVertical: 16,
            paddingHorizontal: 20,
            marginHorizontal: 12,
            marginVertical: 6,
            backgroundColor: C.surface,
            borderWidth: 1,
            borderColor: C.border,
            borderRadius: 2,
          }}
        >
          <Text style={{ ...T.headline, lineHeight: 22 }}>
            {item.title}
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 10,
              gap: 10,
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: "300",
                color: C.textDim,
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              {item.source}
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
              }}
            >
              <View
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 3,
                  backgroundColor: color,
                  ...glow(color + "99", 8),
                }}
              />
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "500",
                  color: color,
                  letterSpacing: 0.8,
                  ...textGlow(color + "60", 6),
                }}
              >
                {Math.abs(item.score).toFixed(0)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <Animated.View style={{ flex: 1, backgroundColor: C.bg, opacity: listFade }}>
      {error ? (
        <Text style={{ padding: 20, textAlign: "center", ...T.caption, color: C.error }}>
          {error}
        </Text>
      ) : null}

      {headlines.length === 0 && !error ? (
        <Text style={{ padding: 20, textAlign: "center", ...T.caption }}>
          No sufficiently negative headlines found. The world might be okay
          today.
        </Text>
      ) : null}

      <FlatList
        data={headlines}
        keyExtractor={(item) => `${item.source}:${item.title}`}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.textDim}
            colors={[C.accent]}
            progressBackgroundColor={C.surface}
          />
        }
        renderItem={renderItem}
        contentContainerStyle={{
          paddingTop: 8,
          paddingBottom: 160,
          maxWidth: 640,
          width: "100%",
          alignSelf: "center" as any,
        }}
      />

      <BurningSkyline />
    </Animated.View>
  );
}
