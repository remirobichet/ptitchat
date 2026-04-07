type AuthUser = {
  id: string;
  email?: string;
  verified: boolean;
};

let clientAuthSyncRegistered = false;

function extractAuthUser(
  model: Record<string, unknown> | null,
): AuthUser | null {
  if (!model || typeof model !== "object" || !("id" in model)) {
    return null;
  }

  return {
    id: String(model.id),
    email: typeof model.email === "string" ? model.email : undefined,
    verified: model.verified === true,
  };
}

export function useAuth() {
  const pb = usePocketbase();
  const user = useState<AuthUser | null>("auth-user", () => {
    if (!pb.authStore.isValid) {
      return null;
    }

    const model = pb.authStore.model as Record<string, unknown> | null;
    return extractAuthUser(model);
  });

  if (import.meta.client && !clientAuthSyncRegistered) {
    pb.authStore.onChange(() => {
      if (!pb.authStore.isValid) {
        user.value = null;
        return;
      }

      const model = pb.authStore.model as Record<string, unknown> | null;
      user.value = extractAuthUser(model);
    });
    clientAuthSyncRegistered = true;
  }

  const isAuthenticated = computed(() => pb.authStore.isValid && !!user.value);
  const canAccessAdmin = computed(
    () => pb.authStore.isValid && user.value?.verified === true,
  );

  async function login(email: string, password: string) {
    const result = await pb
      .collection("users")
      .authWithPassword(email, password);

    const nextUser: AuthUser = {
      id: result.record.id,
      email: result.record.email,
      verified: result.record.verified === true,
    };

    if (!nextUser.verified) {
      pb.authStore.clear();
      user.value = null;
      throw new Error(
        "Votre compte existe mais n'est pas encore valide. Contactez un administrateur.",
      );
    }

    user.value = nextUser;
    return user.value;
  }

  function logout() {
    pb.authStore.clear();
    user.value = null;
  }

  return {
    user,
    isAuthenticated,
    canAccessAdmin,
    login,
    logout,
  };
}
