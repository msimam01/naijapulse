import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Helper function to extract display name from email or phone
const generateDisplayName = (user: User): string => {
  if (user.email) {
    // Extract username from email (e.g., "john.doe@gmail.com" → "John Doe")
    const username = user.email.split('@')[0];
    return username
      .split(/[._-]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  } else if (user.phone) {
    // Use last 6 digits of phone number
    const lastSix = user.phone.slice(-6);
    return `Naija User ${lastSix}`;
  }
  return "Naija User";
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signInWithPhone: (phone: string) => Promise<{ error: Error | null }>;
  signInWithEmail: (email: string) => Promise<{ error: Error | null }>;
  verifyOtp: (phone: string, token: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Get initial session first
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
      }

      if (mounted) {
        console.log('Initial session loaded:', !!session);
        setSession(session);
        setUser(session?.user ?? null);
      }
    });

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, !!session);

        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);

          // Auto-create profile on authentication events
          if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
            console.log('AuthContext: Processing user sign in:', session.user.id);

            try {
              // Check if profile already exists
              const { data: existingProfile } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', session.user.id)
                .single();

              if (!existingProfile) {
                // For new users, check if they have custom metadata from magic link
                const userMeta = session.user.user_metadata;
                const displayName = userMeta?.display_name || generateDisplayName(session.user);
                const isAdmin = userMeta?.is_admin || false;

                console.log('AuthContext: Creating new profile for user:', {
                  id: session.user.id,
                  displayName,
                  isAdmin,
                  hasMeta: !!userMeta?.display_name
                });

                // Create new profile
                const { error } = await supabase.from('profiles').insert({
                  id: session.user.id,
                  display_name: displayName,
                  is_admin: isAdmin,
                });
                if (error) console.error('Profile creation error:', error);
              } else {
                // Update existing profile (in case display_name changed)
                const displayName = generateDisplayName(session.user);
                const { error } = await supabase.from('profiles').upsert({
                  id: session.user.id,
                  display_name: displayName,
                });
                if (error) console.error('Profile update error:', error);
              }
            } catch (error) {
              console.error('Error in profile creation/update:', error);
            }
          }

          // Set loading to false only after auth state change
          setIsLoading(false);
        }
      }
    );

    // Force session confirmation for magic links
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Auth callback error:', error);
      } else {
        console.log('Session confirmed after callback:', !!data.session);
      }
    };

    // Check if we're returning from auth redirect
    if (window.location.hash.includes('access_token') || window.location.search.includes('code')) {
      handleAuthCallback();
    }

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Sign in with phone OTP (default/recommended for Nigeria)
  const signInWithPhone = async (phone: string): Promise<{ error: Error | null }> => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone,
      });
      return { error: error as Error | null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  // Sign in with email magic link
  const signInWithEmail = async (email: string): Promise<{ error: Error | null }> => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });
      return { error: error as Error | null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  // Verify phone OTP
  const verifyOtp = async (phone: string, token: string): Promise<{ error: Error | null }> => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: phone,
        token: token,
        type: "sms",
      });
      return { error: error as Error | null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    navigate('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signInWithPhone,
        signInWithEmail,
        verifyOtp,
        signOut,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
