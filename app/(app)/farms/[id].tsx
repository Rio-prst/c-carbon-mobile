import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import {
  ChevronRight,
  ClipboardList,
  ExternalLink,
  Gauge,
  MapPin,
  ShieldCheck,
  Sprout,
} from 'lucide-react-native';
import {
  BoardingPassCard,
  BottomNav,
  Button,
  Card,
  ErrorState,
  Header,
  MetricPills,
  Screen,
  Skeleton,
  StatusBadge,
  Text,
} from '../../../components';
import { colors, radii, spacing } from '../../../lib/theme';
import { farmStatusMeta, formatCoordinate, formatLandArea } from '../../../lib/farm';
import { ApiClientError } from '../../../lib/api';
import { getFarm } from '../../../services/farms';
import { useAuth } from '../../../store/auth';
import type { Farm } from '../../../types/farm';

type DetailState =
  | { kind: 'loading' }
  | { kind: 'error'; notFound: boolean; message: string }
  | { kind: 'success'; farm: Farm };

export default function FarmDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [state, setState] = useState<DetailState>({ kind: 'loading' });
  const { token } = useAuth();

  const load = useCallback(() => {
    if (!token) {
      setState({ kind: 'error', notFound: false, message: 'Token tidak tersedia' });
      return;
    }

    setState({ kind: 'loading' });

    getFarm(id, token)
      .then((farm) => setState({ kind: 'success', farm }))
      .catch((error: unknown) =>
        setState({
          kind: 'error',
          notFound: error instanceof ApiClientError && error.statusCode === 404,
          message: error instanceof Error ? error.message : 'Gagal memuat lahan',
        }),
      );
  }, [id, token]);

  useEffect(() => {
    load();
  }, [load]);

  const farm = state.kind === 'success' ? state.farm : null;

  return (
    <Screen
      scroll
      bottomNav={<BottomNav />}
      header={
        <Header
          title={farm?.name ?? 'Detail Lahan'}
          subtitle={farm ? farm.digitalFarmId : 'Informasi Lahan'}
          showBack
          rightAction={
            farm ? (
              <StatusBadge
                label={farmStatusMeta(farm.status).label}
                tone={farmStatusMeta(farm.status).tone}
              />
            ) : null
          }
        />
      }
    >
      {state.kind === 'loading' ? <DetailSkeleton /> : null}

      {state.kind === 'error' ? (
        <ErrorState
          message={
            state.notFound
              ? 'Lahan tidak ditemukan atau sudah dihapus.'
              : state.message
          }
          onRetry={load}
        />
      ) : null}

      {farm ? (
        <View style={styles.content}>
          {/* 1. Boarding Pass Style Card for Farm ID & Eco-Insurance */}
          <BoardingPassCard
            digitalFarmId={farm.digitalFarmId}
            farmName={farm.name}
            commodity={farm.commodity}
            landArea={formatLandArea(farm.landAreaHa)}
            location={`${formatCoordinate(farm.lat)}, ${formatCoordinate(farm.lng)}`}
            policyStatus="POLIS AKTIF"
            insurerName="Mitra Eco-Insurance"
            onPress={() => router.push(`/farms/${farm.id}/insurance`)}
          />

          {/* 2. Three Metric Pills (Luas Lahan, Komoditas, Potensi CO2) */}
          <MetricPills
            metrics={[
              {
                label: 'Luas Lahan',
                value: formatLandArea(farm.landAreaHa),
                type: 'area',
              },
              {
                label: 'Komoditas',
                value: farm.commodity,
                type: 'yield',
              },
              {
                label: 'Potensi CO₂',
                value: `${(farm.landAreaHa * 7.5).toFixed(1)} Ton`,
                type: 'carbon',
              },
            ]}
          />

          {/* 3. Section: Menu Fitur Terpadu (Structured Feature Cards) */}
          <View style={styles.section}>
            <Text variant="h3" color={colors.neutral.ink900}>
              Pusat Manajemen Lahan
            </Text>

            <Pressable
              onPress={() => router.push(`/farms/${farm.id}/insurance`)}
              style={({ pressed }) => [styles.featureCard, pressed && styles.pressed]}
            >
              <View style={[styles.featureIconWrap, { backgroundColor: '#E7F2EB' }]}>
                <ShieldCheck size={22} color={colors.brand.forest700} />
              </View>
              <View style={styles.featureText}>
                <Text variant="bodyMedium" color={colors.neutral.ink900}>
                  Status Eco-Insurance
                </Text>
                <Text variant="caption" color={colors.neutral.ink500}>
                  Proteksi risiko panen & sertifikat polis asuransi
                </Text>
              </View>
              <ChevronRight size={18} color={colors.neutral.ink500} />
            </Pressable>

            <Pressable
              onPress={() => router.push(`/farms/${farm.id}/data`)}
              style={({ pressed }) => [styles.featureCard, pressed && styles.pressed]}
            >
              <View style={[styles.featureIconWrap, { backgroundColor: '#F5EFE6' }]}>
                <ClipboardList size={22} color={colors.accent.earth700} />
              </View>
              <View style={styles.featureText}>
                <Text variant="bodyMedium" color={colors.neutral.ink900}>
                  Riwayat Data Musim
                </Text>
                <Text variant="caption" color={colors.neutral.ink500}>
                  Catatan pupuk, air, energi, dan bukti verifikasi
                </Text>
              </View>
              <ChevronRight size={18} color={colors.neutral.ink500} />
            </Pressable>

            <Pressable
              onPress={() => router.push(`/farms/${farm.id}/score`)}
              style={({ pressed }) => [styles.featureCard, pressed && styles.pressed]}
            >
              <View style={[styles.featureIconWrap, { backgroundColor: '#E8F1F7' }]}>
                <Gauge size={22} color={colors.semantic.info} />
              </View>
              <View style={styles.featureText}>
                <Text variant="bodyMedium" color={colors.neutral.ink900}>
                  Skor Fulton (FSS)
                </Text>
                <Text variant="caption" color={colors.neutral.ink500}>
                  Evaluasi 10 indikator ketahanan tanah & emisi
                </Text>
              </View>
              <ChevronRight size={18} color={colors.neutral.ink500} />
            </Pressable>

            <Pressable
              onPress={() => router.push(`/farms/${farm.id}/readiness`)}
              style={({ pressed }) => [styles.featureCard, pressed && styles.pressed]}
            >
              <View style={[styles.featureIconWrap, { backgroundColor: '#E7EFE9' }]}>
                <Sprout size={22} color={colors.brand.forest600} />
              </View>
              <View style={styles.featureText}>
                <Text variant="bodyMedium" color={colors.neutral.ink900}>
                  Kesiapan Karbon (CRS)
                </Text>
                <Text variant="caption" color={colors.neutral.ink500}>
                  Kelayakan lahan menuju agregasi proyek karbon
                </Text>
              </View>
              <ChevronRight size={18} color={colors.neutral.ink500} />
            </Pressable>
          </View>

          {/* 4. Lokasi GPS Action */}
          <Button
            label="Buka Titik Lahan di Google Maps"
            variant="secondary"
            icon={ExternalLink}
            onPress={() =>
              void Linking.openURL(
                `https://www.google.com/maps?q=${farm.lat},${farm.lng}`,
              )
            }
          />
        </View>
      ) : null}
    </Screen>
  );
}

function DetailSkeleton() {
  return (
    <View style={styles.skeleton}>
      <Skeleton height={180} borderRadius={20} />
      <Skeleton height={60} borderRadius={16} />
      <Skeleton height={220} borderRadius={20} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  section: {
    gap: spacing.sm,
  },
  featureCard: {
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
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  featureIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
    gap: 2,
  },
  skeleton: {
    gap: spacing.lg,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
});
