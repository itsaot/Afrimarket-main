import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/seed-admin")({
  server: {
    handlers: {
      POST: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const email = "adminpanel@afrimarket.local";
        const password = "Admin@2026";

        // Try to find existing user
        const { data: list } = await supabaseAdmin.auth.admin.listUsers();
        let user = list?.users?.find((u) => u.email === email) ?? null;

        if (!user) {
          const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
              full_name: "Admin Panel",
              business_name: "AfriMarket Admin",
              username: "AdminPanel",
              role: "admin",
            },
          });
          if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });
          user = data.user;
        } else {
          await supabaseAdmin.auth.admin.updateUserById(user.id, { password });
        }

        if (!user) return Response.json({ ok: false, error: "no user" }, { status: 500 });

        await supabaseAdmin.from("profiles").upsert({
          id: user.id,
          full_name: "Admin Panel",
          business_name: "AfriMarket Admin",
          verified: true,
        });
        await supabaseAdmin
          .from("user_roles")
          .upsert({ user_id: user.id, role: "admin" }, { onConflict: "user_id,role" });
        await supabaseAdmin
          .from("user_roles")
          .upsert({ user_id: user.id, role: "vendor" }, { onConflict: "user_id,role" });

        return Response.json({ ok: true, email, userId: user.id });
      },
    },
  },
});