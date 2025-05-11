
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  continueAsGuest: () => Promise<void>;
  isGuest: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for email confirmation success in URL parameters
    const url = new URL(window.location.href);
    const confirmed = url.searchParams.get('confirmed');
    
    if (confirmed === 'true') {
      toast({
        title: "Email confirmed successfully!",
        description: "Your account is now fully active. Welcome to EasyPeasy!",
      });
      
      // Remove the parameter to prevent showing the toast on refresh
      url.searchParams.delete('confirmed');
      window.history.replaceState({}, document.title, url.toString());
    }
  }, [location, toast]);

  useEffect(() => {
    // Set up the auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setIsGuest(!!localStorage.getItem('isGuestUser'));
        setIsLoading(false);
        
        // Check if this is an email confirmation
        if (event === 'SIGNED_IN' && !session && newSession) {
          // For users that just confirmed their email
          if (newSession.user?.email_confirmed_at) {
            toast({
              title: "Welcome back!",
              description: "You have successfully signed in.",
            });
          }
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsGuest(!!localStorage.getItem('isGuestUser'));
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  const signUp = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth?confirmed=true`,
          data: {
            email_confirmed: false, // Track email confirmation status
          }
        }
      });

      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      // Send custom confirmation email via edge function
      try {
        const firstName = email.split('@')[0]; // Simple way to get a name from email
        await supabase.functions.invoke('send-confirmation-email', {
          body: { 
            email, 
            confirmationUrl: data?.user?.confirmation_sent_at 
              ? `${window.location.origin}/auth?confirmed=true` 
              : `${window.location.origin}/auth`,
            firstName
          },
        });
      } catch (emailError) {
        console.error('Error sending custom confirmation email:', emailError);
        // We'll continue with the default email if custom email fails
      }

      toast({
        title: "Sign up successful",
        description: "Please check your email for verification.",
      });
      
      navigate('/auth', { state: { mode: 'login' } });
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      localStorage.removeItem('isGuestUser');
      setIsGuest(false);
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('isGuestUser');
      setIsGuest(false);
      toast({
        title: "Logged out successfully",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error logging out",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({
          title: "Password reset failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      toast({
        title: "Password reset email sent",
        description: "Please check your email for the reset link.",
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const continueAsGuest = async () => {
    setIsGuest(true);
    localStorage.setItem('isGuestUser', 'true');
    toast({
      title: "Continuing as guest",
      description: "Your progress will be saved on this device only.",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isLoading,
        signUp,
        signIn,
        signOut,
        resetPassword,
        continueAsGuest,
        isGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
