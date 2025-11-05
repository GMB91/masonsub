import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

const supabase = getSupabaseClient();

interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: "system_admin" | "admin" | "manager" | "contractor" | "client";
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

interface TeamMember {
  id: string;
  display_name: string;
  role: string;
  avatar_url?: string;
}

interface UseUserReturn {
  user: (User & Profile) | null;
  teamUsers: TeamMember[];
  loading: boolean;
  refreshUser: () => Promise<void>;
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<(User & Profile) | null>(null);
  const [teamUsers, setTeamUsers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    setLoading(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        // Load user profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single();

        // Load team members
        const { data: team } = await supabase
          .from("team_members")
          .select("id, display_name, role, avatar_url")
          .order("display_name");

        setUser({ ...authUser, ...profile } as User & Profile);
        setTeamUsers(team || []);
      } else {
        setUser(null);
        setTeamUsers([]);
      }
    } catch (error) {
      console.error("Error loading user:", error);
      setUser(null);
      setTeamUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          loadUser();
        } else {
          setUser(null);
          setTeamUsers([]);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    teamUsers,
    loading,
    refreshUser: loadUser,
  };
}
