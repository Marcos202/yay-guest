export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      campanhas: {
        Row: {
          agendamento: string | null
          created_at: string
          id: string
          intervalo_max: number | null
          intervalo_min: number | null
          mensagem_template: string
          modo: string
          nome: string
          status: string | null
          taxa_por_minuto: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agendamento?: string | null
          created_at?: string
          id?: string
          intervalo_max?: number | null
          intervalo_min?: number | null
          mensagem_template: string
          modo: string
          nome: string
          status?: string | null
          taxa_por_minuto?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agendamento?: string | null
          created_at?: string
          id?: string
          intervalo_max?: number | null
          intervalo_min?: number | null
          mensagem_template?: string
          modo?: string
          nome?: string
          status?: string | null
          taxa_por_minuto?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contatos: {
        Row: {
          campanha_id: string
          created_at: string
          id: string
          nome: string
          observacao: string | null
          telefone: string
        }
        Insert: {
          campanha_id: string
          created_at?: string
          id?: string
          nome: string
          observacao?: string | null
          telefone: string
        }
        Update: {
          campanha_id?: string
          created_at?: string
          id?: string
          nome?: string
          observacao?: string | null
          telefone?: string
        }
        Relationships: [
          {
            foreignKeyName: "contatos_campanha_id_fkey"
            columns: ["campanha_id"]
            isOneToOne: false
            referencedRelation: "campanhas"
            referencedColumns: ["id"]
          },
        ]
      }
      convidados: {
        Row: {
          data_confirmacao: string
          id: string
          idade: number
          nome_completo: string
          whatsapp: string | null
        }
        Insert: {
          data_confirmacao?: string
          id?: string
          idade: number
          nome_completo: string
          whatsapp?: string | null
        }
        Update: {
          data_confirmacao?: string
          id?: string
          idade?: number
          nome_completo?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      envios_whatsapp: {
        Row: {
          campanha_id: string
          contato_id: string
          created_at: string
          erro_mensagem: string | null
          id: string
          mensagem_enviada: string | null
          status: string
          timestamp_envio: string | null
        }
        Insert: {
          campanha_id: string
          contato_id: string
          created_at?: string
          erro_mensagem?: string | null
          id?: string
          mensagem_enviada?: string | null
          status: string
          timestamp_envio?: string | null
        }
        Update: {
          campanha_id?: string
          contato_id?: string
          created_at?: string
          erro_mensagem?: string | null
          id?: string
          mensagem_enviada?: string | null
          status?: string
          timestamp_envio?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "envios_whatsapp_campanha_id_fkey"
            columns: ["campanha_id"]
            isOneToOne: false
            referencedRelation: "campanhas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "envios_whatsapp_contato_id_fkey"
            columns: ["contato_id"]
            isOneToOne: false
            referencedRelation: "contatos"
            referencedColumns: ["id"]
          },
        ]
      }
      optouts_whatsapp: {
        Row: {
          created_at: string
          id: string
          motivo: string | null
          telefone: string
        }
        Insert: {
          created_at?: string
          id?: string
          motivo?: string | null
          telefone: string
        }
        Update: {
          created_at?: string
          id?: string
          motivo?: string | null
          telefone?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
        }
        Relationships: []
      }
      whatsapp_sessions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          qr_code: string | null
          session_data: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          qr_code?: string | null
          session_data?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          qr_code?: string | null
          session_data?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
