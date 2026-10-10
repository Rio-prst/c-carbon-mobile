import { ChevronRight } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, radii, spacing } from '../lib/theme';
import { StatusBadge } from './StatusBadge';
import { Text } from './Text';

type Props = {
  stepNumber: number | string;
  title: string;
  subtitle: string;
  statusLabel?: string;
  statusTone?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  isLast?: boolean;
  onPress?: () => void;
};

export function TimelineStep({
  stepNumber,
  title,
  subtitle,
  statusLabel,
  statusTone = 'neutral',
  isLast = false,
  onPress,
}: Props) {
  return (
    <View style={styles.stepContainer}>
      {/* Left indicator with connecting line */}
      <View style={styles.indicatorCol}>
        <View style={styles.stepCircle}>
          <Text variant="caption" color={colors.neutral.white} style={styles.circleText}>
            {stepNumber}
          </Text>
        </View>
        {!isLast ? <View style={styles.connectingLine} /> : null}
      </View>

      {/* Right Content Card */}
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        style={({ pressed }) => [
          styles.contentCard,
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.titleWrap}>
            <Text variant="bodyMedium" color={colors.neutral.ink900}>
              {title}
            </Text>
            <Text variant="caption" color={colors.neutral.ink500}>
              {subtitle}
            </Text>
          </View>
          {statusLabel ? (
            <StatusBadge label={statusLabel} tone={statusTone} />
          ) : null}
        </View>
        {onPress ? (
          <View style={styles.actionRow}>
            <Text variant="caption" color={colors.brand.forest700}>
              Lihat Detail
            </Text>
            <ChevronRight size={14} color={colors.brand.forest700} />
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  stepContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  indicatorCol: {
    alignItems: 'center',
    width: 32,
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: radii.pill,
    backgroundColor: colors.brand.forest700,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleText: {
    fontWeight: '700',
    fontSize: 12,
  },
  connectingLine: {
    width: 2,
    flex: 1,
    minHeight: 36,
    backgroundColor: '#D0DDD4',
    marginVertical: 4,
  },
  contentCard: {
    flex: 1,
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.neutral.line,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  titleWrap: {
    flex: 1,
    gap: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 4,
  },
  pressed: {
    opacity: 0.8,
  },
});
