import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lakasinfo.app',
  appName: 'LakasInfo',
  webDir: 'public',
  server: {
    url: 'https://IDE_IRD_AZ_ELES_URL_CIMEDET.com',
    cleartext: true
  }
};

export default config;