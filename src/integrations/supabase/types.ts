export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      inquiries: {
        Row: {
          buyer_email: string;
          buyer_name: string;
          created_at: string;
          id: string;
          message: string;
          product_id: string | null;
          vendor_id: string;
        };
        Insert: {
          buyer_email: string;
          buyer_name: string;
          created_at?: string;
          id?: string;
          message: string;
          product_id?: string | null;
          vendor_id: string;
        };
        Update: {
          buyer_email?: string;
          buyer_name?: string;
          created_at?: string;
          id?: string;
          message?: string;
          product_id?: string | null;
          vendor_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "inquiries_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      order_items: {
        Row: {
          created_at: string;
          id: string;
          order_id: string;
          product_id: string;
          product_name: string;
          quantity: number;
          unit_price: number;
          vendor_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          order_id: string;
          product_id: string;
          product_name: string;
          quantity: number;
          unit_price: number;
          vendor_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          order_id?: string;
          product_id?: string;
          product_name?: string;
          quantity?: number;
          unit_price?: number;
          vendor_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          buyer_email: string;
          buyer_id: string | null;
          buyer_name: string;
          buyer_phone: string;
          created_at: string;
          id: string;
          shipping_address: string;
          status: Database["public"]["Enums"]["order_status"];
          total: number;
        };
        Insert: {
          buyer_email: string;
          buyer_id?: string | null;
          buyer_name: string;
          buyer_phone: string;
          created_at?: string;
          id?: string;
          shipping_address: string;
          status?: Database["public"]["Enums"]["order_status"];
          total: number;
        };
        Update: {
          buyer_email?: string;
          buyer_id?: string | null;
          buyer_name?: string;
          buyer_phone?: string;
          created_at?: string;
          id?: string;
          shipping_address?: string;
          status?: Database["public"]["Enums"]["order_status"];
          total?: number;
        };
        Relationships: [];
      };
      products: {
        Row: {
          category: Database["public"]["Enums"]["product_category"];
          created_at: string;
          currency: string;
          description: string;
          featured: boolean;
          id: string;
          image_url: string | null;
          name: string;
          price: number;
          updated_at: string;
          vendor_id: string;
          views: number;
        };
        Insert: {
          category: Database["public"]["Enums"]["product_category"];
          created_at?: string;
          currency?: string;
          description?: string;
          featured?: boolean;
          id?: string;
          image_url?: string | null;
          name: string;
          price: number;
          updated_at?: string;
          vendor_id: string;
          views?: number;
        };
        Update: {
          category?: Database["public"]["Enums"]["product_category"];
          created_at?: string;
          currency?: string;
          description?: string;
          featured?: boolean;
          id?: string;
          image_url?: string | null;
          name?: string;
          price?: number;
          updated_at?: string;
          vendor_id?: string;
          views?: number;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          business_name: string | null;
          country: string | null;
          created_at: string;
          full_name: string | null;
          id: string;
          updated_at: string;
          verified: boolean;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          business_name?: string | null;
          country?: string | null;
          created_at?: string;
          full_name?: string | null;
          id: string;
          updated_at?: string;
          verified?: boolean;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          business_name?: string | null;
          country?: string | null;
          created_at?: string;
          full_name?: string | null;
          id?: string;
          updated_at?: string;
          verified?: boolean;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "buyer" | "vendor" | "admin";
      order_status: "pending" | "confirmed" | "shipped" | "completed" | "cancelled";
      product_category:
        | "Fashion"
        | "Beauty"
        | "Food"
        | "Home Decor"
        | "Agriculture"
        | "Electronics";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["buyer", "vendor", "admin"],
      order_status: ["pending", "confirmed", "shipped", "completed", "cancelled"],
      product_category: ["Fashion", "Beauty", "Food", "Home Decor", "Agriculture", "Electronics"],
    },
  },
} as const;
