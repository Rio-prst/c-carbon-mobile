import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { ChevronRight, Info, Leaf, Sprout } from 'lucide-react-native';
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
} from '../../../components';
import {
  PROVISIONAL_NOTICE,
  formatArea,
  formatProjectDate,
  projectStatusMeta,
} from '../../../lib/carbon-project';
import { colors, radii, spacing } from '../../../lib/theme';
import { listProjects } from '../../../services/carbon-project';
import { useAuth } from '../../../store/auth';
import type { ProjectSummary } from '../../../types/carbon-project';

export default function CarbonProjectsScreen() {
  const { token } = useAuth();

  const [projects, setProjects] = useState<ProjectSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setError(null);
    try {
      setProjects(await listProjects(token));
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Gagal memuat proyek karbon. Coba lagi.',
      );
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return (
    <Screen
      scroll
      bottomNav={<BottomNav />}
      header={
        <Header
          title="Proyek Karbon"
          subtitle="Katalog kandidat proyek agregasi pertanian"
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
      {/* Notice Banner */}
      <View style={styles.noticeBanner}>
        <Info size={16} color={colors.brand.forest700} />
        <Text variant="caption" color={colors.neutral.ink700} style={styles.noticeText}>
          {PROVISIONAL_NOTICE}
        </Text>
      </View>

      {error != null ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : null}

      {projects == null && error == null ? (
        <View style={styles.list}>
          <Skeleton height={140} borderRadius={20} />
          <Skeleton height={140} borderRadius={20} />
        </View>
      ) : null}

      {projects != null && projects.length === 0 ? (
        <EmptyState
          icon={Sprout}
          title="Belum ada proyek kandidat"
          description="Saat ini belum ada proyek karbon agregasi aktif. Lahan yang memenuhi kriteria CRS akan dimasukkan secara otomatis."
        />
      ) : null}

      <View style={styles.list}>
        {projects?.map((project) => {
          const status = projectStatusMeta(project.status);

          return (
            <Pressable
              key={project.id}
              onPress={() => router.push(`/carbon/${project.id}`)}
              style={({ pressed }) => [styles.projectCard, pressed && styles.pressed]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.iconAndTitle}>
                  <View style={styles.leafIconWrap}>
                    <Leaf size={18} color={colors.brand.forest700} />
                  </View>
                  <View style={styles.titleWrap}>
                    <Text variant="h3" color={colors.neutral.ink900} numberOfLines={1}>
                      {project.name}
                    </Text>
                    <Text variant="caption" color={colors.neutral.ink500}>
                      {project.region} · {formatProjectDate(project.created_at)}
                    </Text>
                  </View>
                </View>
                <StatusBadge label={status.label} tone={status.tone} />
              </View>

              <View style={styles.cardMetrics}>
                <View style={styles.metricItem}>
                  <Text variant="caption" color={colors.neutral.ink500}>
                    LUAS AGREGAT
                  </Text>
                  <Text variant="bodyMedium" color={colors.neutral.ink900}>
                    {formatArea(project.total_area_ha)}
                  </Text>
                </View>

                <View style={styles.metricItem}>
                  <Text variant="caption" color={colors.neutral.ink500}>
                    LAHAN TERGABUNG
                  </Text>
                  <Text variant="bodyMedium" color={colors.neutral.ink900}>
                    {project.total_farms} Lahan
                  </Text>
                </View>

                <View style={styles.metricItem}>
                  <Text variant="caption" color={colors.neutral.ink500}>
                    KOMODITAS
                  </Text>
                  <Text variant="bodyMedium" color={colors.neutral.ink900}>
                    {project.commodity_focus}
                  </Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <Text variant="caption" color={colors.brand.forest700} style={styles.detailLink}>
                  Evaluasi Detail Proyek
                </Text>
                <ChevronRight size={16} color={colors.brand.forest700} />
              </View>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: '#EBF4EE',
    borderWidth: 1,
    borderColor: '#D4E8DC',
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  noticeText: {
    flex: 1,
    lineHeight: 18,
  },
  list: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  projectCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.neutral.line,
    padding: spacing.lg,
    gap: spacing.md,
    shadowColor: colors.brand.forest900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  iconAndTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  leafIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: '#E7F2EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: {
    flex: 1,
    gap: 2,
  },
  cardMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F7FAF8',
    borderRadius: 14,
    padding: spacing.md,
  },
  metricItem: {
    gap: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  detailLink: {
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
});