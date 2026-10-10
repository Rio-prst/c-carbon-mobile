import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import {
  AlertTriangle,
  Building2,
  ChevronRight,
  Info,
  Layers,
  Leaf,
} from 'lucide-react-native';
import {
  BottomNav,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Header,
  Screen,
  Skeleton,
  Text,
} from '../../../components';
import {
  CORPORATE_DISCLAIMER,
  overviewStats,
  statusBreakdownLabel,
} from '../../../lib/corporate';
import { colors, radii, spacing } from '../../../lib/theme';
import { getCorporateOverview } from '../../../services/corporate';
import { useAuth } from '../../../store/auth';
import type { CorporateOverview } from '../../../types/corporate';

export default function CorporateOverviewScreen() {
  const { token, user } = useAuth();

  const [overview, setOverview] = useState<CorporateOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setError(null);
    try {
      setOverview(await getCorporateOverview(token));
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Gagal memuat ringkasan. Coba lagi.',
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

  if (user?.role !== 'CORPORATE') {
    return (
      <Screen>
        <EmptyState
          icon={AlertTriangle}
          title="Akses khusus korporat"
          description="Halaman ini hanya dapat diakses oleh akun pembeli / mitra korporat."
          actionLabel="Kembali ke Beranda"
          onAction={() => router.replace('/')}
        />
      </Screen>
    );
  }

  const stats = overview == null ? [] : overviewStats(overview);

  return (
    <Screen
      scroll
      bottomNav={<BottomNav />}
      header={
        <Header
          title="Portofolio Korporat"
          subtitle="Ringkasan agregat proyek karbon & kepatuhan ESG"
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
      {error != null ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : null}

      {overview == null && error == null ? (
        <View style={styles.skeletonGroup}>
          <Skeleton height={100} borderRadius={20} />
          <Skeleton height={200} borderRadius={20} />
        </View>
      ) : null}

      {overview != null ? (
        <View style={styles.content}>
          {/* Company Card */}
          <View style={styles.companyCard}>
            <View style={styles.companyIconWrap}>
              <Building2 size={24} color={colors.brand.forest700} />
            </View>
            <View style={styles.companyInfo}>
              <Text variant="h2" color={colors.neutral.ink900} numberOfLines={1}>
                {overview.company_name}
              </Text>
              <Text variant="caption" color={colors.neutral.ink500}>
                Sektor: {overview.industry} · Wilayah: {overview.region}
              </Text>
            </View>
          </View>

          {/* Aggregate Stats Card */}
          <View style={styles.section}>
            <Text variant="h3" color={colors.neutral.ink900}>
              Skala Agregasi Lahan & Dampak
            </Text>

            <Card style={styles.statsCard}>
              {stats.map((stat, index) => (
                <View
                  key={stat.label}
                  style={[
                    styles.statRow,
                    index > 0 ? styles.statDivider : null,
                  ]}
                >
                  <Text variant="body" color={colors.neutral.ink500}>
                    {stat.label}
                  </Text>
                  <Text variant="bodyMedium" color={colors.neutral.ink900} style={styles.statValue}>
                    {stat.value}
                  </Text>
                </View>
              ))}
            </Card>
          </View>

          {/* Privacy Disclaimer Card */}
          <Card style={styles.disclaimerCard}>
            <View style={styles.disclaimerRow}>
              <Info size={18} color={colors.brand.forest700} />
              <View style={styles.disclaimerTextWrap}>
                <Text variant="bodyMedium" color={colors.neutral.ink900}>
                  Kerahasiaan Data Petani Gurem
                </Text>
                <Text variant="caption" color={colors.neutral.ink500}>
                  {CORPORATE_DISCLAIMER}
                </Text>
              </View>
            </View>
          </Card>

          {/* CTA: Browse Projects */}
          <Button
            label="Eksplorasi Katalog Proyek Karbon"
            icon={Leaf}
            onPress={() => router.push('/corporate/projects')}
          />
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
  skeletonGroup: {
    gap: spacing.md,
  },
  companyCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.neutral.line,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    shadowColor: colors.brand.forest900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  companyIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: '#E7F2EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyInfo: {
    flex: 1,
    gap: 2,
  },
  section: {
    gap: spacing.sm,
  },
  statsCard: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  statDivider: {
    borderTopWidth: 1,
    borderTopColor: '#F0F4F1',
  },
  statValue: {
    fontWeight: '700',
  },
  disclaimerCard: {
    padding: spacing.md,
    backgroundColor: '#F7FAF8',
    borderColor: '#D4E5DB',
  },
  disclaimerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  disclaimerTextWrap: {
    flex: 1,
    gap: 2,
  },
});