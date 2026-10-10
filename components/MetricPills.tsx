import { Leaf, MapPin, Sprout } from 'lucide-react-native';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radii, spacing } from '../lib/theme';
import { Text } from './Text';

type MetricItem = {
  label: string;
  value: string;
  type: 'area' | 'yield' | 'carbon';
};

type Props = {
  metrics: MetricItem[];
  style?: StyleProp<ViewStyle>;
};

export function MetricPills({ metrics, style }: Props) {
  const getIcon = (type: MetricItem['type']) => {
    switch (type) {
      case 'area':
        return <MapPin size={16} color={colors.brand.forest600} />;
      case 'yield':
        return <Sprout size={16} color={colors.accent.harvest500} />;
      case 'carbon':
        return <Leaf size={16} color={colors.semantic.success} />;
    }
  };

  return (
    <View style={[styles.container, style]}>
      {metrics.map((item, idx) => (
        <View key={idx} style={styles.pill}>
          <View style={styles.iconWrap}>{getIcon(item.type)}</View>
          <View style={styles.textWrap}>
            <Text variant="caption" color={colors.neutral.ink500} numberOfLines={1}>
              {item.label}
            </Text>
            <Text variant="bodyMedium" color={colors.neutral.ink900} numberOfLines={1}>
              {item.value}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.neutral.line,
    borderRadius: radii.lg,
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 8,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: radii.pill,
    backgroundColor: '#F2F6F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
    gap: 1,
  },
});
