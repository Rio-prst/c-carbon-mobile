import Svg, { Circle } from 'react-native-svg';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radii, spacing } from '../lib/theme';
import { Text } from './Text';

type Props = {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  title?: string;
  subtitle?: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
};

export function CircularGauge({
  percentage,
  size = 72,
  strokeWidth = 7,
  title = 'Kesiapan Proyek',
  subtitle = 'Kandidat Karbon',
  style,
  onPress,
}: Props) {
  const clamped = Math.max(0, Math.min(100, Math.round(percentage)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * clamped) / 100;

  const content = (
    <View style={[styles.card, style]}>
      <View style={styles.contentRow}>
        <View style={styles.gaugeWrap}>
          <Svg width={size} height={size}>
            {/* Background Circle Track */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#E2EBE5"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Progress Stroke */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={colors.brand.forest600}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              rotation="-90"
              origin={`${size / 2}, ${size / 2}`}
            />
          </Svg>
          <View style={styles.labelCenter}>
            <Text variant="bodyMedium" color={colors.brand.forest900} style={styles.percentText}>
              {clamped}%
            </Text>
          </View>
        </View>

        <View style={styles.textWrap}>
          <Text variant="caption" color={colors.neutral.ink500}>
            {subtitle.toUpperCase()}
          </Text>
          <Text variant="h3" color={colors.neutral.ink900}>
            {title}
          </Text>
          <Text variant="caption" color={colors.brand.forest700} style={styles.statusMeta}>
            {clamped >= 75 ? 'Memenuhi Standar' : clamped >= 50 ? 'Sedang Diproses' : 'Perlu Lengkapi Data'}
          </Text>
        </View>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [pressed && { opacity: 0.85 }]}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.neutral.line,
    padding: spacing.md,
    shadowColor: colors.brand.forest900,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  gaugeWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  labelCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentText: {
    fontWeight: '700',
    fontSize: 14,
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  statusMeta: {
    fontWeight: '600',
    marginTop: 2,
  },
});
