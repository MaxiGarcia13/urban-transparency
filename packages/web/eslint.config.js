import { fileURLToPath } from 'node:url';
import { eslintConfig } from '@maxigarcia/eslint-config';

const cssConfig = fileURLToPath(
  new URL('./src/styles/global.css', import.meta.url),
);

export default eslintConfig(
  {
    typescript: true,
    astro: true,
    vue: true,
    tailwindcss: true,
    ignores: [
      '.astro',
      '**/src/config/regions/*-boundary.json',
    ],
  },
  {
    settings: {
      tailwindcss: {
        config: cssConfig,
      },
    },
  },
);
