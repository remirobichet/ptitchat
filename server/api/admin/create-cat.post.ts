export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body?.name || !body?.slug) {
    throw createError({ statusCode: 400, statusMessage: "name and slug are required" })
  }

  return {
    ok: true,
    message: "Base endpoint created. Implement PocketBase create-cat flow here."
  }
})
