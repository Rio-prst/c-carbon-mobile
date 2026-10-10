import { router } from 'expo-router';
import { Award, ClipboardList, Gauge, MapPin } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, radii, spacing } from '../lib/theme';
import { Text } from './Text';

type ActionItem = {
  title: string;
  subtitle: string;
  icon: typeof MapPin;
  onPress: () => void;
  accentColor?: string;
};

type Props = {
  onPressFarms?: () => void;
  onPressSubmitData?: () => void;
  onPressScore?: () => void;
  onPressRewards?: () => void;
};

export function QuickActionGrid({
  onPressFarms = () => router.push('/farms'),
  onPressSubmitData,
  onPressScore = () => router.push('/farms'),
  onPressRewards = () => router.push('/rewards'),
}: Props) {
  const actions: ActionItem[] = [
    {
      title: 'Lahan Saya',
      subtitle: 'Kelola lahan terdaftar',
      icon: MapPin,
      onPress: onPressFarms,
      accentColor: colors.brand.forest600,
    },
    {
      title: 'Lapor Musim',
      subtitle: 'Catat panen & pupuk',
      icon: ClipboardList,
      onPress: onPressSubmitData ?? onPressFarms,
      accentColor: colors.accent.earth500,
    },
    {
      title: 'Skor FSS',
      subtitle: 'Ketahanan lahan',
      icon: Gauge,
      onPress: onPressScore,
      accentColor: colors.semantic.info,
    },
    {
      title: 'Katalog Hadiah',
      subtitle: 'Poin & tingkat Anda',
      icon: Award,
      onPress: onPressRewards,
      accentColor: colors.accent.harvest500,
    },
  ];

  return (
    <View style={styles.grid}>
      {actions.map((item, idx) => {
        const Icon = item.icon;
        return (
          <Pressable
            key={idx}
            onPress={item.onPress}
            style={({ pressed }) => [
              styles.card,
              pressed && styles.pressed,
            ]}
          >
            <View
              style={[
                styles.iconWrap,
                { backgroundColor: `${item.accentColor}15` },
              ]}
            >
              <Icon size={22} color={item.accentColor} strokeWidth={2.2} />
            </View>
            <View style={styles.textWrap}>
              <Text variant="bodyMedium" color={colors.neutral.ink900} numberOfLines={1}>
                {item.title}
              </Text>
              <Text variant="caption" color={colors.neutral.ink500} numberOfLines={1}>
                {item.subtitle}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  card: {
    width: '48.5%',
    backgroundColor: colors.neutral.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.neutral.line,
    padding: spacing.md,
    gap: spacing.sm,
    shadowColor: colors.brand.forest900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    gap: 2,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.985 }],
  },
});
