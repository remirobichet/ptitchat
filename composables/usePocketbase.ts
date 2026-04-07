import PocketBase from "pocketbase";

let client: PocketBase | null = null;

function loadAuth(pb: PocketBase) {
  if (import.meta.server) {
    const cookieHeader = useRequestHeaders(["cookie"]).cookie ?? "";
    console.log("[usePocketbase][server] loadAuth cookie", cookieHeader);
    pb.authStore.loadFromCookie(cookieHeader);
    console.log("[usePocketbase][server] loadAuth state", {
      isValid: pb.authStore.isValid,
      model: pb.authStore.model,
    });
    return;
  }

  console.log("[usePocketbase][client] loadAuth cookie", document.cookie);
  pb.authStore.loadFromCookie(document.cookie);
  console.log("[usePocketbase][client] loadAuth state", {
    isValid: pb.authStore.isValid,
    model: pb.authStore.model,
  });
}

function syncAuthCookie(pb: PocketBase) {
  if (import.meta.server) {
    return;
  }

  pb.authStore.onChange(() => {
    console.log(
      "[usePocketbase][client] authStore.onChange before cookie sync",
      {
        isValid: pb.authStore.isValid,
        model: pb.authStore.model,
      },
    );

    if (pb.authStore.isValid) {
      document.cookie = pb.authStore.exportToCookie({
        httpOnly: false,
        sameSite: "Lax",
        secure: window.location.protocol === "https:",
      });
      console.log(
        "[usePocketbase][client] auth cookie written",
        document.cookie,
      );
      return;
    }

    document.cookie = pb.authStore.exportToCookie({
      httpOnly: false,
      sameSite: "Lax",
      secure: window.location.protocol === "https:",
      expires: new Date(0),
    });
    console.log("[usePocketbase][client] auth cookie cleared", document.cookie);
  });
}

function createClient() {
  const config = useRuntimeConfig();
  console.log("[usePocketbase] createClient", {
    side: import.meta.server ? "server" : "client",
    pocketbaseUrl: config.public.pocketbaseUrl,
  });
  const pb = new PocketBase(config.public.pocketbaseUrl);

  pb.autoCancellation(false);
  loadAuth(pb);
  syncAuthCookie(pb);

  return pb;
}

export function usePocketbase() {
  if (import.meta.server) {
    return createClient();
  }

  if (!client) {
    client = createClient();
  }

  return client;
}
