
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { CircleCheck, Info } from 'lucide-react';

type AuthMode = 'login' | 'signup' | 'resetPassword';

const authSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }).optional(),
});

const AuthPage = () => {
  const location = useLocation();
  const [mode, setMode] = useState<AuthMode>('login');
  const [confirmationSuccess, setConfirmationSuccess] = useState(false);
  const { signIn, signUp, resetPassword, continueAsGuest } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check for mode in location state
    if (location.state && location.state.mode) {
      setMode(location.state.mode);
    }
    
    // Check for email confirmation success
    const confirmed = new URLSearchParams(location.search).get('confirmed');
    if (confirmed === 'true') {
      setConfirmationSuccess(true);
      setMode('login');
      
      // Remove the parameter to prevent showing the message on refresh
      const url = new URL(window.location.href);
      url.searchParams.delete('confirmed');
      window.history.replaceState({}, document.title, url.pathname);
    }
  }, [location]);
  
  const form = useForm<z.infer<typeof authSchema>>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  const onSubmit = async (values: z.infer<typeof authSchema>) => {
    try {
      if (mode === 'login' && values.password) {
        await signIn(values.email, values.password);
        navigate('/');
      } else if (mode === 'signup' && values.password) {
        await signUp(values.email, values.password);
        setMode('login');
      } else if (mode === 'resetPassword') {
        await resetPassword(values.email);
        setMode('login');
      }
    } catch (error) {
      console.error('Auth error:', error);
    }
  };
  
  const handleContinueAsGuest = async () => {
    await continueAsGuest();
    navigate('/');
  };
  
  return (
    <Layout>
      <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-lg shadow-sm border">
        <div className="flex items-center justify-center mb-6">
          <CircleCheck size={32} className="text-primary mr-2" />
          <h1 className="text-2xl font-serif">EasyPeasy</h1>
        </div>
        
        <h2 className="text-xl font-medium mb-4 text-center">
          {mode === 'login' && 'Welcome Back'}
          {mode === 'signup' && 'Create Your Account'}
          {mode === 'resetPassword' && 'Reset Your Password'}
        </h2>
        
        {confirmationSuccess && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <div className="flex items-center">
              <CircleCheck className="h-5 w-5 text-green-600 mr-2" />
              <AlertDescription className="text-green-800">
                Your email has been confirmed successfully! You can now sign in.
              </AlertDescription>
            </div>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {mode !== 'resetPassword' && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <Button type="submit" className="w-full">
              {mode === 'login' && 'Sign In'}
              {mode === 'signup' && 'Sign Up'}
              {mode === 'resetPassword' && 'Send Reset Email'}
            </Button>
          </form>
        </Form>
        
        <div className="mt-6 text-center text-sm">
          {mode === 'login' && (
            <>
              <p className="mb-2">
                <button 
                  onClick={() => setMode('resetPassword')} 
                  className="text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </p>
              <p>
                Don't have an account?{' '}
                <button 
                  onClick={() => setMode('signup')} 
                  className="text-primary hover:underline"
                >
                  Sign up
                </button>
              </p>
            </>
          )}
          
          {mode === 'signup' && (
            <p>
              Already have an account?{' '}
              <button 
                onClick={() => setMode('login')} 
                className="text-primary hover:underline"
              >
                Sign in
              </button>
            </p>
          )}
          
          {mode === 'resetPassword' && (
            <p>
              <button 
                onClick={() => setMode('login')} 
                className="text-primary hover:underline"
              >
                Back to sign in
              </button>
            </p>
          )}
        </div>
        
        <div className="mt-6">
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-muted-foreground">Or</span>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleContinueAsGuest}
          >
            Continue Without Signing Up
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default AuthPage;
