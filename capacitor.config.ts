import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lakasinfo.app',
  appName: 'LakasInfo',
  webDir: 'public',
  appendUserAgent: "LakasInfoApp",
  server: {
    url: 'https://lakas-info-v2.vercel.app',
    cleartext: true
  }
};

export default config;