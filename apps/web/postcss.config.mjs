import {fileURLToPath} from 'node:url';
// SPEC-UX-310: «theme-colors» convierte los colores en variables de tema (con su valor original como respaldo).
const themeColors=fileURLToPath(new URL('./scripts/theme-colors.cjs',import.meta.url));
const config = { plugins: { "@tailwindcss/postcss": {}, [themeColors]: {} } };
export default config;
