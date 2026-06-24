-- AfriMarket Supabase setup
-- Copy this whole file into Supabase SQL Editor and run it.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('buyer', 'vendor', 'admin');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_category') THEN
    CREATE TYPE public.product_category AS ENUM ('Fashion', 'Beauty', 'Food', 'Home Decor', 'Agriculture', 'Electronics');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'shipped', 'completed', 'cancelled');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  business_name TEXT,
  bio TEXT,
  country TEXT,
  avatar_url TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  currency TEXT NOT NULL DEFAULT 'ZAR',
  category public.product_category NOT NULL,
  image_url TEXT,
  views INTEGER NOT NULL DEFAULT 0,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_phone TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  total NUMERIC(12, 2) NOT NULL,
  status public.order_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  vendor_id UUID NOT NULL,
  product_name TEXT NOT NULL,
  unit_price NUMERIC(12, 2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  vendor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS products_vendor_idx ON public.products(vendor_id);
CREATE INDEX IF NOT EXISTS products_category_idx ON public.products(category);
CREATE INDEX IF NOT EXISTS order_items_order_idx ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS order_items_vendor_idx ON public.order_items(vendor_id);
CREATE INDEX IF NOT EXISTS inquiries_vendor_idx ON public.inquiries(vendor_id);

ALTER TABLE public.products ALTER COLUMN currency SET DEFAULT 'ZAR';

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT SELECT ON public.products TO anon;
GRANT ALL ON public.products TO service_role;
GRANT SELECT, INSERT ON public.orders TO authenticated;
GRANT INSERT ON public.orders TO anon;
GRANT ALL ON public.orders TO service_role;
GRANT SELECT, INSERT ON public.order_items TO authenticated;
GRANT INSERT ON public.order_items TO anon;
GRANT ALL ON public.order_items TO service_role;
GRANT SELECT, INSERT ON public.inquiries TO authenticated;
GRANT INSERT ON public.inquiries TO anon;
GRANT ALL ON public.inquiries TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Profiles are publicly viewable" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Products are publicly viewable" ON public.products;
DROP POLICY IF EXISTS "Vendors can insert their own products" ON public.products;
DROP POLICY IF EXISTS "Signed in users can insert their own products" ON public.products;
DROP POLICY IF EXISTS "Vendors can update their own products" ON public.products;
DROP POLICY IF EXISTS "Vendors can delete their own products" ON public.products;
DROP POLICY IF EXISTS "Anyone can submit an order" ON public.orders;
DROP POLICY IF EXISTS "Buyers can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Vendors can view orders for their products" ON public.orders;
DROP POLICY IF EXISTS "Anyone can insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Vendors can view their order items" ON public.order_items;
DROP POLICY IF EXISTS "Buyers can view items in their orders" ON public.order_items;
DROP POLICY IF EXISTS "Buyers can view their own order items" ON public.order_items;
DROP POLICY IF EXISTS "Anyone can submit an inquiry" ON public.inquiries;
DROP POLICY IF EXISTS "Vendors can view their inquiries" ON public.inquiries;

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Profiles are publicly viewable"
ON public.profiles
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

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

CREATE POLICY "Anyone can submit an order"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(buyer_name) > 0
  AND length(buyer_email) > 2
  AND length(buyer_phone) > 0
  AND length(shipping_address) > 0
  AND total >= 0
);

CREATE POLICY "Buyers can view their own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (auth.uid() = buyer_id);

CREATE POLICY "Anyone can insert order items"
ON public.order_items
FOR INSERT
TO anon, authenticated
WITH CHECK (quantity > 0 AND unit_price >= 0 AND length(product_name) > 0);

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

CREATE POLICY "Anyone can submit an inquiry"
ON public.inquiries
FOR INSERT
TO anon, authenticated
WITH CHECK (length(buyer_name) > 0 AND length(buyer_email) > 2 AND length(message) > 0);

CREATE POLICY "Vendors can view their inquiries"
ON public.inquiries
FOR SELECT
TO authenticated
USING (auth.uid() = vendor_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS products_updated_at ON public.products;
CREATE TRIGGER products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, business_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'business_name'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'role', '')::public.app_role, 'buyer')
  )
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

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

DROP POLICY IF EXISTS "Product images are publicly viewable" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own product images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own product images" ON storage.objects;

CREATE POLICY "Product images are publicly viewable"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own product images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own product images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);
