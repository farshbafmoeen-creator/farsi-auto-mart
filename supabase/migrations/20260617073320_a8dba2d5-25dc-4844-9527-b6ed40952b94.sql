-- 1) user_roles: admin-only writes
DROP POLICY IF EXISTS "admins manage user_roles" ON public.user_roles;
CREATE POLICY "admins manage user_roles"
  ON public.user_roles
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 2) orders: remove direct user INSERT; admins can still insert
DROP POLICY IF EXISTS "users insert own orders" ON public.orders;

DROP POLICY IF EXISTS "admins insert orders" ON public.orders;
CREATE POLICY "admins insert orders"
  ON public.orders
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
