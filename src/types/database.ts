export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          first_name?: string;
          last_name?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      user_projects: {
        Row: {
          id: string;
          user_id: string;
          career: string;
          language: string;
          framework: string;
          project_title: string;
          time_estimate: string;
          status: "pending" | "in_progress" | "completed";
          github_url: string | null;
          live_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          career: string;
          language: string;
          framework: string;
          project_title: string;
          time_estimate: string;
          status?: "pending" | "in_progress" | "completed";
          github_url?: string | null;
          live_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          career?: string;
          language?: string;
          framework?: string;
          project_title?: string;
          time_estimate?: string;
          status?: "pending" | "in_progress" | "completed";
          github_url?: string | null;
          live_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_projects_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      feedback: {
        Row: {
          id: string;
          email: string | null;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email?: string | null;
          message: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          message?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type UserProjectRow =
  Database["public"]["Tables"]["user_projects"]["Row"];
export type UserProjectInsert =
  Database["public"]["Tables"]["user_projects"]["Insert"];
