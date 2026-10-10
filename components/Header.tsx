import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, spacing } from '../lib/theme';
import { Text } from './Text';

type Props = {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Header({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
  style,
}: Props) {
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: Math.max(insets.top, spacing.sm) },
        style,
      ]}
    >
      <View style={styles.navRow}>
        {showBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Kembali"
            onPress={handleBack}
            hitSlop={8}
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          >
            <ArrowLeft size={20} color={colors.brand.forest700} strokeWidth={2.4} />
          </Pressable>
        ) : null}

        <View style={styles.titleWrap}>
          {title ? (
            <Text variant="h2" color={colors.brand.forest900} numberOfLines={1}>
              {title}
            </Text>
          ) : null}
        </View>

        {rightAction ? (
          <View style={styles.rightAction}>{rightAction}</View>
        ) : null}
      </View>

      {subtitle ? (
        <Text variant="caption" color={colors.neutral.ink500} style={styles.subtitle}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral.surface,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  navRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: radii.pill,
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.neutral.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  rightAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  subtitle: {
    marginTop: -2,
    paddingLeft: spacing.xs,
  },
  pressed: {
    opacity: 0.75,
    backgroundColor: '#EDF1EE',
  },
});
