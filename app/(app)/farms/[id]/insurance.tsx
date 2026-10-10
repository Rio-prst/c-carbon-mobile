import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { CheckCircle2, ShieldCheck, Umbrella } from 'lucide-react-native';
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
} from '../../../../components';
import { colors, radii, spacing } from '../../../../lib/theme';
import { insuranceStatusMeta } from '../../../../lib/insurance';
import { getInsurance } from '../../../../services/insurance';
import { useAuth } from '../../../../store/auth';
import type { Insurance } from '../../../../types/insurance';

type LoadState =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'success'; insurance: Insurance | null };

export default function InsuranceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [state, setState] = useState<LoadState>({ kind: 'loading' });
  const [refreshing, setRefreshing] = useState(false);
  const { token } = useAuth();

  const load = useCallback(() => {
    if (!token) {
      setState({ kind: 'error', message: 'Token tidak tersedia' });
      return;
    }

    setState({ kind: 'loading' });

    getInsurance(id, token)
      .then((insurance) => setState({ kind: 'success', insurance }))
      .catch((error: unknown) =>
        setState({
          kind: 'error',
          message:
            error instanceof Error ? error.message : 'Gagal memuat status polis asuransi',
        }),
      );
  }, [id, token]);

  useEffect(() => {
    load();
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
          title="Status Eco-Insurance"
          subtitle="Jaring pengaman risiko transisi pertanian hijau"
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
      {state.kind === 'loading' ? (
        <View style={styles.content}>
          <Skeleton height={180} borderRadius={20} />
          <Skeleton height={140} borderRadius={18} />
        </View>
      ) : null}

      {state.kind === 'error' ? (
        <ErrorState message={state.message} onRetry={load} />
      ) : null}

      {state.kind === 'success' && state.insurance == null ? (
        <EmptyState
          icon={ShieldCheck}
          title="Belum ada data polis aktif"
          description="Lahan ini belum memiliki catatan polis asuransi aktif. Data polis diterbitkan oleh mitra asuransi parametrik."
        />
      ) : null}

      {state.kind === 'success' && state.insurance != null ? (
        <View style={styles.content}>
          {/* Main Policy Card */}
          <View style={styles.policyCard}>
            <View style={styles.policyHeader}>
              <View style={styles.headerTitleWrap}>
                <ShieldCheck size={24} color={colors.neutral.white} strokeWidth={2.4} />
                <Text variant="h3" color={colors.neutral.white}>
                  Polis Asuransi Parametrik
                </Text>
              </View>
              <StatusBadge
                label={insuranceStatusMeta(state.insurance.status).label}
                tone={insuranceStatusMeta(state.insurance.status).tone}
              />
            </View>

            <View style={styles.policyBody}>
              <View style={styles.policyRow}>
                <Text variant="caption" color={colors.neutral.ink500}>
                  ID POLIS
                </Text>
                <Text variant="bodyMedium" color={colors.brand.forest700} style={styles.monoNumber}>
                  {`POL-${state.insurance.id.slice(0, 8).toUpperCase()}`}
                </Text>
              </View>

              <View style={styles.policyRow}>
                <Text variant="caption" color={colors.neutral.ink500}>
                  MITRA PENANGGUNG
                </Text>
                <Text variant="bodyMedium" color={colors.neutral.ink900}>
                  {state.insurance.partner}
                </Text>
              </View>

              <View style={styles.policyRow}>
                <Text variant="caption" color={colors.neutral.ink500}>
                  PERIODE PERLINDUNGAN
                </Text>
                <Text variant="bodyMedium" color={colors.neutral.ink900}>
                  Musim Tanam 2026 (Aktif)
                </Text>
              </View>
            </View>
          </View>

          {/* Explanation Card */}
          <Card style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <Umbrella size={20} color={colors.brand.forest700} />
              <Text variant="h3" color={colors.neutral.ink900}>
                Manfaat Proteksi Petani
              </Text>
            </View>
            <View style={styles.benefitsList}>
              <View style={styles.benefitRow}>
                <CheckCircle2 size={16} color={colors.semantic.success} />
                <Text variant="body" color={colors.neutral.ink700} style={styles.benefitText}>
                  Perlindungan gagal panen akibat cuaca ekstrem (kekeringan / banjir).
                </Text>
              </View>
              <View style={styles.benefitRow}>
                <CheckCircle2 size={16} color={colors.semantic.success} />
                <Text variant="body" color={colors.neutral.ink700} style={styles.benefitText}>
                  Menghilangkan risiko finansial saat petani beralih ke pupuk organik dan pengairan rendah metana (AWD).
                </Text>
              </View>
              <View style={styles.benefitRow}>
                <CheckCircle2 size={16} color={colors.semantic.success} />
                <Text variant="body" color={colors.neutral.ink700} style={styles.benefitText}>
                  Premi asuransi disubsidi melalui komitmen kemitraan pembeli karbon korporat.
                </Text>
              </View>
            </View>
          </Card>
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
  policyCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.neutral.line,
    overflow: 'hidden',
    shadowColor: colors.brand.forest900,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  policyHeader: {
    backgroundColor: colors.brand.forest700,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  policyBody: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  policyRow: {
    gap: 2,
  },
  monoNumber: {
    fontWeight: '700',
  },
  infoCard: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  benefitsList: {
    gap: spacing.sm,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  benefitText: {
    flex: 1,
  },
});