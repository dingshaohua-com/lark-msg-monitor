import * as path from 'node:path';
import { defineConfig } from '@rspress/core';

export default defineConfig({
  lang: 'zh',
  root: path.join(__dirname, 'docs'),
  title: 'My Site',
  icon: '/rspress-icon.png',
  logo: {
    light: '/rspress-light-logo.png',
    dark: '/rspress-dark-logo.png',
  },
  themeConfig: {
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/dingshaohua-com/proj-tpl/blob/main/react-full-project',
      },
    ],
  },
});
