module.exports = {
  '*.{ts,js,astro}': ['eslint --fix'],
  '*.ts': () => 'pnpm exec tsc --noEmit --skipLibCheck --pretty false --project tsconfig.json',
  'src/**/*.{ts,js}': ['vitest related --run'],
};
