import type { Config } from 'tailwindcss';
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: { extend: { colors: { terracotta: '#C8442B', safran: '#F2A900', baobab: '#1F5F4A', creme: '#FFF6E8', charbon: '#2B2118' } } },
  plugins: [],
} satisfies Config;
