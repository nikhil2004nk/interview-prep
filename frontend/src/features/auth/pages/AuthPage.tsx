import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../hooks/useAuth';
import { Lock, Mail, User as UserIcon, Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional().or(z.literal('')),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFields = z.infer<typeof loginSchema>;
type RegisterFields = z.infer<typeof registerSchema>;

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { login, register } = useAuth();

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors, isSubmitting: isLoginSubmitting },
    reset: resetLoginForm,
  } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: registerRegister,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors, isSubmitting: isRegisterSubmitting },
    reset: resetRegisterForm,
  } = useForm<RegisterFields>({
    resolver: zodResolver(registerSchema),
  });

  const onLoginSubmit = async (data: LoginFields) => {
    setErrorMsg(null);
    try {
      await login(data.email, data.password);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to login');
    }
  };

  const onRegisterSubmit = async (data: RegisterFields) => {
    setErrorMsg(null);
    try {
      await register(data.email, data.password, data.name || undefined);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to register');
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrorMsg(null);
    resetLoginForm();
    resetRegisterForm();
  };

  const isSubmitting = isLoginSubmitting || isRegisterSubmitting;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 select-none relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl" />

      <div className="max-w-md w-full bg-slate-900/60 border border-slate-800/80 backdrop-blur-2xl rounded-2xl p-8 shadow-2xl space-y-6 z-10 transition-all duration-300">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-slate-400 text-sm">
            {isLogin ? 'Sign in to access your interview dashboard' : 'Join now to prepare and practice'}
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg text-center animate-shake">
            {errorMsg}
          </div>
        )}

        {isLogin ? (
          <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-2 bg-slate-950/50 border border-slate-800 focus:border-purple-500 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none transition-colors"
                  placeholder="name@example.com"
                  {...registerLogin('email')}
                />
              </div>
              {loginErrors.email && (
                <p className="text-xs text-red-400 mt-1">{loginErrors.email.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-2 bg-slate-950/50 border border-slate-800 focus:border-purple-500 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none transition-colors"
                  placeholder="••••••••"
                  {...registerLogin('password')}
                />
              </div>
              {loginErrors.password && (
                <p className="text-xs text-red-400 mt-1">{loginErrors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-purple-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit(onRegisterSubmit)} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Your Name (Optional)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <UserIcon size={16} />
                </span>
                <input
                  type="text"
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-2 bg-slate-950/50 border border-slate-800 focus:border-purple-500 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none transition-colors"
                  placeholder="John Doe"
                  {...registerRegister('name')}
                />
              </div>
              {registerErrors.name && (
                <p className="text-xs text-red-400 mt-1">{registerErrors.name.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-2 bg-slate-950/50 border border-slate-800 focus:border-purple-500 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none transition-colors"
                  placeholder="name@example.com"
                  {...registerRegister('email')}
                />
              </div>
              {registerErrors.email && (
                <p className="text-xs text-red-400 mt-1">{registerErrors.email.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-2 bg-slate-950/50 border border-slate-800 focus:border-purple-500 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none transition-colors"
                  placeholder="••••••••"
                  {...registerRegister('password')}
                />
              </div>
              {registerErrors.password && (
                <p className="text-xs text-red-400 mt-1">{registerErrors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-purple-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        )}

        <div className="text-center pt-2">
          <button
            onClick={toggleMode}
            disabled={isSubmitting}
            className="text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};
