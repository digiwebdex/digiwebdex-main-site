import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useLanguage } from '@/lib/i18n';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock, Phone, ShieldCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function Login() {
  const { signIn } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = language === 'en' ? '/en' : '/bn';

  // Email login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Phone OTP state
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const from = location.state?.from?.pathname || `${basePath}/dashboard`;

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      toast.error(language === 'bn' ? 'লগইন ব্যর্থ হয়েছে' : 'Login failed', { description: error.message });
      setLoading(false);
      return;
    }
    toast.success(language === 'bn' ? 'সফলভাবে লগইন হয়েছে' : 'Successfully logged in');
    navigate(from, { replace: true });
  };

  const handleSendOTP = async () => {
    if (!phone || phone.length < 10) {
      toast.error(language === 'bn' ? 'সঠিক ফোন নম্বর দিন' : 'Enter a valid phone number');
      return;
    }
    setOtpLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { phone },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setOtpSent(true);
      toast.success(language === 'bn' ? 'OTP পাঠানো হয়েছে' : 'OTP sent to your phone');
    } catch (err) {
      toast.error((err as Error).message || 'OTP পাঠানো ব্যর্থ');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      toast.error(language === 'bn' ? '৬ সংখ্যার OTP দিন' : 'Enter 6-digit OTP');
      return;
    }
    setOtpLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { phone, otp: otpCode },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Sign in with the temporary credentials returned
      if (data?.email && data?.password) {
        const { error: signInErr } = await signIn(data.email, data.password);
        if (signInErr) throw signInErr;
        toast.success(language === 'bn' ? 'সফলভাবে লগইন হয়েছে' : 'Successfully logged in');
        navigate(from, { replace: true });
      }
    } catch (err) {
      toast.error((err as Error).message || 'OTP ভেরিফাই ব্যর্থ');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md glass-card">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">
              {language === 'bn' ? 'লগইন করুন' : 'Sign In'}
            </CardTitle>
            <CardDescription>
              {language === 'bn'
                ? 'ইমেইল অথবা ফোন নম্বর দিয়ে লগইন করুন'
                : 'Sign in with email or phone number'}
            </CardDescription>
          </CardHeader>

          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mx-auto px-6">
              <TabsTrigger value="email" className="gap-1">
                <Mail className="h-4 w-4" />
                {language === 'bn' ? 'ইমেইল' : 'Email'}
              </TabsTrigger>
              <TabsTrigger value="phone" className="gap-1">
                <Phone className="h-4 w-4" />
                {language === 'bn' ? 'ফোন OTP' : 'Phone OTP'}
              </TabsTrigger>
            </TabsList>

            {/* Email Login */}
            <TabsContent value="email">
              <form onSubmit={handleEmailLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{language === 'bn' ? 'ইমেইল' : 'Email'}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="email" type="email" placeholder="example@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">{language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}</Label>
                      <Link to={`${basePath}/auth/forgot-password`} className="text-sm text-primary hover:underline">
                        {language === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot password?'}
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button type="submit" className="w-full gradient-button" disabled={loading}>
                    {loading ? (language === 'bn' ? 'লগইন হচ্ছে...' : 'Signing in...') : (language === 'bn' ? 'লগইন' : 'Sign In')}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>

            {/* Phone OTP Login */}
            <TabsContent value="phone">
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">{language === 'bn' ? 'ফোন নম্বর' : 'Phone Number'}</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="01XXXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10"
                      disabled={otpSent}
                    />
                  </div>
                </div>

                {!otpSent ? (
                  <Button onClick={handleSendOTP} className="w-full gradient-button" disabled={otpLoading}>
                    {otpLoading ? (language === 'bn' ? 'পাঠানো হচ্ছে...' : 'Sending...') : (language === 'bn' ? 'OTP পাঠান' : 'Send OTP')}
                  </Button>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="otp">{language === 'bn' ? 'OTP কোড' : 'OTP Code'}</Label>
                      <div className="relative">
                        <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="otp"
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          placeholder="৬ সংখ্যার কোড"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          className="pl-10 text-center text-lg tracking-widest"
                        />
                      </div>
                    </div>
                    <Button onClick={handleVerifyOTP} className="w-full gradient-button" disabled={otpLoading}>
                      {otpLoading ? (language === 'bn' ? 'যাচাই হচ্ছে...' : 'Verifying...') : (language === 'bn' ? 'যাচাই করুন' : 'Verify OTP')}
                    </Button>
                    <button
                      type="button"
                      onClick={() => { setOtpSent(false); setOtpCode(''); }}
                      className="text-sm text-primary hover:underline w-full text-center"
                    >
                      {language === 'bn' ? 'আবার OTP পাঠান' : 'Resend OTP'}
                    </button>
                  </>
                )}
              </CardContent>
            </TabsContent>
          </Tabs>

          <CardFooter className="flex flex-col gap-4 pt-0">
            <p className="text-sm text-center text-muted-foreground">
              {language === 'bn' ? 'অ্যাকাউন্ট নেই?' : "Don't have an account?"}{' '}
              <Link to={`${basePath}/auth/register`} className="text-primary hover:underline">
                {language === 'bn' ? 'রেজিস্টার করুন' : 'Register'}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
}
