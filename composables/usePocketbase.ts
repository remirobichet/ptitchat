import PocketBase from "pocketbase";

let client: PocketBase | null = null;

function loadAuth(pb: PocketBase) {
  if (import.meta.server) {
    const cookieHeader = useRequestHeaders(["cookie"]).cookie ?? "";
    pb.authStore.loadFromCookie(cookieHeader);
    return;
  }

  pb.authStore.loadFromCookie(document.cookie);
}

function syncAuthCookie(pb: PocketBase) {
  if (import.meta.server) {
    return;
  }

  pb.authStore.onChange(() => {
    if (pb.authStore.isValid) {
      document.cookie = pb.authStore.exportToCookie({
        httpOnly: false,
        sameSite: "Lax",
        secure: window.location.protocol === "https:",
      });
      return;
    }

    document.cookie = pb.authStore.exportToCookie({
      httpOnly: false,
      sameSite: "Lax",
      secure: window.location.protocol === "https:",
      expires: new Date(0),
    });
  });
}

function createClient() {
  const config = useRuntimeConfig();
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
