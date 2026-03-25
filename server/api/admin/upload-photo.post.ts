export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body || !body.catId) {
    throw createError({ statusCode: 400, statusMessage: "Missing catId" })
  }

  return {
    ok: true,
    message: "Base endpoint created. Implement PocketBase upload flow here."
  }
})
