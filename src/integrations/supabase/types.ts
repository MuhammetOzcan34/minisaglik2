export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          activity_date: string
          activity_time: string | null
          activity_type: string
          child_id: string
          completion_status: string | null
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          notes: string | null
          recorded_by: string | null
        }
        Insert: {
          activity_date: string
          activity_time?: string | null
          activity_type: string
          child_id: string
          completion_status?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          recorded_by?: string | null
        }
        Update: {
          activity_date?: string
          activity_time?: string | null
          activity_type?: string
          child_id?: string
          completion_status?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          recorded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      allergies: {
        Row: {
          allergen: string
          child_id: string
          created_at: string
          id: string
          notes: string | null
          severity: string | null
          symptoms: string | null
        }
        Insert: {
          allergen: string
          child_id: string
          created_at?: string
          id?: string
          notes?: string | null
          severity?: string | null
          symptoms?: string | null
        }
        Update: {
          allergen?: string
          child_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          severity?: string | null
          symptoms?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "allergies_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      children: {
        Row: {
          birth_date: string
          blood_type: string | null
          created_at: string
          family_id: string
          gender: string | null
          id: string
          medical_notes: string | null
          name: string
          photo_url: string | null
          updated_at: string
        }
        Insert: {
          birth_date: string
          blood_type?: string | null
          created_at?: string
          family_id: string
          gender?: string | null
          id?: string
          medical_notes?: string | null
          name: string
          photo_url?: string | null
          updated_at?: string
        }
        Update: {
          birth_date?: string
          blood_type?: string | null
          created_at?: string
          family_id?: string
          gender?: string | null
          id?: string
          medical_notes?: string | null
          name?: string
          photo_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "children_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnoses: {
        Row: {
          child_id: string
          created_at: string
          diagnosis: string
          diagnosis_date: string | null
          doctor_name: string | null
          id: string
          notes: string | null
        }
        Insert: {
          child_id: string
          created_at?: string
          diagnosis: string
          diagnosis_date?: string | null
          doctor_name?: string | null
          id?: string
          notes?: string | null
        }
        Update: {
          child_id?: string
          created_at?: string
          diagnosis?: string
          diagnosis_date?: string | null
          doctor_name?: string | null
          id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "diagnoses_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          created_at: string
          email: string | null
          family_id: string
          hospital: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          specialty: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          family_id: string
          hospital?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          specialty: string
        }
        Update: {
          created_at?: string
          email?: string | null
          family_id?: string
          hospital?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          specialty?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctors_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      families: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      medication_doses: {
        Row: {
          created_at: string
          dosage: string
          given_at: string
          given_by: string | null
          id: string
          medication_id: string
          notes: string | null
        }
        Insert: {
          created_at?: string
          dosage: string
          given_at: string
          given_by?: string | null
          id?: string
          medication_id: string
          notes?: string | null
        }
        Update: {
          created_at?: string
          dosage?: string
          given_at?: string
          given_by?: string | null
          id?: string
          medication_id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medication_doses_given_by_fkey"
            columns: ["given_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_doses_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          child_id: string
          created_at: string
          dosage: string
          end_date: string | null
          frequency: string
          id: string
          instructions: string | null
          is_active: boolean | null
          name: string
          start_date: string
        }
        Insert: {
          child_id: string
          created_at?: string
          dosage: string
          end_date?: string | null
          frequency: string
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          name: string
          start_date: string
        }
        Update: {
          child_id?: string
          created_at?: string
          dosage?: string
          end_date?: string | null
          frequency?: string
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          name?: string
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "medications_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      mood_records: {
        Row: {
          activity: string | null
          child_id: string
          created_at: string
          id: string
          mood: string | null
          notes: string | null
          recorded_at: string
          recorded_by: string | null
        }
        Insert: {
          activity?: string | null
          child_id: string
          created_at?: string
          id?: string
          mood?: string | null
          notes?: string | null
          recorded_at: string
          recorded_by?: string | null
        }
        Update: {
          activity?: string | null
          child_id?: string
          created_at?: string
          id?: string
          mood?: string | null
          notes?: string | null
          recorded_at?: string
          recorded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mood_records_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mood_records_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_records: {
        Row: {
          allergic_reaction: boolean | null
          amount: string
          child_id: string
          created_at: string
          food_name: string
          id: string
          meal_time: string
          meal_type: string | null
          notes: string | null
          reaction_notes: string | null
          recorded_by: string | null
          unit: string
        }
        Insert: {
          allergic_reaction?: boolean | null
          amount: string
          child_id: string
          created_at?: string
          food_name: string
          id?: string
          meal_time: string
          meal_type?: string | null
          notes?: string | null
          reaction_notes?: string | null
          recorded_by?: string | null
          unit: string
        }
        Update: {
          allergic_reaction?: boolean | null
          amount?: string
          child_id?: string
          created_at?: string
          food_name?: string
          id?: string
          meal_time?: string
          meal_type?: string | null
          notes?: string | null
          reaction_notes?: string | null
          recorded_by?: string | null
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_records_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nutrition_records_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      physical_measurements: {
        Row: {
          child_id: string
          created_at: string
          head_circumference_cm: number | null
          height_cm: number | null
          id: string
          measurement_date: string
          notes: string | null
          recorded_by: string | null
          temperature_celsius: number | null
          weight_kg: number | null
        }
        Insert: {
          child_id: string
          created_at?: string
          head_circumference_cm?: number | null
          height_cm?: number | null
          id?: string
          measurement_date: string
          notes?: string | null
          recorded_by?: string | null
          temperature_celsius?: number | null
          weight_kg?: number | null
        }
        Update: {
          child_id?: string
          created_at?: string
          head_circumference_cm?: number | null
          height_cm?: number | null
          id?: string
          measurement_date?: string
          notes?: string | null
          recorded_by?: string | null
          temperature_celsius?: number | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "physical_measurements_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "physical_measurements_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          family_id: string | null
          full_name: string
          id: string
          phone: string | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          family_id?: string | null
          full_name: string
          id?: string
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          family_id?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      reminders: {
        Row: {
          child_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          family_id: string
          id: string
          is_completed: boolean | null
          is_recurring: boolean | null
          recurrence_pattern: string | null
          remind_at: string
          reminder_type: string | null
          title: string
        }
        Insert: {
          child_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          family_id: string
          id?: string
          is_completed?: boolean | null
          is_recurring?: boolean | null
          recurrence_pattern?: string | null
          remind_at: string
          reminder_type?: string | null
          title: string
        }
        Update: {
          child_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          family_id?: string
          id?: string
          is_completed?: boolean | null
          is_recurring?: boolean | null
          recurrence_pattern?: string | null
          remind_at?: string
          reminder_type?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminders_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      seizures: {
        Row: {
          child_id: string
          created_at: string
          duration_minutes: number | null
          emergency_action: boolean | null
          id: string
          notes: string | null
          observations: string | null
          post_seizure_state: string | null
          recorded_by: string | null
          seizure_type: string | null
          started_at: string
        }
        Insert: {
          child_id: string
          created_at?: string
          duration_minutes?: number | null
          emergency_action?: boolean | null
          id?: string
          notes?: string | null
          observations?: string | null
          post_seizure_state?: string | null
          recorded_by?: string | null
          seizure_type?: string | null
          started_at: string
        }
        Update: {
          child_id?: string
          created_at?: string
          duration_minutes?: number | null
          emergency_action?: boolean | null
          id?: string
          notes?: string | null
          observations?: string | null
          post_seizure_state?: string | null
          recorded_by?: string | null
          seizure_type?: string | null
          started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seizures_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seizures_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sleep_records: {
        Row: {
          bedtime: string | null
          child_id: string
          created_at: string
          id: string
          night_wakings: number | null
          quality_notes: string | null
          recorded_by: string | null
          sleep_date: string
          sleep_quality: string | null
          wake_time: string | null
        }
        Insert: {
          bedtime?: string | null
          child_id: string
          created_at?: string
          id?: string
          night_wakings?: number | null
          quality_notes?: string | null
          recorded_by?: string | null
          sleep_date: string
          sleep_quality?: string | null
          wake_time?: string | null
        }
        Update: {
          bedtime?: string | null
          child_id?: string
          created_at?: string
          id?: string
          night_wakings?: number | null
          quality_notes?: string | null
          recorded_by?: string | null
          sleep_date?: string
          sleep_quality?: string | null
          wake_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sleep_records_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sleep_records_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_family_id: {
        Args: Record<PropertyKey, never>
        Returns: string
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
