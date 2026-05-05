'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters.',
  }),
});

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true);
    try {
      const response = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (response?.error) {
        toast.error(response.error);
      } else {
        toast.success('Logged in successfully!');
        
        const remoteTenant = searchParams.get('remote_tenant');
        const isValidTenant = remoteTenant && !remoteTenant.includes('://') && (remoteTenant.includes('.') || remoteTenant === 'localhost');

        if (remoteTenant && isValidTenant) {
          router.push(`/api/auth/hub-callback?target=${encodeURIComponent(remoteTenant)}`);
        } else {
          router.push('/dashboard');
        }
        router.refresh();
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  async function loginWithGoogle() {
    setIsGoogleLoading(true);
    try {
      const hubDomain = process.env.NEXT_PUBLIC_HUB_DOMAIN || 'localhost:3000';
      const currentHost = window.location.host;
      
      const isHub = currentHost === hubDomain || 
                    currentHost.replace('www.', '') === hubDomain.replace('www.', '');

      if (!isHub) {
        const isProd = process.env.NODE_ENV === 'production';
        const protocol = (isProd && !hubDomain.includes('localhost')) ? 'https' : 'http';
        const hubBase = `${protocol}://${hubDomain}`;
        const hubCallbackUrl = `${hubBase}/api/auth/hub-callback?target=${encodeURIComponent(currentHost)}`;
        const googleSignInUrl = `${hubBase}/api/auth/signin/google?callbackUrl=${encodeURIComponent(hubCallbackUrl)}`;
        window.location.href = googleSignInUrl;
        return;
      }

      const remoteTenant = searchParams.get('remote_tenant');
      const isValidTenant = remoteTenant && !remoteTenant.includes('://') && (remoteTenant.includes('.') || remoteTenant === 'localhost');
      
      const protocol = (process.env.NODE_ENV === 'production' && !hubDomain.includes('localhost')) ? 'https' : 'http';
      const baseUrl = `${protocol}://${currentHost}`;
      
      const finalCallback = (remoteTenant && isValidTenant)
        ? `${baseUrl}/api/auth/hub-callback?target=${encodeURIComponent(remoteTenant)}` 
        : `${baseUrl}/dashboard`;

      await signIn('google', { callbackUrl: finalCallback });
    } catch (error) {
      setIsGoogleLoading(false);
      toast.error('Failed to log in with Google.');
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left side: Hero Image (Hidden on mobile) */}
      <div className="hidden lg:block relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/90 to-slate-900/20 z-10" />
        <Image
          src="https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=1974&auto=format&fit=crop"
          alt="Login Background"
          fill
          className="object-cover animate-pulse duration-[10000ms]"
          priority
        />
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-end p-20 text-white">
          <div className="max-w-md text-center">
            <h1 className="text-5xl font-black tracking-tighter mb-6">Discover the Best Deals</h1>
            <p className="text-lg text-slate-300 font-medium">
              Join Janopriyo Shop today and get access to exclusive offers, personalized recommendations, and a seamless shopping experience.
            </p>
          </div>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="flex items-center justify-center p-8 bg-white/50 backdrop-blur-sm relative">
        <div className="absolute top-8 right-8">
          <Link href="/">
             <div className="flex items-center gap-2 group cursor-pointer">
                <div className="relative w-8 h-8">
                    <Image src="/logo.png" alt="Janopriyo" fill className="object-contain transition-transform group-hover:scale-110" />
                </div>
                <span className="font-black tracking-tighter text-2xl bg-gradient-to-r from-primary to-teal-600 bg-clip-text text-transparent">
                  JANOPRIYO
                </span>
             </div>
          </Link>
        </div>

        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="text-center">
            <h2 className="text-4xl font-black tracking-tighter text-slate-900">Welcome back</h2>
            <p className="mt-2 text-slate-600 font-medium">Enter your credentials to access your account</p>
          </div>

          <div className="space-y-4">
            <Button
              variant="outline"
              type="button"
              className="w-full h-12 text-slate-700 font-bold border-2 hover:bg-slate-50 transition-all active:scale-[0.98]"
              onClick={loginWithGoogle}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-slate-500 font-bold">Or continue with email</span>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-bold">Email Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="m@example.com"
                          {...field}
                          className="h-12 border-2 focus-visible:ring-primary/20 transition-all font-medium"
                        />
                      </FormControl>
                      <FormMessage className="font-bold" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-slate-700 font-bold">Password</FormLabel>
                        <Link
                          href="/forgot-password"
                          className="text-sm font-bold text-primary hover:text-primary/80 transition-colors"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            {...field}
                            className="h-12 border-2 pr-10 focus-visible:ring-primary/20 transition-all font-medium"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="font-bold" />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-black tracking-tight transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    'Sign In'
                  )}
                  <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Button>
              </form>
            </Form>
          </div>

          <p className="text-center text-sm text-slate-600 font-bold">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary hover:text-primary/80 transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
