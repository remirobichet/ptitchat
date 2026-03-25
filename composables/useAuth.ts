type AuthUser = {
  id: string;
  email?: string;
};

function extractAuthUser(
  model: Record<string, unknown> | null,
): AuthUser | null {
  if (!model || typeof model !== "object" || !("id" in model)) {
    return null;
  }

  return {
    id: String(model.id),
    email: typeof model.email === "string" ? model.email : undefined,
  };
}

export function useAuth() {
  const pb = usePocketbase();
  const authSyncRegistered = useState<boolean>(
    "auth-sync-registered",
    () => false,
  );
  const user = useState<AuthUser | null>("auth-user", () => {
    const model = pb.authStore.model as Record<string, unknown> | null;
    return extractAuthUser(model);
  });

  if (!authSyncRegistered.value) {
    pb.authStore.onChange(() => {
      const model = pb.authStore.model as Record<string, unknown> | null;
      user.value = extractAuthUser(model);
    });
    authSyncRegistered.value = true;
  }

  const isAuthenticated = computed(() => !!user.value);

  async function login(email: string, password: string) {
    const result = await pb
      .collection("users")
      .authWithPassword(email, password);
    user.value = {
      id: result.record.id,
      email: result.record.email,
    };
    return user.value;
  }

  function logout() {
    pb.authStore.clear();
    user.value = null;
  }

  return {
    user,
    isAuthenticated,
    login,
    logout,
  };
}
