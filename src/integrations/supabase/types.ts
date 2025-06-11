export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      airdrop_claims: {
        Row: {
          claim_amount: number
          completed_at: string | null
          created_at: string
          error_message: string | null
          fee_paid: number
          fee_transaction_hash: string
          id: string
          status: string
          token_transaction_hash: string | null
          wallet_address: string
        }
        Insert: {
          claim_amount?: number
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          fee_paid: number
          fee_transaction_hash: string
          id?: string
          status?: string
          token_transaction_hash?: string | null
          wallet_address: string
        }
        Update: {
          claim_amount?: number
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          fee_paid?: number
          fee_transaction_hash?: string
          id?: string
          status?: string
          token_transaction_hash?: string | null
          wallet_address?: string
        }
        Relationships: []
      }
      deposits: {
        Row: {
          amount: number
          created_at: string
          id: string
          plan_level: string
          status: string
          transaction_hash: string | null
          updated_at: string
          user_id: string
          verified_at: string | null
          wallet_address: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          plan_level: string
          status?: string
          transaction_hash?: string | null
          updated_at?: string
          user_id: string
          verified_at?: string | null
          wallet_address: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          plan_level?: string
          status?: string
          transaction_hash?: string | null
          updated_at?: string
          user_id?: string
          verified_at?: string | null
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "deposits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          bonus_earned: number
          created_at: string
          id: string
          referred_id: string
          referrer_id: string
        }
        Insert: {
          bonus_earned?: number
          created_at?: string
          id?: string
          referred_id: string
          referrer_id: string
        }
        Update: {
          bonus_earned?: number
          created_at?: string
          id?: string
          referred_id?: string
          referrer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          balance: number
          created_at: string
          earning_rate: number
          id: string
          level: number
          level_expiry_date: string | null
          level_name: string
          referral_bonus: number
          referrals: number
          updated_at: string
          vault_capacity: number
          vault_used: number
          wallet_address: string
        }
        Insert: {
          balance?: number
          created_at?: string
          earning_rate?: number
          id?: string
          level?: number
          level_expiry_date?: string | null
          level_name?: string
          referral_bonus?: number
          referrals?: number
          updated_at?: string
          vault_capacity?: number
          vault_used?: number
          wallet_address: string
        }
        Update: {
          balance?: number
          created_at?: string
          earning_rate?: number
          id?: string
          level?: number
          level_expiry_date?: string | null
          level_name?: string
          referral_bonus?: number
          referrals?: number
          updated_at?: string
          vault_capacity?: number
          vault_used?: number
          wallet_address?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          amount: number
          created_at: string
          id: string
          status: string
          transaction_hash: string | null
          user_id: string
          wallet_address: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          status?: string
          transaction_hash?: string | null
          user_id: string
          wallet_address: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          status?: string
          transaction_hash?: string | null
          user_id?: string
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      set_config: {
        Args: { parameter: string; value: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
