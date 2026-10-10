import { Link, router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Leaf } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Input, Text } from '../../components';
import { ApiClientError } from '../../lib/api';
import { colors, radii, screen as screenTokens, spacing } from '../../lib/theme';
import { useAuth } from '../../store/auth';

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
  form?: string;
};

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const next: FieldErrors = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      next.name = 'Nama lengkap wajib diisi';
    }
    if (!trimmedEmail) {
      next.email = 'Alamat email wajib diisi';
    } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
      next.email = 'Format email tidak valid';
    }
    if (!password) {
      next.password = 'Kata sandi wajib diisi';
    } else if (password.length < 8) {
      next.password = 'Kata sandi minimal 8 karakter';
    }

    setErrors(next);
    if (next.name || next.email || next.password) {
      return;
    }

    setSubmitting(true);
    try {
      await signUp({
        name: trimmedName,
        email: trimmedEmail,
        password,
      });
      router.replace('/');
    } catch (error) {
      setErrors({
        form:
          error instanceof ApiClientError
            ? error.message
            : 'Pendaftaran gagal. Silakan coba kembali.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: Math.max(insets.top + 20, screenTokens.padding * 2) },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.brandBadge}>
          <Leaf size={28} color={colors.brand.forest700} strokeWidth={2.4} />
        </View>

        <View style={styles.header}>
          <Text variant="display" color={colors.brand.forest900}>
            Buat Akun
          </Text>
          <Text variant="body" color={colors.neutral.ink500}>
            Daftar untuk mengelola lahan & akses proyek karbon
          </Text>
        </View>

        {errors.form ? (
          <View style={styles.formErrorCard}>
            <Text variant="caption" color={colors.semantic.error}>
              {errors.form}
            </Text>
          </View>
        ) : null}

        <View style={styles.formGroup}>
          <Input
            label="Nama Lengkap"
            value={name}
            onChangeText={setName}
            error={errors.name}
            autoCapitalize="words"
            autoCorrect={false}
            placeholder="Nama Anda"
            editable={!submitting}
          />
          <Input
            label="Alamat Email"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="nama@email.com"
            editable={!submitting}
          />
          <Input
            label="Kata Sandi"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            secureTextEntry
            autoCapitalize="none"
            placeholder="Minimal 8 karakter"
            editable={!submitting}
          />

          <Button
            label="Daftar Sekarang"
            onPress={() => void handleSubmit()}
            loading={submitting}
            disabled={submitting}
            style={styles.submit}
          />
        </View>

        <View style={styles.footer}>
          <Text variant="body" color={colors.neutral.ink500}>
            Sudah memiliki akun?{' '}
          </Text>
          <Link href="/login" replace>
            <Text variant="bodyMedium" color={colors.brand.forest600}>
              Masuk di sini
            </Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.neutral.surface,
  },
  container: {
    paddingHorizontal: screenTokens.padding,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  brandBadge: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#E7F2EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -spacing.sm,
  },
  header: {
    gap: 4,
  },
  formErrorCard: {
    backgroundColor: '#FFF2F2',
    borderWidth: 1,
    borderColor: '#FED7D7',
    borderRadius: radii.md,
    padding: spacing.md,
  },
  formGroup: {
    gap: spacing.md,
  },
  submit: {
    marginTop: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
});