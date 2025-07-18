// Run this in browser console to clear auto-login
localStorage.removeItem('cookify_token');
sessionStorage.clear();
console.log('✅ Session cleared - page will reload without auto-login');
location.reload();