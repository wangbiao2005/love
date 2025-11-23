import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lifeflow.app',
  appName: 'LifeFlow',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
