import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { Award, Gift, Sparkles, TrendingUp } from 'lucide-react-native';
import {
  BottomNav,
  Card,
  EmptyState,
  ErrorState,
  Header,
  Screen,
  Skeleton,
  StatusBadge,
  Text,
} from '../../components';
import {
  formatRewardDate,
  nextTierProgress,
  rewardEventMeta,
  rewardTierMeta,
} from '../../lib/reward';
import { colors, radii, spacing } from '../../lib/theme';
import { getRewardsSummary } from '../../services/rewards';
import { useAuth } from '../../store/auth';
import type { RewardsSummary } from '../../types/reward';

type LoadState =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'success'; data: RewardsSummary };

export default function RewardsScreen() {
  const [state, setState] = useState<LoadState>({ kind: 'loading' });
  const [refreshing, setRefreshing] = useState(false);
  const { token } = useAuth();

  const load = useCallback(() => {
    if (!token) {
      setState({ kind: 'error', message: 'Token tidak tersedia' });
      return;
    }

    setState({ kind: 'loading' });

    getRewardsSummary(token)
      .then((data) => setState({ kind: 'success', data }))
      .catch((error: unknown) =>
        setState({
          kind: 'error',
          message:
            error instanceof Error ? error.message : 'Gagal memuat poin hadiah',
        }),
      );
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const progress =
    state.kind === 'success'
      ? nextTierProgress(state.data.total_points)
      : null;

  return (
    <Screen
      scroll
      bottomNav={<BottomNav />}
      header={
        <Header
          title="Katalog Hadiah"
          subtitle="Poin insentif & pencapaian tingkat petani"
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
      {state.kind === 'loading' ? (
        <View style={styles.list}>
          <Skeleton height={160} borderRadius={20} />
          <Skeleton height={80} borderRadius={18} />
          <Skeleton height={80} borderRadius={18} />
        </View>
      ) : null}

      {state.kind === 'error' ? (
        <ErrorState message={state.message} onRetry={load} />
      ) : null}

      {state.kind === 'success' ? (
        <View style={styles.content}>
          {/* Hero Tier Card */}
          <View style={styles.heroTierCard}>
            <View style={styles.tierTop}>
              <View>
                <Text variant="caption" color={colors.neutral.white} style={styles.tierSub}>
                  TOTAL POIN TERKUMPUL
                </Text>
                <Text variant="display" color={colors.neutral.white} style={styles.pointText}>
                  {state.data.total_points}
                </Text>
              </View>
              <View style={styles.tierBadgeWrap}>
                <Award size={20} color={colors.accent.harvest500} />
                <Text variant="bodyMedium" color={colors.neutral.white} style={styles.tierLabel}>
                  {rewardTierMeta(state.data.tier).label}
                </Text>
              </View>
            </View>

            <Text variant="caption" color="rgba(255,255,255,0.85)">
              {rewardTierMeta(state.data.tier).description}
            </Text>

            {/* Next Tier Progression */}
            {progress?.next && progress.remaining !== null ? (
              <View style={styles.progressWrap}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min(
                          100,
                          Math.max(
                            5,
                            (state.data.total_points /
                              (state.data.total_points + progress.remaining)) *
                              100,
                          ),
                        )}%`,
                      },
                    ]}
                  />
                </View>
                <Text variant="caption" color="rgba(255,255,255,0.9)">
                  Butuh {progress.remaining} poin lagi untuk naik ke tingkat {rewardTierMeta(progress.next).label}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Activity History */}
          <View style={styles.section}>
            <Text variant="h3" color={colors.neutral.ink900}>
              Riwayat Perolehan Poin
            </Text>

            {state.data.history.length === 0 ? (
              <EmptyState
                icon={Gift}
                title="Belum ada riwayat aktivitas"
                description="Kirim laporan data musim tanam atau catat praktik rendah emisi untuk mengumpulkan poin pertamamu."
              />
            ) : (
              <View style={styles.eventsList}>
                {state.data.history.map((event) => {
                  const eventLabel = rewardEventMeta(event.event_type);
                  return (
                    <View key={event.id} style={styles.eventCard}>
                      <View style={styles.eventIconWrap}>
                        <Sparkles size={18} color={colors.brand.forest700} />
                      </View>
                      <View style={styles.eventInfo}>
                        <Text variant="bodyMedium" color={colors.neutral.ink900}>
                          {eventLabel}
                        </Text>
                        <Text variant="caption" color={colors.neutral.ink500}>
                          {formatRewardDate(event.created_at)}
                          {event.description ? ` · ${event.description}` : ''}
                        </Text>
                      </View>
                      <View style={styles.pointsBadge}>
                        <Text variant="bodyMedium" color={colors.brand.forest700} style={styles.plusPoints}>
                          +{event.points}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  list: {
    gap: spacing.md,
  },
  heroTierCard: {
    backgroundColor: colors.brand.forest700,
    borderRadius: 24,
    padding: spacing.lg,
    gap: spacing.md,
    shadowColor: colors.brand.forest900,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
  },
  tierTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tierSub: {
    letterSpacing: 0.5,
  },
  pointText: {
    fontSize: 44,
    fontWeight: '800',
    lineHeight: 50,
  },
  tierBadgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
  },
  tierLabel: {
    fontWeight: '700',
  },
  progressWrap: {
    gap: 8,
    marginTop: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent.harvest500,
    borderRadius: radii.pill,
  },
  section: {
    gap: spacing.sm,
  },
  eventsList: {
    gap: spacing.sm,
  },
  eventCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.neutral.line,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    shadowColor: colors.brand.forest900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  eventIconWrap: {
    width: 38,
    height: 38,
    borderRadius: radii.pill,
    backgroundColor: '#E7F2EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventInfo: {
    flex: 1,
    gap: 2,
  },
  pointsBadge: {
    backgroundColor: '#EDF5EF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  plusPoints: {
    fontWeight: '700',
  },
});