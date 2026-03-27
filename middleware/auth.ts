export default defineNuxtRouteMiddleware(() => {
  const auth = useAuth();

  if (!auth.canAccessAdmin.value) {
    return navigateTo("/admin/login");
  }

  return undefined;
});
