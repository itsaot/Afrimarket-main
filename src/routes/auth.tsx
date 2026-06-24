import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/app-header";
import { SiteFooter } from "@/components/site-footer";

const SearchSchema = z.object({
  mode: z.enum(["signin", "signup"]).optional(),
  role: z.enum(["buyer", "vendor"]).optional(),
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: SearchSchema,
  head: () => ({
    meta: [
      { title: "Sign in to AfriMarket" },
      {
        name: "description",
        content:
          "Sign in or create an AfriMarket account to buy from verified African vendors or start selling.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">(search.mode ?? "signin");
  const [role, setRole] = useState<"buyer" | "vendor">(search.role ?? "buyer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: search.redirect ?? "/vendor", replace: true });
    });
  }, [navigate, search.redirect]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName, business_name: businessName, role },
          },
        });
        if (error) throw error;
        toast.success("Account created. Welcome to AfriMarket.");
        navigate({ to: role === "vendor" ? "/vendor" : "/products", replace: true });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back.");
        navigate({ to: search.redirect ?? "/vendor", replace: true });
      }
    } catch (err) {
      toast.error(
        mode === "signup"
          ? "We could not create your account. Please check your details."
          : "We could not sign you in. Please check your details.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      <main className="flex-1 grid place-items-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary">
              {mode === "signup" ? "Create account" : "Sign in"}
            </span>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tighter">
              {mode === "signup"
                ? role === "vendor"
                  ? "Launch your business on AfriMarket"
                  : "Join AfriMarket"
                : "Welcome back"}
            </h1>
          </div>

          {mode === "signup" ? (
            <div className="flex border border-border rounded-sm mb-6 font-mono text-xs uppercase tracking-wider">
              <button
                type="button"
                onClick={() => setRole("buyer")}
                className={`flex-1 py-3 ${role === "buyer" ? "bg-foreground text-white" : "hover:bg-stone-100"}`}
              >
                I'm a buyer
              </button>
              <button
                type="button"
                onClick={() => setRole("vendor")}
                className={`flex-1 py-3 ${role === "vendor" ? "bg-foreground text-white" : "hover:bg-stone-100"}`}
              >
                I'm a vendor
              </button>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" ? (
              <>
                <Field
                  label="Full name"
                  value={fullName}
                  onChange={setFullName}
                  required
                  maxLength={100}
                />
                {role === "vendor" ? (
                  <Field
                    label="Business name"
                    value={businessName}
                    onChange={setBusinessName}
                    required
                    maxLength={120}
                  />
                ) : null}
              </>
            ) : null}
            <Field
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              required
              maxLength={255}
            />
            <Field
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              required
              minLength={8}
              maxLength={72}
            />

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary text-primary-foreground py-3 text-sm font-bold uppercase tracking-wider hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {submitting ? "Please wait..." : mode === "signup" ? "Create account" : "Sign in"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            {mode === "signup" ? "Already have an account?" : "New to AfriMarket?"}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
              className="text-primary font-semibold hover:underline"
            >
              {mode === "signup" ? "Sign in" : "Create one"}
            </button>
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  minLength,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  minLength?: number;
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
        minLength={minLength}
        maxLength={maxLength}
        className="mt-2 w-full border border-border bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
      />
    </label>
  );
}
