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
      cgpa_records: {
        Row: {
          created_at: string
          cumulative_gpa: number
          id: string
          semester_gpa: number
          semester_id: string
          student_id: string
          total_credit_units: number
        }
        Insert: {
          created_at?: string
          cumulative_gpa: number
          id?: string
          semester_gpa: number
          semester_id: string
          student_id: string
          total_credit_units: number
        }
        Update: {
          created_at?: string
          cumulative_gpa?: number
          id?: string
          semester_gpa?: number
          semester_id?: string
          student_id?: string
          total_credit_units?: number
        }
        Relationships: [
          {
            foreignKeyName: "cgpa_records_semester_id_fkey"
            columns: ["semester_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cgpa_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          course_code: string
          course_name: string
          created_at: string
          credit_units: number
          id: string
        }
        Insert: {
          course_code: string
          course_name: string
          created_at?: string
          credit_units: number
          id?: string
        }
        Update: {
          course_code?: string
          course_name?: string
          created_at?: string
          credit_units?: number
          id?: string
        }
        Relationships: []
      }
      results: {
        Row: {
          course_id: string
          created_at: string
          grade: string
          grade_point: number
          id: string
          score: number
          semester_id: string
          sms_sent: boolean | null
          student_id: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          grade: string
          grade_point: number
          id?: string
          score: number
          semester_id: string
          sms_sent?: boolean | null
          student_id: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          grade?: string
          grade_point?: number
          id?: string
          score?: number
          semester_id?: string
          sms_sent?: boolean | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "results_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "results_semester_id_fkey"
            columns: ["semester_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      semesters: {
        Row: {
          created_at: string
          end_date: string
          id: string
          is_current: boolean | null
          name: string
          start_date: string
          year: number
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          is_current?: boolean | null
          name: string
          start_date: string
          year: number
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          is_current?: boolean | null
          name?: string
          start_date?: string
          year?: number
        }
        Relationships: []
      }
      students: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          phone_number: string
          program: string
          student_id: string
          updated_at: string
          year_of_study: number
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          phone_number: string
          program: string
          student_id: string
          updated_at?: string
          year_of_study: number
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone_number?: string
          program?: string
          student_id?: string
          updated_at?: string
          year_of_study?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_grade: {
        Args: { score: number }
        Returns: {
          grade: string
          grade_point: number
        }[]
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
