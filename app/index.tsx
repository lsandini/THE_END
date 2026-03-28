import { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { fetchHeadlines } from "../services/news";
import { getMostNegative, ScoredHeadline } from "../services/sentiment";
import { C, T, doomColor, glow, textGlow } from "../theme";

export default function Headlines() {
  const router = useRouter();
  const [headlines, setHeadlines] = useState<ScoredHeadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const itemAnims = useRef<Animated.Value[]>([]).current;

  const loadHeadlines = useCallback(async () => {
    try {
      setError(null);
      const allHeadlines = await fetchHeadlines();
      const topNegative = getMostNegative(allHeadlines, 6);
      setHeadlines(topNegative);

      // reset item anims
      itemAnims.length = 0;
      topNegative.forEach(() => itemAnims.push(new Animated.Value(0)));
    } catch (e) {
      setError("Failed to fetch headlines. Pull to retry.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadHeadlines();
  }, [loadHeadlines]);

  // stagger items in after data loads
  useEffect(() => {
    if (headlines.length > 0 && itemAnims.length > 0) {
      const anims = itemAnims.map((anim, i) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 500,
          delay: i * 120,
          useNativeDriver: true,
        })
      );
      Animated.stagger(0, anims).start();
    }
  }, [headlines]);

  useFocusEffect(
    useCallback(() => {
      fadeAnim.setValue(0);
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();
      }, 300);
      return () => clearTimeout(timer);
    }, [fadeAnim])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadHeadlines();
  }, [loadHeadlines]);

  if (loading) {
    return (
      <Animated.View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: C.bg,
          opacity: fadeAnim,
        }}
      >
        <ActivityIndicator size="large" color={C.accent} />
        <Text
          style={{
            marginTop: 20,
            ...T.caption,
            ...textGlow(C.accent + "40", 10),
          }}
        >
          Scanning for doom...
        </Text>
      </Animated.View>
    );
  }

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
            paddingVertical: 18,
            paddingHorizontal: 20,
            borderBottomWidth: 1,
            borderBottomColor: C.border,
          }}
        >
          <Text style={T.headline}>{item.title}</Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 10,
              gap: 12,
            }}
          >
            <Text style={T.caption}>{item.source}</Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: color,
                  ...glow(color + "99", 8),
                }}
              />
              <Text
                style={{
                  fontSize: 11,
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
    <Animated.View style={{ flex: 1, backgroundColor: C.bg, opacity: fadeAnim }}>
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
          paddingTop: 4,
          maxWidth: 640,
          width: "100%",
          alignSelf: "center" as any,
        }}
      />
    </Animated.View>
  );
}
