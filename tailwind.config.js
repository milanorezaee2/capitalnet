/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  safelist: [
    // FS_CLASS font sizes — explicitly listed so Tailwind JIT never purges them
    // (values are assembled dynamically at runtime from a Record object)
    'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl',
    'md:text-base', 'md:text-lg', 'md:text-xl', 'md:text-2xl', 'md:text-3xl', 'md:text-4xl', 'md:text-5xl',
    'font-semibold', 'font-bold', 'font-black',
    // ALIGN_CLASS — used dynamically via ac()
    'text-right', 'text-center', 'text-left',
    // Hero flex alignment — used dynamically from settings.home_hero_title_align
    'justify-start', 'justify-center', 'justify-end',
    'items-start', 'items-center', 'items-end',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
