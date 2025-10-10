// frontend/src/router/index.js
// Central place to declare high-level route metadata if needed by
// analytics or documentation features. The main routing logic lives in
// `App.jsx`, so we export a lightweight reference list here to avoid
// eslint parsing errors while keeping the file available for future use.

const routes = [
  {
    path: '/',
    name: 'home',
    requiresAuth: false,
  },
  {
    path: '/login',
    name: 'login',
    requiresAuth: false,
  },
  {
    path: '/profile',
    name: 'profile',
    requiresAuth: true,
  },
];

export default routes;