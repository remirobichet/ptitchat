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
      console.log("[useAuth] initialize user: authStore invalid", {
        side: import.meta.server ? "server" : "client",
      });
      return null;
    }

    const model = pb.authStore.model as Record<string, unknown> | null;
    console.log("[useAuth] initialize user from authStore", {
      side: import.meta.server ? "server" : "client",
      isValid: pb.authStore.isValid,
      model,
    });
    return extractAuthUser(model);
  });

  if (import.meta.client && !clientAuthSyncRegistered) {
    pb.authStore.onChange(() => {
      console.log("[useAuth][client] authStore.onChange", {
        isValid: pb.authStore.isValid,
        model: pb.authStore.model,
      });

      if (!pb.authStore.isValid) {
        user.value = null;
        console.log("[useAuth][client] user cleared because authStore invalid");
        return;
      }

      const model = pb.authStore.model as Record<string, unknown> | null;
      user.value = extractAuthUser(model);
      console.log("[useAuth][client] user updated from authStore", user.value);
    });
    clientAuthSyncRegistered = true;
  }

  const isAuthenticated = computed(() => pb.authStore.isValid && !!user.value);
  const canAccessAdmin = computed(
    () => pb.authStore.isValid && user.value?.verified === true,
  );

  async function login(email: string, password: string) {
    console.log("[useAuth] login start", { email });
    const result = await pb
      .collection("users")
      .authWithPassword(email, password);

    console.log("[useAuth] login success", {
      email,
      record: result.record,
      tokenValid: pb.authStore.isValid,
    });

    const nextUser: AuthUser = {
      id: result.record.id,
      email: result.record.email,
      verified: result.record.verified === true,
    };

    if (!nextUser.verified) {
      console.log("[useAuth] login rejected: user not verified", nextUser);
      pb.authStore.clear();
      user.value = null;
      throw new Error(
        "Votre compte existe mais n'est pas encore valide. Contactez un administrateur.",
      );
    }

    user.value = nextUser;
    console.log("[useAuth] login completed", {
      user: user.value,
      tokenValid: pb.authStore.isValid,
    });
    return user.value;
  }

  function logout() {
    console.log("[useAuth] logout", {
      side: import.meta.server ? "server" : "client",
      user: user.value,
      tokenValid: pb.authStore.isValid,
    });
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
