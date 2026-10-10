import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { AlertTriangle, ClipboardList, Gauge } from 'lucide-react-native';
import {
  BottomNav,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Header,
  Screen,
  Skeleton,
  StatusBadge,
  Text,
} from '../../../../components';
import { buildComponents, scoreBand } from '../../../../lib/score';
import { colors, radii, spacing } from '../../../../lib/theme';
import { getScore } from '../../../../services/score';
import { useAuth } from '../../../../store/auth';
import type { FarmScore } from '../../../../types/score';

type State =
  | { kind: 'loading' }
  | { kind: 'success'; score: FarmScore | null }
  | { kind: 'error'; message: string };

export default function ScoreScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const [state, setState] = useState<State>({ kind: 'loading' });
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setState({ kind: 'loading' });
    try {
      setState({ kind: 'success', score: await getScore(id, token) });
    } catch (error: unknown) {
      setState({
        kind: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Gagal memuat skor. Coba lagi.',
      });
    }
  }, [id, token]);

  useEffect(() => {
    void load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const score = state.kind === 'success' ? state.score : null;

  return (
    <Screen
      scroll
      bottomNav={<BottomNav />}
      header={
        <Header
          title="Skor Fulton (FSS)"
          subtitle="Farm Sustainability Score — 10 Indikator"
          showBack
        />
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => void onRefresh()}
          tintColor={colors.brand.forest600}
        />
      }
    >
      {state.kind === 'loading' ? <ScoreSkeleton /> : null}

      {state.kind === 'error' ? (
        <ErrorState message={state.message} onRetry={() => void load()} />
      ) : null}

      {state.kind === 'success' && score == null ? (
        <EmptyState
          icon={ClipboardList}
          title="Skor belum tersedia"
          description="Kirim data musim tanam terlebih dahulu agar skor keberlanjutan lahan bisa dihitung oleh sistem."
          actionLabel="Kirim Data Musim"
          onAction={() => router.push(`/farms/${id}/data/new`)}
        />
      ) : null}

      {state.kind === 'success' && score != null ? (
        <View style={styles.content}>
          {/* Hero Score Display Card */}
          <View style={styles.heroCard}>
            <View style={styles.heroTop}>
              <View style={styles.scoreNumberRow}>
                <Text variant="display" color={colors.brand.forest900} style={styles.bigScore}>
                  {score.fss_value}
                </Text>
                <Text variant="h2" color={colors.neutral.ink500} style={styles.maxScore}>
                  /100
                </Text>
              </View>
              <StatusBadge
                label={score.is_provisional ? 'Sementara' : 'Terverifikasi'}
                tone={score.is_provisional ? 'warning' : 'success'}
              />
            </View>

            <View style={styles.bandRow}>
              <View style={styles.bandBadge}>
                <Text variant="bodyMedium" color={colors.brand.forest700}>
                  Kategori: {scoreBand(score.fss_value)}
                </Text>
              </View>
            </View>

            {score.provisional_reason != null ? (
              <View style={styles.notice}>
                <AlertTriangle
                  size={16}
                  strokeWidth={2}
                  color={colors.semantic.warning}
                />
                <Text variant="caption" color={colors.neutral.ink700} style={styles.noticeText}>
                  {score.provisional_reason}
                </Text>
              </View>
            ) : null}
          </View>

          {/* 10 Breakdown Components */}
          <View style={styles.section}>
            <Text variant="h3" color={colors.neutral.ink900}>
              Rincian 10 Komponen Penilaian
            </Text>

            <Card style={styles.componentsCard}>
              {buildComponents(score).map((component, idx) => (
                <View key={component.key} style={[styles.componentRow, idx > 0 && styles.rowBorder]}>
                  <View style={styles.componentHeader}>
                    <Text variant="bodyMedium" color={colors.neutral.ink900}>
                      {component.label}
                    </Text>
                    <Text variant="caption" color={colors.brand.forest700} style={styles.scoreWeight}>
                      {component.score}/100 · {component.weightPercent}%
                    </Text>
                  </View>
                  <View style={styles.track}>
                    <View
                      style={[
                        styles.fill,
                        {
                          width: `${component.score}%`,
                          backgroundColor:
                            component.score >= 70
                              ? colors.brand.forest600
                              : component.score >= 40
                                ? colors.accent.harvest500
                                : colors.semantic.error,
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </Card>
          </View>

          <Button
            label="Lihat Riwayat Musim & Bukti"
            variant="secondary"
            onPress={() => router.push(`/farms/${id}/data`)}
          />
        </View>
      ) : null}
    </Screen>
  );
}

function ScoreSkeleton() {
  return (
    <View style={styles.content}>
      <Skeleton height={140} borderRadius={20} />
      <Skeleton height={260} borderRadius={20} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  heroCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.neutral.line,
    padding: spacing.lg,
    gap: spacing.sm,
    shadowColor: colors.brand.forest900,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreNumberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  bigScore: {
    fontSize: 48,
    fontWeight: '800',
  },
  maxScore: {
    fontSize: 20,
    fontWeight: '500',
  },
  bandRow: {
    flexDirection: 'row',
  },
  bandBadge: {
    backgroundColor: '#EBF3ED',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    backgroundColor: '#FFF9F0',
    borderWidth: 1,
    borderColor: '#FFE4B8',
    borderRadius: radii.md,
    padding: spacing.sm,
    marginTop: 4,
  },
  noticeText: {
    flex: 1,
  },
  section: {
    gap: spacing.sm,
  },
  componentsCard: {
    padding: spacing.md,
    gap: spacing.md,
  },
  componentRow: {
    gap: 6,
  },
  rowBorder: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F2F6F3',
  },
  componentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreWeight: {
    fontWeight: '600',
  },
  track: {
    height: 7,
    borderRadius: radii.pill,
    backgroundColor: '#EDF3EE',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radii.pill,
  },
});