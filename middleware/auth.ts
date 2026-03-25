export default defineNuxtRouteMiddleware(() => {
  const auth = useAuth()

  if (!auth.isAuthenticated.value) {
    return navigateTo("/admin/login")
  }

  return undefined
})
