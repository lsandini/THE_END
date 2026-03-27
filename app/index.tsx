import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { fetchHeadlines } from "../services/news";
import { getMostNegative, ScoredHeadline } from "../services/sentiment";

export default function Headlines() {
  const router = useRouter();
  const [headlines, setHeadlines] = useState<ScoredHeadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadHeadlines();
  }, [loadHeadlines]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Scanning for doom...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {error ? (
        <Text style={{ padding: 16, textAlign: "center" }}>{error}</Text>
      ) : null}
      {headlines.length === 0 && !error ? (
        <Text style={{ padding: 16, textAlign: "center" }}>
          No sufficiently negative headlines found. The world might be okay
          today.
        </Text>
      ) : null}
      <FlatList
        data={headlines}
        keyExtractor={(item) => `${item.source}:${item.title}`}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              router.push({ pathname: "/story", params: { headline: item.title } })
            }
            style={{
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: "#ccc",
            }}
          >
            <Text style={{ fontSize: 16 }}>{item.title}</Text>
            <Text style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
              {item.source} | Doom score: {item.score}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
