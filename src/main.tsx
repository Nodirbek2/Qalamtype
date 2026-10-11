import { getCanonicalNavigationTarget } from './lib/authRedirect';

// Redirect before importing Supabase so OAuth fragments are consumed on the public origin.
const target = getCanonicalNavigationTarget(window.location.href);
if (target) {
  window.location.replace(target);
} else {
  void import('./bootstrap');
}
