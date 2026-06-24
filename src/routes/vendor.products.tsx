import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Sparkles, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { CATEGORIES, type Category } from "@/lib/categories";
import { uploadProductImage } from "@/lib/storage";
import { formatPrice } from "@/lib/format";
import { useServerFn } from "@tanstack/react-start";
import { generateProductDescription } from "@/lib/ai.functions";

export const Route = createFileRoute("/vendor/products")({
  component: VendorProducts,
});

interface ProductRow {
  id: string;
  name: string;
  description: string;
  price: number | string;
  currency: string;
  category: Category;
  image_url: string | null;
}

function VendorProducts() {
  const { user } = useAuth();
  const vendorId = user?.id;
  const qc = useQueryClient();
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [creating, setCreating] = useState(false);

  const { data: products, isLoading } = useQuery({
    enabled: !!vendorId,
    queryKey: ["vendor-products", vendorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, description, price, currency, category, image_url")
        .eq("vendor_id", vendorId!)
        .order("created_at", { ascending: false });
      if (error) return [];
      return (data ?? []) as ProductRow[];
    },
  });

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error("We could not delete that product. Please try again.");
    else {
      toast.success("Product deleted");
      qc.invalidateQueries({ queryKey: ["vendor-products", vendorId] });
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
        <div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary">
            Catalog
          </span>
          <h1 className="text-3xl font-extrabold tracking-tighter mt-2">Products</h1>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-primary/90"
        >
          <Plus className="size-4" /> Add product
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-stone-100 animate-pulse rounded-sm" />
          ))}
        </div>
      ) : products?.length === 0 ? (
        <div className="border border-dashed border-border p-16 text-center">
          <p className="text-muted-foreground mb-4">No products yet.</p>
          <button
            onClick={() => setCreating(true)}
            className="bg-foreground text-white px-5 py-2.5 text-xs font-bold uppercase tracking-widest"
          >
            Create your first product
          </button>
        </div>
      ) : (
        <div className="border border-border bg-white">
          {products?.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-4 p-4 border-b border-border last:border-0"
            >
              <div className="size-14 bg-stone-100 shrink-0">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="size-full object-cover" />
                ) : null}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{p.name}</p>
                <p className="text-xs font-mono text-muted-foreground">{p.category}</p>
              </div>
              <span className="font-mono text-sm text-primary">
                {formatPrice(Number(p.price), p.currency)}
              </span>
              <button
                onClick={() => setEditing(p)}
                className="p-2 hover:bg-stone-100"
                aria-label="Edit"
              >
                <Pencil className="size-4" />
              </button>
              <button
                onClick={() => handleDelete(p.id)}
                className="p-2 hover:bg-stone-100 text-primary"
                aria-label="Delete"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {(creating || editing) && vendorId ? (
        <ProductForm
          vendorId={vendorId}
          initial={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={() => {
            qc.invalidateQueries({ queryKey: ["vendor-products", vendorId] });
            setCreating(false);
            setEditing(null);
          }}
        />
      ) : null}
    </div>
  );
}

function ProductForm({
  vendorId,
  initial,
  onClose,
  onSaved,
}: {
  vendorId: string;
  initial: ProductRow | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  const [currency, setCurrency] = useState(initial?.currency ?? "ZAR");
  const [category, setCategory] = useState<Category>(initial?.category ?? "Fashion");
  const [file, setFile] = useState<File | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const callAI = useServerFn(generateProductDescription);

  async function runAI() {
    if (!name) {
      toast.error("Add a product name first");
      return;
    }
    setAiLoading(true);
    try {
      const result = await callAI({
        data: { name, category, notes: description.slice(0, 300) || undefined },
      });
      if (result.description) {
        setDescription(result.description);
        toast.success("Description drafted");
      }
    } catch (e) {
      toast.error(
        "The assistant is unavailable right now. You can still write the description manually.",
      );
    } finally {
      setAiLoading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      let imageUrl = initial?.image_url ?? null;
      if (file) imageUrl = await uploadProductImage(vendorId, file);
      const payload = {
        vendor_id: vendorId,
        name,
        description,
        price: Number(price),
        currency,
        category,
        image_url: imageUrl,
      };
      const { error } = initial
        ? await supabase.from("products").update(payload).eq("id", initial.id)
        : await supabase.from("products").insert(payload);
      if (error) throw error;
      toast.success(initial ? "Product updated" : "Product created");
      onSaved();
    } catch (e) {
      toast.error("We could not save this product. Please check the details and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm grid place-items-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="bg-white w-full max-w-xl my-8 border border-border"
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="text-xl font-extrabold tracking-tighter">
            {initial ? "Edit product" : "New product"}
          </h3>
          <button type="button" onClick={onClose} className="p-1 hover:bg-stone-100">
            <X className="size-4" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <Field label="Product name" value={name} onChange={setName} required maxLength={200} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Price" value={price} onChange={setPrice} type="number" required />
            <label className="block">
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                Currency
              </span>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="mt-2 w-full border border-border bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
              >
                {["ZAR", "NGN", "KES", "GHS", "EGP", "MAD", "XOF"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="block">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Category
            </span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="mt-2 w-full border border-border bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>

          <div>
            <div className="flex items-end justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                Description
              </span>
              <button
                type="button"
                onClick={runAI}
                disabled={aiLoading}
                className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary hover:underline disabled:opacity-50"
              >
                <Sparkles className="size-3" /> {aiLoading ? "Drafting..." : "AI assist"}
              </button>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              maxLength={2000}
              className="w-full border border-border bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <label className="block">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Image
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-2 w-full text-sm"
            />
            {initial?.image_url && !file ? (
              <img
                src={initial.image_url}
                alt="current"
                className="mt-3 size-20 object-cover border border-border"
              />
            ) : null}
          </label>
        </div>
        <div className="p-6 border-t border-border flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-stone-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="bg-primary text-primary-foreground px-5 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? "Saving..." : initial ? "Save changes" : "Create product"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  maxLength?: number;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        maxLength={maxLength}
        step={type === "number" ? "0.01" : undefined}
        className="mt-2 w-full border border-border bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
      />
    </label>
  );
}
