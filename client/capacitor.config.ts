import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nourishneural.app',
  appName: 'Nourish Neural',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // During development, point to your local dev server so you get hot reload
    // Comment this out for production builds
    // url: 'http://YOUR_LOCAL_IP:3050',
    // cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#fefdfb',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#fefdfb',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },
  android: {
    allowMixedContent: true,
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    }
  },
  ios: {
    contentInset: 'automatic',
    scheme: 'Nourish Neural',
  }
};

export default config;
