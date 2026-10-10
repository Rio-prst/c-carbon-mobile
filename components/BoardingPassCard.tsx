import { QrCode, ShieldCheck } from 'lucide-react-native';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radii, spacing } from '../lib/theme';
import { Text } from './Text';

type Props = {
  digitalFarmId: string;
  farmName: string;
  commodity: string;
  landArea: string;
  location: string;
  policyStatus?: string;
  insurerName?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function BoardingPassCard({
  digitalFarmId,
  farmName,
  commodity,
  landArea,
  location,
  policyStatus = 'POLIS AKTIF',
  insurerName = 'Mitra Asuransi Parametrik',
  onPress,
  style,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
        style,
      ]}
    >
      {/* Header Banner - Forest Green */}
      <View style={styles.headerBanner}>
        <View style={styles.headerLeft}>
          <ShieldCheck size={16} color={colors.neutral.white} strokeWidth={2.4} />
          <Text variant="label" color={colors.neutral.white} style={styles.headerText}>
            {policyStatus.toUpperCase()}
          </Text>
        </View>
        <Text variant="caption" color="rgba(255,255,255,0.85)">
          {insurerName}
        </Text>
      </View>

      {/* Main Ticket Body */}
      <View style={styles.body}>
        <View style={styles.topInfo}>
          <View style={styles.farmDetails}>
            <Text variant="caption" color={colors.neutral.ink500}>
              NAMA LAHAN TERDAFTAR
            </Text>
            <Text variant="h2" color={colors.neutral.ink900} numberOfLines={1}>
              {farmName}
            </Text>
          </View>
          <View style={styles.qrBadge}>
            <QrCode size={36} color={colors.brand.forest700} strokeWidth={1.7} />
          </View>
        </View>

        {/* Dashed line divider */}
        <View style={styles.dividerRow}>
          <View style={styles.notchLeft} />
          <View style={styles.dashedLine} />
          <View style={styles.notchRight} />
        </View>

        {/* Data Grid: ID, Commodity, Area, Region */}
        <View style={styles.dataGrid}>
          <View style={styles.gridItem}>
            <Text variant="caption" color={colors.neutral.ink500}>
              DIGITAL FARM ID
            </Text>
            <Text variant="bodyMedium" color={colors.brand.forest700} style={styles.monoId}>
              {digitalFarmId}
            </Text>
          </View>

          <View style={styles.gridItem}>
            <Text variant="caption" color={colors.neutral.ink500}>
              KOMODITAS
            </Text>
            <Text variant="bodyMedium" color={colors.neutral.ink900}>
              {commodity}
            </Text>
          </View>

          <View style={styles.gridItem}>
            <Text variant="caption" color={colors.neutral.ink500}>
              LUAS LAHAN
            </Text>
            <Text variant="bodyMedium" color={colors.neutral.ink900}>
              {landArea}
            </Text>
          </View>

          <View style={styles.gridItem}>
            <Text variant="caption" color={colors.neutral.ink500}>
              LOKASI
            </Text>
            <Text variant="bodyMedium" color={colors.neutral.ink900} numberOfLines={1}>
              {location}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
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
  headerBanner: {
    backgroundColor: colors.brand.forest700,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerText: {
    letterSpacing: 0.5,
  },
  body: {
    padding: spacing.lg,
  },
  topInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  farmDetails: {
    flex: 1,
    gap: 2,
  },
  qrBadge: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: '#F3F7F4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2ECE5',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
    marginHorizontal: -spacing.lg,
  },
  notchLeft: {
    width: 14,
    height: 24,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    backgroundColor: colors.neutral.surface,
    borderWidth: 1,
    borderLeftWidth: 0,
    borderColor: colors.neutral.line,
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: colors.neutral.line,
    borderStyle: 'dashed',
    marginHorizontal: 8,
  },
  notchRight: {
    width: 14,
    height: 24,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    backgroundColor: colors.neutral.surface,
    borderWidth: 1,
    borderRightWidth: 0,
    borderColor: colors.neutral.line,
  },
  dataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  gridItem: {
    width: '47%',
    gap: 2,
  },
  monoId: {
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.995 }],
  },
});
