import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [react({
    jsxRuntime: 'automatic',
    jsxImportSource: '@emotion/react',
  }), svgr()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.jsx"),
      name: "OpenIMISFeLocation",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format === 'es' ? 'es' : 'cjs'}.js`,
    },
    sourcemap: true,
    outDir: "dist",
    rollupOptions: {
      external: [
        /^react$/,
        /^react-dom$/,
        /^react\/jsx-runtime$/,
        /^react\/jsx-dev-runtime$/,
        /^redux$/,
        /^redux-thunk$/,
        /^redux-api-middleware$/,
        /^react-redux$/,
        /^react-intl$/,
        /^react-helmet$/,
        /^react-multi-date-picker$/,
        'prop-types',
        /^react-date-object\/calendars\/gregorian$/,
        /^react-date-object\/locales\/gregorian_en$/,
        'nepali-date-converter',
        'moment',
        /^lodash$/,
        /^lodash\/.*$/,
        'lodash-uuid',
        'classnames',
        'clsx',
        'react-autosuggest',
        /^react-router$/,
        /^react-router-dom$/,
        'history',
        /^@mui\/material/,
        /^@mui\/icons-material/,
        /^@emotion\/react/,
        /^@emotion\/styled/,
        /^@mui\/core\/styles/,
        /^@date-io\/core/,
        /^@date-io\/moment/,
        'zxcvbn',
        /^@babel-.*/,
        /^@date-io\/.*/,
        /^@openimis.*/,
      ],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react/jsx-runtime": "jsxRuntime",
          "react/jsx-dev-runtime": "jsxDevRuntime",
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  optimizeDeps: {
    exclude: ["react-dom"],
  },
});