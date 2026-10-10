import { router, usePathname } from 'expo-router';
import {
  Award,
  Building2,
  ClipboardCheck,
  Home,
  Leaf,
  MapPin,
  UserRound,
} from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, spacing } from '../lib/theme';
import { useAuth } from '../store/auth';
import { Text } from './Text';

export function BottomNav() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  const role = user?.role ?? 'FARMER';

  const items = (() => {
    if (role === 'CORPORATE') {
      return [
        { key: 'home', label: 'Beranda', icon: Home, route: '/' },
        { key: 'corporate', label: 'Ringkasan', icon: Building2, route: '/corporate' },
        { key: 'projects', label: 'Proyek', icon: Leaf, route: '/corporate/projects' },
        { key: 'profile', label: 'Profil', icon: UserRound, route: '/profile' },
      ];
    }
    if (role === 'ADMIN') {
      return [
        { key: 'home', label: 'Beranda', icon: Home, route: '/' },
        { key: 'review', label: 'Review', icon: ClipboardCheck, route: '/admin/review' },
        { key: 'projects', label: 'Proyek', icon: Leaf, route: '/admin/projects' },
        { key: 'profile', label: 'Profil', icon: UserRound, route: '/profile' },
      ];
    }
    // Default FARMER
    return [
      { key: 'home', label: 'Beranda', icon: Home, route: '/' },
      { key: 'farms', label: 'Lahan', icon: MapPin, route: '/farms' },
      { key: 'carbon', label: 'Karbon', icon: Leaf, route: '/carbon/projects' },
      { key: 'rewards', label: 'Hadiah', icon: Award, route: '/rewards' },
      { key: 'profile', label: 'Profil', icon: UserRound, route: '/profile' },
    ];
  })();

  const isActive = (route: string) => {
    if (route === '/') {
      return pathname === '/' || pathname === '';
    }
    return pathname.startsWith(route);
  };

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom, spacing.xs) },
      ]}
    >
      {items.map((item) => {
        const active = isActive(item.route);
        const Icon = item.icon;
        const iconColor = active ? colors.brand.forest700 : colors.neutral.ink500;
        const textColor = active ? colors.brand.forest900 : colors.neutral.ink500;

        return (
          <Pressable
            key={item.key}
            onPress={() => {
              if (!active) {
                router.replace(item.route as any);
              }
            }}
            style={({ pressed }) => [
              styles.tab,
              pressed && styles.pressed,
            ]}
          >
            <View
              style={[
                styles.iconWrap,
                active && styles.activeIconWrap,
              ]}
            >
              <Icon size={20} color={iconColor} strokeWidth={active ? 2.4 : 1.8} />
            </View>
            <Text
              variant="caption"
              color={textColor}
              style={[styles.label, active && styles.activeLabel]}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.neutral.white,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.line,
    paddingTop: 6,
    paddingHorizontal: 6,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    gap: 2,
  },
  iconWrap: {
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: radii.pill,
  },
  activeIconWrap: {
    backgroundColor: '#E7EFE9', // subtle forest tint
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
  },
  activeLabel: {
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.65,
  },
});
