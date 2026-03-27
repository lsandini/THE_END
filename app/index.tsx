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

const BG = "#4F4F4F";
const TEXT = "#E0E0E0";
const TEXT_DIM = "#A0A0A0";
const BORDER = "#5E5E5E";

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
    <View style={{ flex: 1, backgroundColor: BG }}>
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
                params: { headline: item.title },
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
    </View>
  );
}
