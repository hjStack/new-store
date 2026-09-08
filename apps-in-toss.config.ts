import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: '송파구-오픈하는-식당을-알려드려요',
  brand: {
    primaryColor: '#3182F6', // 화면에 노출될 앱의 기본 색상으로 바꿔주세요.
  },
  permissions: [],
  webBundleDir: 'history',
});
