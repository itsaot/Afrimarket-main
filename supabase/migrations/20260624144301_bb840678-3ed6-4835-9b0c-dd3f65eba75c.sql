
DROP POLICY "Anyone can submit an order" ON public.orders;
DROP POLICY "Anyone can insert order items" ON public.order_items;
DROP POLICY "Anyone can submit an inquiry" ON public.inquiries;

CREATE POLICY "Anyone can submit an order" ON public.orders FOR INSERT TO anon, authenticated
WITH CHECK (length(buyer_name) > 0 AND length(buyer_email) > 2 AND length(buyer_phone) > 0 AND length(shipping_address) > 0 AND total >= 0);

CREATE POLICY "Anyone can insert order items" ON public.order_items FOR INSERT TO anon, authenticated
WITH CHECK (quantity > 0 AND unit_price >= 0 AND length(product_name) > 0);

CREATE POLICY "Anyone can submit an inquiry" ON public.inquiries FOR INSERT TO anon, authenticated
WITH CHECK (length(buyer_name) > 0 AND length(buyer_email) > 2 AND length(message) > 0);

REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
