import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { ClipboardList, Info, MinusCircle } from 'lucide-react-native';
import {
  BottomNav,
  Button,
  Card,
  ChecklistCard,
  CircularGauge,
  EmptyState,
  ErrorState,
  Header,
  Screen,
  Skeleton,
  StatusBadge,
  Text,
} from '../../../../components';
import {
  READINESS_COMPONENTS,
  isComponentUnavailable,
  unavailableReason,
} from '../../../../lib/readiness';
import { colors, radii, spacing } from '../../../../lib/theme';
import { getReadiness } from '../../../../services/readiness';
import { useAuth } from '../../../../store/auth';
import type { CRSReadiness } from '../../../../types/readiness';

type State =
  | { kind: 'loading' }
  | { kind: 'success'; readiness: CRSReadiness | null }
  | { kind: 'error'; message: string };

export default function ReadinessScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const [state, setState] = useState<State>({ kind: 'loading' });
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setState({ kind: 'loading' });
    try {
      setState({ kind: 'success', readiness: await getReadiness(id, token) });
    } catch (error: unknown) {
      setState({
        kind: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Gagal memuat kesiapan karbon. Coba lagi.',
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

  const readiness = state.kind === 'success' ? state.readiness : null;

  return (
    <Screen
      scroll
      bottomNav={<BottomNav />}
      header={
        <Header
          title="Kesiapan Karbon (CRS)"
          subtitle="Carbon Readiness Score — Evaluasi Proyek Agregat"
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
      {state.kind === 'loading' ? <ReadinessSkeleton /> : null}

      {state.kind === 'error' ? (
        <ErrorState message={state.message} onRetry={() => void load()} />
      ) : null}

      {state.kind === 'success' && readiness == null ? (
        <EmptyState
          icon={ClipboardList}
          title="Kesiapan belum dapat dihitung"
          description="Kirim data musim tanam terlebih dahulu untuk melihat kelayakan lahan menuju kandidat proyek karbon."
          actionLabel="Kirim Data Musim"
          onAction={() => router.push(`/farms/${id}/data/new`)}
        />
      ) : null}

      {state.kind === 'success' && readiness != null ? (
        <View style={styles.content}>
          {/* Circular Gauge Hero Card */}
          <CircularGauge
            percentage={readiness.crs_value}
            size={84}
            strokeWidth={9}
            title="Kelayakan Agregasi Karbon"
            subtitle="SKOR CRS PERTANIAN"
          />

          {/* Status Disclaimer Notice */}
          <Card style={styles.disclaimerCard}>
            <View style={styles.disclaimerRow}>
              <Info size={18} color={colors.semantic.info} />
              <View style={styles.disclaimerTextWrap}>
                <Text variant="bodyMedium" color={colors.neutral.ink900}>
                  Status: {readiness.is_provisional ? 'Kandidat Sementara' : 'Kualifikasi Lengkap'}
                </Text>
                <Text variant="caption" color={colors.neutral.ink500}>
                  {readiness.disclaimer}
                </Text>
              </View>
            </View>
          </Card>

          {/* Action Checklist */}
          {readiness.next_actions.length > 0 ? (
            <ChecklistCard
              title="Kriteria yang Perlu Dipenuhi"
              items={readiness.next_actions.map((action, idx) => ({
                id: `action-${idx}`,
                label: action,
                completed: false,
              }))}
            />
          ) : null}

          {/* Rincian Komponen CRS */}
          <View style={styles.section}>
            <Text variant="h3" color={colors.neutral.ink900}>
              Rincian Komponen Kesiapan
            </Text>

            <Card style={styles.breakdownCard}>
              {READINESS_COMPONENTS.map((component, idx) => {
                const unavailable = isComponentUnavailable(readiness, component.key);
                const score = readiness.breakdown[component.key] ?? 0;

                return (
                  <View
                    key={component.key}
                    style={[styles.componentRow, idx > 0 && styles.rowBorder]}
                  >
                    <View style={styles.componentHeader}>
                      <Text variant="bodyMedium" color={colors.neutral.ink900}>
                        {component.label}
                      </Text>
                      <Text variant="caption" color={colors.brand.forest700} style={styles.weightText}>
                        {unavailable
                          ? 'Belum dinilai'
                          : `${score}/100 · ${component.weightPercent}%`}
                      </Text>
                    </View>

                    {unavailable ? (
                      <View style={styles.unavailableRow}>
                        <MinusCircle size={14} color={colors.neutral.ink500} />
                        <Text variant="caption" color={colors.neutral.ink500}>
                          {unavailableReason(readiness, component.key) ?? 'Memerlukan verifikasi data'}
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.track}>
                        <View
                          style={[
                            styles.fill,
                            {
                              width: `${score}%`,
                              backgroundColor:
                                score >= 70 ? colors.brand.forest600 : colors.accent.harvest500,
                            },
                          ]}
                        />
                      </View>
                    )}
                  </View>
                );
              })}
            </Card>
          </View>

          <Button
            label="Bandingkan dengan Skor FSS"
            variant="secondary"
            onPress={() => router.push(`/farms/${id}/score`)}
          />
        </View>
      ) : null}
    </Screen>
  );
}

function ReadinessSkeleton() {
  return (
    <View style={styles.content}>
      <Skeleton height={120} borderRadius={20} />
      <Skeleton height={80} borderRadius={18} />
      <Skeleton height={240} borderRadius={20} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  disclaimerCard: {
    padding: spacing.md,
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
  section: {
    gap: spacing.sm,
  },
  breakdownCard: {
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
  weightText: {
    fontWeight: '600',
  },
  unavailableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F5F7F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.sm,
    alignSelf: 'flex-start',
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