import { StatusBar } from 'expo-status-bar';
import {
  ScrollView,
  ScrollViewProps,
  StyleProp,
  StyleSheet,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, screen as screenTokens } from '../lib/theme';

type Props = Omit<ViewProps, 'style'> &
  Omit<ScrollViewProps, 'style' | 'contentContainerStyle'> & {
    padded?: boolean;
    scroll?: boolean;
    header?: React.ReactNode;
    bottomNav?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
  };

export function Screen({
  padded = true,
  scroll = false,
  header,
  bottomNav,
  style,
  children,
  ...rest
}: Props) {
  const insets = useSafeAreaInsets();

  const contentStyle: StyleProp<ViewStyle> = [
    styles.content,
    {
      paddingTop: header ? 8 : Math.max(insets.top, screenTokens.padding),
      paddingLeft: padded ? screenTokens.padding : 0,
      paddingRight: padded ? screenTokens.padding : 0,
      paddingBottom: bottomNav
        ? 8
        : Math.max(insets.bottom, screenTokens.padding),
    },
    style,
  ];

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      {header}
      {scroll ? (
        <ScrollView
          style={styles.scrollBase}
          contentContainerStyle={contentStyle}
          keyboardShouldPersistTaps="handled"
          {...rest}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.scrollBase, contentStyle]} {...rest}>
          {children}
        </View>
      )}
      {bottomNav}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.neutral.surface,
  },
  scrollBase: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
});