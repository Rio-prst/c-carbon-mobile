import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { FileWarning, Paperclip, Plus } from 'lucide-react-native';
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
  TimelineStep,
} from '../../../../../components';
import {
  farmDataStatusMeta,
  formatSubmissionDate,
  summarizeFarmData,
} from '../../../../../lib/farm-data';
import { evidenceTypeLabel } from '../../../../../lib/evidence';
import { colors, radii, spacing } from '../../../../../lib/theme';
import { getEvidence, getHistory } from '../../../../../services/farm-data';
import { useAuth } from '../../../../../store/auth';
import type { Evidence, FarmData } from '../../../../../types/farm-data';

export default function FarmDataHistoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();

  const [data, setData] = useState<FarmData[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [openEvidenceId, setOpenEvidenceId] = useState<string | null>(null);
  const [evidenceByDataId, setEvidenceByDataId] = useState<
    Record<string, Evidence[]>
  >({});
  const [loadingEvidenceId, setLoadingEvidenceId] = useState<string | null>(null);

  const toggleEvidence = useCallback(
    async (farmDataId: string) => {
      if (openEvidenceId === farmDataId) {
        setOpenEvidenceId(null);
        return;
      }

      setOpenEvidenceId(farmDataId);
      if (evidenceByDataId[farmDataId] != null || !token) return;

      setLoadingEvidenceId(farmDataId);
      try {
        const result = await getEvidence(id, farmDataId, token);
        setEvidenceByDataId((prev) => ({ ...prev, [farmDataId]: result }));
      } catch {
        setEvidenceByDataId((prev) => ({ ...prev, [farmDataId]: [] }));
      } finally {
        setLoadingEvidenceId(null);
      }
    },
    [evidenceByDataId, id, openEvidenceId, token],
  );

  const load = useCallback(async () => {
    if (!token) return;
    setError(null);
    try {
      setData(await getHistory(id, token));
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Gagal memuat riwayat data. Coba lagi.',
      );
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

  return (
    <Screen
      scroll
      bottomNav={<BottomNav />}
      header={
        <Header
          title="Riwayat Data Musim"
          subtitle="Verifikasi bukti data tanam & panen"
          showBack
          rightAction={
            <Button
              label="Tambah"
              icon={Plus}
              onPress={() => router.push(`/farms/${id}/data/new`)}
              style={styles.addBtn}
            />
          }
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

      {data == null && error == null ? <HistorySkeleton /> : null}

      {data != null && data.length === 0 ? (
        <EmptyState
          icon={FileWarning}
          title="Belum ada riwayat data musim"
          description="Kirim laporan data musim tanam pertama Anda untuk memulai penilaian skor keberlanjutan dan jejak karbon."
          actionLabel="Kirim Data Musim"
          onAction={() => router.push(`/farms/${id}/data/new`)}
        />
      ) : null}

      {data != null && data.length > 0 ? (
        <View style={styles.list}>
          {data.map((item, index) => {
            const meta = farmDataStatusMeta(item.status);

            return (
              <View key={item.id} style={styles.cardContainer}>
                <TimelineStep
                  stepNumber={data.length - index}
                  title={`Musim ${formatSubmissionDate(item.submittedAt)}`}
                  subtitle={summarizeFarmData(item)}
                  statusLabel={meta.label}
                  statusTone={meta.tone}
                  isLast={index === data.length - 1}
                />

                <Card style={styles.detailsCard}>
                  <Text variant="caption" color={colors.neutral.ink500}>
                    {meta.description}
                  </Text>

                  {item.status === 'REJECTED' ? (
                    <View style={styles.rejection}>
                      <Text variant="label" color={colors.semantic.error}>
                        Alasan Ditolak:
                      </Text>
                      <Text variant="body" color={colors.semantic.error}>
                        {item.rejectionReason ?? 'Hubungi admin untuk detail perbaikan.'}
                      </Text>
                    </View>
                  ) : null}

                  {/* Evidence Trigger */}
                  <Pressable
                    style={styles.evidenceToggle}
                    onPress={() => void toggleEvidence(item.id)}
                  >
                    <Paperclip
                      size={16}
                      strokeWidth={2}
                      color={
                        evidenceByDataId[item.id]?.length
                          ? colors.brand.forest600
                          : colors.neutral.ink500
                      }
                    />
                    <Text variant="caption" color={colors.neutral.ink700} style={styles.evidenceToggleText}>
                      {evidenceByDataId[item.id]?.length
                        ? `${evidenceByDataId[item.id].length} Bukti Dokumen Terlampir`
                        : 'Lihat Bukti Foto / Dokumen'}
                    </Text>
                  </Pressable>

                  {openEvidenceId === item.id ? (
                    loadingEvidenceId === item.id ? (
                      <Text variant="caption" color={colors.neutral.ink500}>
                        Memuat bukti...
                      </Text>
                    ) : (evidenceByDataId[item.id] ?? []).length === 0 ? (
                      <Text variant="caption" color={colors.neutral.ink500}>
                        Belum ada dokumen bukti yang dilampirkan.
                      </Text>
                    ) : (
                      <View style={styles.evidenceList}>
                        {(evidenceByDataId[item.id] ?? []).map((file) => (
                          <View key={file.id} style={styles.evidenceItem}>
                            <Text variant="bodyMedium" color={colors.neutral.ink900}>
                              {file.fileName ?? 'Berkas Bukti'}
                            </Text>
                            <Text variant="caption" color={colors.neutral.ink500}>
                              {evidenceTypeLabel(file.type)} · {formatSubmissionDate(file.uploadedAt)}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )
                  ) : null}
                </Card>
              </View>
            );
          })}
        </View>
      ) : null}
    </Screen>
  );
}

function HistorySkeleton() {
  return (
    <View style={styles.list}>
      <Skeleton height={110} borderRadius={18} />
      <Skeleton height={110} borderRadius={18} />
    </View>
  );
}

const styles = StyleSheet.create({
  addBtn: {
    minHeight: 38,
    paddingHorizontal: 12,
  },
  list: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  cardContainer: {
    gap: spacing.xs,
  },
  detailsCard: {
    marginLeft: 42,
    marginTop: -spacing.md,
    marginBottom: spacing.md,
    gap: spacing.xs,
    padding: spacing.md,
    backgroundColor: '#F9FBF9',
    borderColor: '#E2ECE5',
  },
  rejection: {
    backgroundColor: '#FFF2F2',
    borderWidth: 1,
    borderColor: '#FED7D7',
    borderRadius: radii.md,
    padding: spacing.sm,
    gap: 2,
  },
  evidenceToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    marginTop: 4,
  },
  evidenceToggleText: {
    fontWeight: '600',
  },
  evidenceList: {
    gap: spacing.xs,
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#E2ECE5',
    paddingTop: 8,
  },
  evidenceItem: {
    backgroundColor: colors.neutral.white,
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.neutral.line,
  },
});