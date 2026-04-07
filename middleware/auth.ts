export default defineNuxtRouteMiddleware(() => {
  const auth = useAuth();

  console.log("[middleware/auth] check", {
    side: import.meta.server ? "server" : "client",
    user: auth.user.value,
    canAccessAdmin: auth.canAccessAdmin.value,
  });

  if (!auth.canAccessAdmin.value) {
    console.log("[middleware/auth] redirecting to /admin/login");
    return navigateTo("/admin/login");
  }

  console.log("[middleware/auth] access granted");
  return undefined;
});
