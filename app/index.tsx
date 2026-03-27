import { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { fetchHeadlines } from "../services/news";
import { getMostNegative, ScoredHeadline } from "../services/sentiment";

const BG = "#F4F4F4";
const TEXT = "#2A2A2A";
const TEXT_DIM = "#6B6B6B";
const BORDER = "#D8D8D8";

export default function Headlines() {
  const router = useRouter();
  const [headlines, setHeadlines] = useState<ScoredHeadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const loadHeadlines = useCallback(async () => {
    try {
      setError(null);
      const allHeadlines = await fetchHeadlines();
      const topNegative = getMostNegative(allHeadlines, 6);
      setHeadlines(topNegative);
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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadHeadlines();
  }, [loadHeadlines]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: BG,
        }}
      >
        <ActivityIndicator size="large" color={TEXT_DIM} />
        <Text style={{ marginTop: 16, color: TEXT_DIM, fontWeight: "300" }}>
          Scanning for doom...
        </Text>
      </View>
    );
  }

  return (
    <Animated.View style={{ flex: 1, backgroundColor: BG, opacity: fadeAnim }}>
      {error ? (
        <Text
          style={{
            padding: 16,
            textAlign: "center",
            color: TEXT_DIM,
            fontWeight: "300",
          }}
        >
          {error}
        </Text>
      ) : null}
      {headlines.length === 0 && !error ? (
        <Text
          style={{
            padding: 16,
            textAlign: "center",
            color: TEXT_DIM,
            fontWeight: "300",
          }}
        >
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
            tintColor={TEXT_DIM}
            colors={[TEXT_DIM]}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
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
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: BORDER,
            }}
          >
            <Text style={{ fontSize: 16, color: TEXT, fontWeight: "300" }}>
              {item.title}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: TEXT_DIM,
                marginTop: 4,
                fontWeight: "300",
              }}
            >
              {item.source} | Doom score: {item.score}
            </Text>
          </TouchableOpacity>
        )}
      />
    </Animated.View>
  );
}
