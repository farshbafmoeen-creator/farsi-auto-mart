# Security Memory

## Accepted SECURITY DEFINER functions callable by `authenticated`

The Supabase linter rule `0029_authenticated_security_definer_function_executable` flags two functions in `public` as warnings. Both are intentional and must remain callable by `authenticated`:

- `public.has_role(uuid, app_role)` — required by RLS policies across the schema. Postgres evaluates policy expressions in the caller's context, so signed-in users need EXECUTE for any policy that references `has_role` to work. Not callable by `anon`.
- `public.create_order_with_items(jsonb, jsonb, bigint)` — the only safe write path for `order_items`. It enforces server-side price and snapshot lookup from `products`, preventing customers from forging `unit_price`. Direct INSERT on `order_items` is now admin-only. Not callable by `anon`.

Do not revoke EXECUTE from `authenticated` on either function and do not re-flag them.

## Storage

- `product-images` bucket is private (workspace blocks public buckets). RLS on `storage.objects` provides public SELECT for that bucket and admin-only writes via `has_role`. Admin uploads should use signed URLs for display when needed.
