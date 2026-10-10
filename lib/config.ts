import { Platform } from 'react-native';

const envUrl = process.env.EXPO_PUBLIC_API_URL;

/**
 * Base URL API NestJS yang adaptif terhadap platform:
 * - Web (Chrome/browser): menggunakan http://localhost:3000 (karena 10.0.2.2 tidak bisa diakses browser)
 * - Android Emulator: menggunakan http://10.0.2.2:3000 (karena localhost di emulator merujuk ke dirinya sendiri)
 * - iOS Simulator / Lainnya: menggunakan http://localhost:3000
 */
export const API_BASE_URL: string = (() => {
  if (Platform.OS === 'web') {
    if (!envUrl || envUrl.includes('10.0.2.2')) {
      return 'http://localhost:3000';
    }
    return envUrl;
  }

  if (Platform.OS === 'android') {
    if (!envUrl || envUrl.includes('localhost')) {
      return 'http://10.0.2.2:3000';
    }
    return envUrl;
  }

  return envUrl ?? 'http://localhost:3000';
})();