import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import {
  Award,
  Building2,
  ChevronRight,
  ClipboardCheck,
  Leaf,
  Plus,
  ShieldCheck,
  Sprout,
  UserRound,
} from 'lucide-react-native';
import {
  BoardingPassCard,
  BottomNav,
  CircularGauge,
  QuickActionGrid,
  Screen,
  Skeleton,
  StatusBadge,
  Text,
} from '../../components';
import { colors, radii, spacing } from '../../lib/theme';
import { listFarms } from '../../services/farms';
import { getReadiness } from '../../services/readiness';
import { getRewardsSummary } from '../../services/rewards';
import { useAuth } from '../../store/auth';
import type { Farm } from '../../types/farm';
import type { CRSReadiness } from '../../types/readiness';
import type { RewardsSummary } from '../../types/reward';

export default function HomeScreen() {
  const { user, token } = useAuth();
  const [farms, setFarms] = useState<Farm[] | null>(null);
  const [rewards, setRewards] = useState<RewardsSummary | null>(null);
  const [readiness, setReadiness] = useState<CRSReadiness | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const isFarmer = user?.role === 'FARMER';
  const isCorporate = user?.role === 'CORPORATE';
  const isAdmin = user?.role === 'ADMIN';

  const loadData = useCallback(async () => {
    if (!token || !isFarmer) return;
    try {
      const [farmsData, rewardsData] = await Promise.allSettled([
        listFarms(token),
        getRewardsSummary(token),
      ]);
      if (farmsData.status === 'fulfilled') {
        const farmList = farmsData.value;
        setFarms(farmList);
        if (farmList.length > 0) {
          try {
            const readinessData = await getReadiness(farmList[0].id, token);
            setReadiness(readinessData);
          } catch {
            setReadiness(null);
          }
        } else {
          setReadiness(null);
        }
      }
      if (rewardsData.status === 'fulfilled') setRewards(rewardsData.value);
    } catch {
      // keep silent on home background load
    }
  }, [token, isFarmer]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const primaryFarm = farms && farms.length > 0 ? farms[0] : null;

  return (
    <Screen
      scroll
      bottomNav={<BottomNav />}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => void onRefresh()}
          tintColor={colors.brand.forest600}
        />
      }
    >
      {/* Top Header Greeting Bar */}
      <View style={styles.topHeader}>
        <View style={styles.greetingText}>
          <Text variant="caption" color={colors.neutral.ink500}>
            SELAMAT DATANG KEMBALI
          </Text>
          <Text variant="h2" color={colors.brand.forest900}>
            {user?.name ?? 'Petani Mitra'} 👋
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/profile')}
          style={({ pressed }) => [styles.avatarBtn, pressed && styles.pressed]}
        >
          <UserRound size={20} color={colors.brand.forest700} strokeWidth={2.2} />
        </Pressable>
      </View>

      {/* Hero Headline */}
      <View style={styles.heroSection}>
        <Text variant="display" color={colors.brand.forest900} style={styles.heroTitle}>
          Pertanian Anda,{'\n'}
          <Text variant="display" color={colors.brand.forest600}>
            Terlindungi & Berdaya.
          </Text>
        </Text>
        <Text variant="body" color={colors.neutral.ink500}>
          Platform rekam jejak pertanian berkelanjutan, proteksi asuransi, dan akses pasar karbon.
        </Text>
      </View>

      {/* FARMER FLOW */}
      {isFarmer ? (
        <View style={styles.farmerContent}>
          {/* Section: Status Proteksi Utama (Boarding Pass Card) */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text variant="h3" color={colors.neutral.ink900}>
                Lahan & Asuransi Aktif
              </Text>
              {farms && farms.length > 0 ? (
                <Pressable onPress={() => router.push('/farms')}>
                  <Text variant="caption" color={colors.brand.forest700} style={styles.linkText}>
                    Lihat Semua ({farms.length})
                  </Text>
                </Pressable>
              ) : null}
            </View>

            {primaryFarm ? (
              <BoardingPassCard
                digitalFarmId={primaryFarm.digitalFarmId}
                farmName={primaryFarm.name}
                commodity={primaryFarm.commodity}
                landArea={`${primaryFarm.landAreaHa} Hektar`}
                location={`${primaryFarm.lat.toFixed(4)}, ${primaryFarm.lng.toFixed(4)}`}
                policyStatus="POLIS AKTIF"
                insurerName="Mitra Eco-Insurance"
                onPress={() => router.push(`/farms/${primaryFarm.id}`)}
              />
            ) : farms === null ? (
              <Skeleton height={140} borderRadius={20} />
            ) : (
              <Pressable
                onPress={() => router.push('/farms/new')}
                style={({ pressed }) => [styles.emptyFarmCard, pressed && styles.pressed]}
              >
                <View style={styles.emptyIconWrap}>
                  <Plus size={24} color={colors.brand.forest700} />
                </View>
                <View style={styles.emptyTextWrap}>
                  <Text variant="bodyMedium" color={colors.neutral.ink900}>
                    Daftarkan Lahan Pertama Anda
                  </Text>
                  <Text variant="caption" color={colors.neutral.ink500}>
                    Mulai catat musim & dapatkan perlindungan polis asuransi
                  </Text>
                </View>
              </Pressable>
            )}
          </View>

          {/* Section: Quick Actions Grid */}
          <View style={styles.section}>
            <Text variant="h3" color={colors.neutral.ink900}>
              Aksi Cepat
            </Text>
            <QuickActionGrid
              onPressFarms={() => router.push('/farms')}
              onPressSubmitData={() => {
                if (primaryFarm) {
                  router.push(`/farms/${primaryFarm.id}/data/new`);
                } else {
                  router.push('/farms');
                }
              }}
              onPressScore={() => {
                if (primaryFarm) {
                  router.push(`/farms/${primaryFarm.id}/score`);
                } else {
                  router.push('/farms');
                }
              }}
              onPressRewards={() => router.push('/rewards')}
            />
          </View>

          {/* Section: Carbon Readiness & Rewards Preview */}
          <View style={styles.section}>
            <Text variant="h3" color={colors.neutral.ink900}>
              Kesiapan Karbon & Poin
            </Text>
            <View style={styles.splitCards}>
              <CircularGauge
                percentage={readiness?.crs_value != null ? Math.round(readiness.crs_value) : 0}
                title="Kesiapan Karbon"
                subtitle={readiness?.is_provisional ? 'STATUS SEMENTARA' : 'STATUS CRS'}
                style={styles.gaugeCard}
                onPress={() => {
                  if (primaryFarm) {
                    router.push(`/farms/${primaryFarm.id}/readiness`);
                  } else {
                    router.push('/farms');
                  }
                }}
              />
            </View>

            {rewards ? (
              <Pressable
                onPress={() => router.push('/rewards')}
                style={({ pressed }) => [styles.rewardsBanner, pressed && styles.pressed]}
              >
                <View style={styles.rewardLeft}>
                  <Award size={24} color={colors.accent.harvest500} />
                  <View>
                    <Text variant="bodyMedium" color={colors.neutral.ink900}>
                      {rewards.total_points} Poin Terkumpul
                    </Text>
                    <Text variant="caption" color={colors.neutral.ink500}>
                      Tingkat: {rewards.tier} · Tukar insentif berkala
                    </Text>
                  </View>
                </View>
                <ChevronRight size={18} color={colors.neutral.ink500} />
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : null}

      {/* CORPORATE FLOW */}
      {isCorporate ? (
        <View style={styles.section}>
          <Text variant="h3" color={colors.neutral.ink900}>
            Portal Portofolio Korporat
          </Text>
          <Pressable
            onPress={() => router.push('/corporate')}
            style={({ pressed }) => [styles.portalCard, pressed && styles.pressed]}
          >
            <Building2 size={24} color={colors.brand.forest700} />
            <View style={styles.portalText}>
              <Text variant="bodyMedium" color={colors.neutral.ink900}>
                Ringkasan Agregat Proyek
              </Text>
              <Text variant="caption" color={colors.neutral.ink500}>
                Evaluasi total hektar lahan, estimasi serapan, dan kepatuhan ESG
              </Text>
            </View>
            <ChevronRight size={18} color={colors.neutral.ink500} />
          </Pressable>

          <Pressable
            onPress={() => router.push('/corporate/projects')}
            style={({ pressed }) => [styles.portalCard, pressed && styles.pressed]}
          >
            <Leaf size={24} color={colors.brand.forest700} />
            <View style={styles.portalText}>
              <Text variant="bodyMedium" color={colors.neutral.ink900}>
                Katalog Kandidat Karbon
              </Text>
              <Text variant="caption" color={colors.neutral.ink500}>
                Daftar proyek agregasi yang siap dievaluasi & didanai
              </Text>
            </View>
            <ChevronRight size={18} color={colors.neutral.ink500} />
          </Pressable>
        </View>
      ) : null}

      {/* ADMIN FLOW */}
      {isAdmin ? (
        <View style={styles.section}>
          <Text variant="h3" color={colors.neutral.ink900}>
            Pusat Verifikasi & Manajemen
          </Text>
          <Pressable
            onPress={() => router.push('/admin/review')}
            style={({ pressed }) => [styles.portalCard, pressed && styles.pressed]}
          >
            <ClipboardCheck size={24} color={colors.brand.forest700} />
            <View style={styles.portalText}>
              <Text variant="bodyMedium" color={colors.neutral.ink900}>
                Review Data & Bukti Lapangan
              </Text>
              <Text variant="caption" color={colors.neutral.ink500}>
                Verifikasi laporan musim tanam, pupuk, dan bukti foto petani
              </Text>
            </View>
            <ChevronRight size={18} color={colors.neutral.ink500} />
          </Pressable>

          <Pressable
            onPress={() => router.push('/admin/projects')}
            style={({ pressed }) => [styles.portalCard, pressed && styles.pressed]}
          >
            <Sprout size={24} color={colors.brand.forest700} />
            <View style={styles.portalText}>
              <Text variant="bodyMedium" color={colors.neutral.ink900}>
                Kelola Proyek Karbon Agregat
              </Text>
              <Text variant="caption" color={colors.neutral.ink500}>
                Filter kelayakan CRS & terbitkan proyek kandidat korporat
              </Text>
            </View>
            <ChevronRight size={18} color={colors.neutral.ink500} />
          </Pressable>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  greetingText: {
    gap: 2,
  },
  avatarBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.neutral.line,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.brand.forest900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  heroSection: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  heroTitle: {
    lineHeight: 38,
  },
  farmerContent: {
    gap: spacing.xl,
  },
  section: {
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  linkText: {
    fontWeight: '600',
  },
  emptyFarmCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#D4E2D8',
    borderStyle: 'dashed',
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  emptyIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: '#E7EFE9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTextWrap: {
    flex: 1,
    gap: 2,
  },
  splitCards: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  gaugeCard: {
    flex: 1,
  },
  rewardsBanner: {
    backgroundColor: colors.neutral.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.neutral.line,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  rewardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  portalCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.neutral.line,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  portalText: {
    flex: 1,
    gap: 2,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
});