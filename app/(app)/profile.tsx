import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { CircleCheck, CircleSlash, LogOut, ShieldAlert, UserRound } from 'lucide-react-native';
import {
  BottomNav,
  Button,
  Card,
  ErrorState,
  Header,
  Screen,
  Skeleton,
  StatusBadge,
  Text,
} from '../../components';
import { formatConsentDate, purposeLabel } from '../../lib/consent';
import { colors, radii, spacing } from '../../lib/theme';
import { getConsents, revokeConsent } from '../../services/consent';
import { useAuth } from '../../store/auth';
import type { ConsentStatus } from '../../types/consent';

export default function ProfileScreen() {
  const { token, user, signOut } = useAuth();

  const [status, setStatus] = useState<ConsentStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setError(null);
    try {
      setStatus(await getConsents(token));
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Gagal memuat persetujuan. Coba lagi.',
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

  const onRevoke = async () => {
    if (!token) return;
    setBusy(true);
    setActionError(null);
    try {
      setStatus(await revokeConsent('carbon_project', token));
    } catch (err: unknown) {
      setActionError(
        err instanceof Error
          ? err.message
          : 'Gagal menarik persetujuan.',
      );
    } finally {
      setBusy(false);
    }
  };

  const canRevoke = status?.carbon_project_granted === true;
  const isFarmer = user?.role === 'FARMER';

  return (
    <Screen
      scroll
      bottomNav={<BottomNav />}
      header={
        <Header
          title="Profil Pengguna"
          subtitle="Data akun & pengelolaan persetujuan data"
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
      <View style={styles.content}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarWrap}>
            <UserRound size={28} color={colors.brand.forest700} strokeWidth={2.2} />
          </View>
          <View style={styles.userInfo}>
            <Text variant="h2" color={colors.neutral.ink900} numberOfLines={1}>
              {user?.name ?? 'Pengguna'}
            </Text>
            <Text variant="caption" color={colors.neutral.ink500}>
              {user?.email ?? '-'}
            </Text>
          </View>
          <StatusBadge
            label={user?.role === 'FARMER' ? 'Petani' : user?.role === 'CORPORATE' ? 'Korporat' : 'Admin'}
            tone={user?.role === 'FARMER' ? 'success' : user?.role === 'ADMIN' ? 'warning' : 'info'}
          />
        </View>

        {error != null ? (
          <ErrorState message={error} onRetry={() => void load()} />
        ) : null}

        {actionError != null ? (
          <Card style={styles.actionError}>
            <Text variant="caption" color={colors.semantic.error}>
              {actionError}
            </Text>
          </Card>
        ) : null}

        {status == null && error == null ? (
          <View style={styles.skeletonGroup}>
            <Skeleton height={90} borderRadius={18} />
            <Skeleton height={140} borderRadius={18} />
          </View>
        ) : null}

        {/* Farmer Consent Section */}
        {status != null && isFarmer ? (
          <View style={styles.consentSection}>
            <Text variant="h3" color={colors.neutral.ink900}>
              Persetujuan Data Lahan (Consent)
            </Text>

            <View
              style={[
                styles.statusBanner,
                status.carbon_project_granted
                  ? styles.statusGranted
                  : styles.statusRevoked,
              ]}
            >
              <View style={styles.statusHeader}>
                {status.carbon_project_granted ? (
                  <CircleCheck size={20} color={colors.brand.forest600} />
                ) : (
                  <CircleSlash size={20} color={colors.semantic.warning} />
                )}
                <Text
                  variant="bodyMedium"
                  color={
                    status.carbon_project_granted
                      ? colors.brand.forest700
                      : colors.semantic.warning
                  }
                  style={styles.statusTitle}
                >
                  {status.carbon_project_granted
                    ? 'Persetujuan Proyek Karbon Aktif'
                    : 'Persetujuan Telah Ditarik'}
                </Text>
              </View>
              <Text variant="caption" color={colors.neutral.ink700}>
                {status.notice}
              </Text>
            </View>

            {/* Consents History */}
            <Card style={styles.historyCard}>
              <Text variant="bodyMedium" color={colors.neutral.ink900}>
                Riwayat Persetujuan
              </Text>
              {status.consents.length === 0 ? (
                <Text variant="caption" color={colors.neutral.ink500}>
                  Belum ada riwayat persetujuan data tercatat.
                </Text>
              ) : (
                status.consents.map((consent, index) => (
                  <View
                    key={`${consent.purpose}-${consent.granted_at}-${index}`}
                    style={[
                      styles.historyRow,
                      index > 0 ? styles.historyDivider : null,
                    ]}
                  >
                    <View style={styles.historyTop}>
                      <Text
                        variant="body"
                        color={colors.neutral.ink900}
                        style={styles.historyTitle}
                      >
                        {purposeLabel(consent.purpose)}
                      </Text>
                      <StatusBadge
                        label={consent.active ? 'Aktif' : 'Ditarik'}
                        tone={consent.active ? 'success' : 'warning'}
                      />
                    </View>
                    <Text variant="caption" color={colors.neutral.ink500}>
                      Versi {consent.consent_version} · Disetujui{' '}
                      {formatConsentDate(consent.granted_at)}
                    </Text>
                    {consent.revoked_at != null ? (
                      <Text variant="caption" color={colors.semantic.error}>
                        Ditarik {formatConsentDate(consent.revoked_at)}
                      </Text>
                    ) : null}
                  </View>
                ))
              )}
            </Card>

            {canRevoke ? (
              <Button
                label="Tarik Persetujuan Proyek Karbon"
                variant="destructive"
                onPress={() => void onRevoke()}
                loading={busy}
                disabled={busy}
              />
            ) : null}
          </View>
        ) : null}

        {status != null && !isFarmer ? (
          <Card style={styles.scopeCard}>
            <Text variant="bodyMedium" color={colors.neutral.ink900}>
              Persetujuan Data Agregat
            </Text>
            <Text variant="caption" color={colors.neutral.ink500}>
              Persetujuan penggunaan data lahan berlaku untuk peran petani.
              Akun korporat dan auditor admin hanya melihat ringkasan agregat demi privasi.
            </Text>
          </Card>
        ) : null}

        {/* Logout Section */}
        <View style={styles.logoutSection}>
          <Button
            label="Keluar dari Akun"
            variant="secondary"
            icon={LogOut}
            onPress={() => void signOut()}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  userCard: {
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
  avatarWrap: {
    width: 52,
    height: 52,
    borderRadius: radii.pill,
    backgroundColor: '#E7F2EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  actionError: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FED7D7',
  },
  skeletonGroup: {
    gap: spacing.md,
  },
  consentSection: {
    gap: spacing.md,
  },
  statusBanner: {
    borderRadius: 18,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.xs,
  },
  statusGranted: {
    backgroundColor: '#EBF5EF',
    borderColor: '#C7E4D1',
  },
  statusRevoked: {
    backgroundColor: '#FFF8F0',
    borderColor: '#FFE2B8',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusTitle: {
    fontWeight: '700',
  },
  historyCard: {
    gap: spacing.sm,
    borderRadius: 18,
    padding: spacing.md,
  },
  historyRow: {
    gap: 2,
  },
  historyDivider: {
    borderTopWidth: 1,
    borderTopColor: '#F0F4F1',
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  historyTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  historyTitle: {
    flex: 1,
    fontWeight: '500',
  },
  scopeCard: {
    gap: spacing.xs,
    borderRadius: 18,
    padding: spacing.md,
  },
  logoutSection: {
    marginTop: spacing.sm,
  },
});