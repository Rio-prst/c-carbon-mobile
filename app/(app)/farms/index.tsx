import { router } from 'expo-router';
import { ChevronRight, MapPin, Plus } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, View } from 'react-native';
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
} from '../../../components';
import { farmStatusMeta, formatLandArea } from '../../../lib/farm';
import { colors, radii, spacing } from '../../../lib/theme';
import { listFarms } from '../../../services/farms';
import { useAuth } from '../../../store/auth';
import type { Farm } from '../../../types/farm';

type LoadState =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'success'; farms: Farm[] };

export default function FarmsScreen() {
  const [state, setState] = useState<LoadState>({ kind: 'loading' });
  const [refreshing, setRefreshing] = useState(false);
  const { token } = useAuth();

  const load = useCallback(() => {
    if (!token) {
      setState({ kind: 'error', message: 'Token tidak tersedia' });
      return;
    }

    setState({ kind: 'loading' });

    listFarms(token)
      .then((farms) => setState({ kind: 'success', farms }))
      .catch((error: unknown) =>
        setState({
          kind: 'error',
          message:
            error instanceof Error ? error.message : 'Gagal memuat lahan',
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

  return (
    <Screen
      scroll
      bottomNav={<BottomNav />}
      header={
        <Header
          title="Lahan Saya"
          subtitle="Daftar lahan dan status proteksi asuransi"
          rightAction={
            <Button
              label="Tambah"
              icon={Plus}
              onPress={() => router.push('/farms/new')}
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
      {state.kind === 'loading' ? (
        <View style={styles.list}>
          <Skeleton height={110} borderRadius={20} />
          <Skeleton height={110} borderRadius={20} />
          <Skeleton height={110} borderRadius={20} />
        </View>
      ) : null}

      {state.kind === 'error' ? (
        <ErrorState
          message={state.message}
          onRetry={load}
        />
      ) : null}

      {state.kind === 'success' && state.farms.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="Belum ada lahan terdaftar"
          description="Daftarkan lahan pertama Anda untuk mendapatkan polis asuransi dan memulai rekam jejak karbon."
          actionLabel="Daftarkan Lahan Baru"
          onAction={() => router.push('/farms/new')}
        />
      ) : null}

      {state.kind === 'success' && state.farms.length > 0 ? (
        <View style={styles.list}>
          {state.farms.map((farm) => {
            const status = farmStatusMeta(farm.status);
            return (
              <Pressable
                key={farm.id}
                onPress={() => router.push(`/farms/${farm.id}`)}
                style={({ pressed }) => [styles.farmCard, pressed && styles.pressed]}
              >
                <View style={styles.cardTop}>
                  <View style={styles.farmTitleWrap}>
                    <Text variant="h3" color={colors.neutral.ink900} numberOfLines={1}>
                      {farm.name}
                    </Text>
                    <Text variant="caption" color={colors.brand.forest700} style={styles.monoId}>
                      {farm.digitalFarmId}
                    </Text>
                  </View>
                  <StatusBadge label={status.label} tone={status.tone} />
                </View>

                <View style={styles.cardBottom}>
                  <View style={styles.infoPills}>
                    <View style={styles.pill}>
                      <Text variant="caption" color={colors.neutral.ink700}>
                        🌾 {farm.commodity}
                      </Text>
                    </View>
                    <View style={styles.pill}>
                      <Text variant="caption" color={colors.neutral.ink700}>
                        📐 {formatLandArea(farm.landAreaHa)}
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={18} color={colors.neutral.ink500} />
                </View>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  addBtn: {
    minHeight: 38,
    paddingHorizontal: 12,
  },
  list: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  farmCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.neutral.line,
    padding: spacing.md,
    gap: spacing.md,
    shadowColor: colors.brand.forest900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  farmTitleWrap: {
    flex: 1,
    gap: 2,
  },
  monoId: {
    fontWeight: '700',
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F4F1',
  },
  infoPills: {
    flexDirection: 'row',
    gap: 6,
  },
  pill: {
    backgroundColor: '#F3F6F4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
});
