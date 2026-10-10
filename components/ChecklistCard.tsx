import { CheckCircle2, Circle } from 'lucide-react-native';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radii, spacing } from '../lib/theme';
import { Text } from './Text';

export type ChecklistItem = {
  id: string;
  label: string;
  completed: boolean;
};

type Props = {
  title?: string;
  items: ChecklistItem[];
  style?: StyleProp<ViewStyle>;
};

export function ChecklistCard({
  title = 'Kriteria Kelayakan Karbon',
  items,
  style,
}: Props) {
  const completedCount = items.filter((i) => i.completed).length;
  const total = items.length;
  const progressPercent = total > 0 ? (completedCount / total) * 100 : 0;

  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        <Text variant="h3" color={colors.neutral.ink900}>
          {title}
        </Text>
        <Text variant="caption" color={colors.neutral.ink500}>
          {completedCount} dari {total} terpenuhi
        </Text>
      </View>

      {/* Progress Track */}
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progressPercent}%` }]} />
      </View>

      {/* Items */}
      <View style={styles.itemList}>
        {items.map((item) => (
          <View key={item.id} style={styles.row}>
            {item.completed ? (
              <CheckCircle2 size={18} color={colors.semantic.success} strokeWidth={2.2} />
            ) : (
              <Circle size={18} color={colors.neutral.ink300} strokeWidth={1.8} />
            )}
            <Text
              variant="body"
              color={item.completed ? colors.neutral.ink900 : colors.neutral.ink500}
              style={[styles.itemText, item.completed && styles.completedText]}
            >
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.neutral.line,
    padding: spacing.lg,
    gap: spacing.md,
    shadowColor: colors.brand.forest900,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  track: {
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: '#E8EFEA',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radii.pill,
    backgroundColor: colors.brand.forest600,
  },
  itemList: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  itemText: {
    flex: 1,
  },
  completedText: {
    fontWeight: '500',
  },
});
