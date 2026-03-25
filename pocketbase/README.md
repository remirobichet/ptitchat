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
