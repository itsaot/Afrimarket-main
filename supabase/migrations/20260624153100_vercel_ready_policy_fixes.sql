INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Buyers can view items in their orders" ON public.order_items;
DROP POLICY IF EXISTS "Vendors can view their order items" ON public.order_items;
DROP POLICY IF EXISTS "Vendors can view orders for their products" ON public.orders;
DROP POLICY IF EXISTS "Products are publicly viewable" ON public.products;
DROP POLICY IF EXISTS "Vendors can insert their own products" ON public.products;
DROP POLICY IF EXISTS "Signed in users can insert their own products" ON public.products;
DROP POLICY IF EXISTS "Vendors can update their own products" ON public.products;
DROP POLICY IF EXISTS "Vendors can delete their own products" ON public.products;

CREATE POLICY "Products are publicly viewable"
ON public.products
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Signed in users can insert their own products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = vendor_id);

CREATE POLICY "Vendors can update their own products"
ON public.products
FOR UPDATE
TO authenticated
USING (auth.uid() = vendor_id)
WITH CHECK (auth.uid() = vendor_id);

CREATE POLICY "Vendors can delete their own products"
ON public.products
FOR DELETE
TO authenticated
USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can view their order items"
ON public.order_items
FOR SELECT
TO authenticated
USING (vendor_id = auth.uid());

CREATE POLICY "Buyers can view their own order items"
ON public.order_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.orders o
    WHERE o.id = order_items.order_id
      AND o.buyer_id = auth.uid()
  )
);
