# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).

Dependencias: 
npm install axios
npm install vue-router
npm i bootstrap-icons
npm install bootstrap
npm install vue3-timepicker


Start app:
npm run dev
npm run build

## Theming and Login Page

- Global base styles live in `src/style.css`.
- Theme tokens and the animated login gradient live in `src/theme.css` and are imported by `App.vue`.
- The login (and signup) routes automatically add the class `theme-login` to the `<body>` via a router hook in `src/router.js`. This enables the special background only on those pages and prevents affecting others.
- `LoginPage.vue` layout is centered and constrained with `max-width: 420px` to avoid stretching on desktop. All its styles are scoped.

To tweak shared colors, edit CSS variables in `src/theme.css` (e.g., `--color-primary`). For login-only tweaks, target `body.theme-login` in `src/theme.css` or adjust the scoped styles inside `LoginPage.vue`.