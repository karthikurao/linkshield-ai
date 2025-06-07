import ProfileView from '@/views/ProfileView.vue'

// Check that route exists
{
  path: '/profile',
  name: 'profile',
  component: ProfileView,
  meta: { requiresAuth: true }
}