
-- 1) Grant EXECUTE on has_role (fixes "permission denied for function has_role")
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, anon;

-- 2) order_items: remove client-side INSERT, add admin write paths
DROP POLICY IF EXISTS "users insert own order_items" ON public.order_items;

CREATE POLICY "admins insert order_items"
  ON public.order_items FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins update order_items"
  ON public.order_items FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins delete order_items"
  ON public.order_items FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 3) Security-definer RPC for safe order creation (server-side price lookup)
CREATE OR REPLACE FUNCTION public.create_order_with_items(
  _items jsonb,           -- [{product_id: uuid, quantity: int}, ...]
  _shipping_address jsonb,
  _shipping_cost bigint DEFAULT 0
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _order_id uuid;
  _subtotal bigint := 0;
  _item jsonb;
  _product record;
  _qty int;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF jsonb_typeof(_items) <> 'array' OR jsonb_array_length(_items) = 0 THEN
    RAISE EXCEPTION 'No items';
  END IF;

  -- Validate items, compute subtotal from DB prices
  FOR _item IN SELECT * FROM jsonb_array_elements(_items) LOOP
    _qty := COALESCE((_item->>'quantity')::int, 0);
    IF _qty <= 0 OR _qty > 1000 THEN
      RAISE EXCEPTION 'Invalid quantity';
    END IF;
    SELECT id, title_fa, slug, price, stock, brand, images, is_active
      INTO _product FROM public.products
      WHERE id = (_item->>'product_id')::uuid;
    IF NOT FOUND OR NOT _product.is_active THEN
      RAISE EXCEPTION 'Product unavailable';
    END IF;
    IF _product.stock < _qty THEN
      RAISE EXCEPTION 'Insufficient stock for %', _product.title_fa;
    END IF;
    _subtotal := _subtotal + (_product.price * _qty);
  END LOOP;

  INSERT INTO public.orders (user_id, status, subtotal, shipping_cost, total, shipping_address)
  VALUES (_uid, 'pending_payment', _subtotal, _shipping_cost, _subtotal + _shipping_cost, _shipping_address)
  RETURNING id INTO _order_id;

  -- Insert items with snapshot from DB (not client)
  FOR _item IN SELECT * FROM jsonb_array_elements(_items) LOOP
    _qty := (_item->>'quantity')::int;
    SELECT id, title_fa, slug, price, brand, images
      INTO _product FROM public.products
      WHERE id = (_item->>'product_id')::uuid;

    INSERT INTO public.order_items (order_id, product_id, quantity, unit_price, product_snapshot)
    VALUES (
      _order_id,
      _product.id,
      _qty,
      _product.price,
      jsonb_build_object(
        'title_fa', _product.title_fa,
        'slug', _product.slug,
        'brand', _product.brand,
        'image', COALESCE(_product.images[1], '')
      )
    );

    -- Decrement stock
    UPDATE public.products SET stock = stock - _qty WHERE id = _product.id;
  END LOOP;

  RETURN _order_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_order_with_items(jsonb, jsonb, bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_order_with_items(jsonb, jsonb, bigint) TO authenticated;

-- 4) Storage policies for the product-images bucket
CREATE POLICY "product-images public read"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'product-images');

CREATE POLICY "product-images admin insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "product-images admin update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "product-images admin delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));
