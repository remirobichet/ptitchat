# PocketBase bootstrap files

This directory contains import/bootstrap files for the cat gallery data model.

## Files

- `collections.schema.json`: collection definitions for `cats` and `photos`.
- `seed.records.json`: example records to bootstrap content quickly.

## Importing collections

Use the PocketBase Admin UI:

1. Open `/_/` in your PocketBase instance.
2. Go to **Settings -> Import collections** (or the collections import action).
3. Import `pocketbase/collections.schema.json`.

`collections.schema.json` is now in PocketBase export-compatible format (with `id`, flat field options and `fields`).
If import still fails, your PB instance may be older/newer and require a slightly different schema shape.

## Seeding records

`seed.records.json` is an application-level seed file. It is not uploaded directly as-is by PocketBase.

Recommended workflow:

1. Create `cats` from the file first.
2. Upload images for `coverImage` (cats) and `image` (photos).
3. Create `photos` records referencing the created cat IDs.

You can automate this with a script using the PocketBase JS SDK and a superuser token.

## Migration checklist: remove `photos.published`

1. In PocketBase Admin UI, open the `photos` collection and remove the `published` field.
2. Update `photos` API rules that reference `published`.
3. Drop `idx_photos_published` if it still exists in your database.
4. Re-import `pocketbase/collections.schema.json` for fresh environments.
5. Use `pocketbase/seed.records.json` as the new source for sample `photos` records (without `published`).
6. Verify app flows:
   - admin uploads multiple photos
   - admin edits per-photo captions
   - public cat page lists photos for the selected cat
