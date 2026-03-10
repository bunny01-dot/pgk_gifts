'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CONTACT_INFO } from '@/lib/data';
import { useAuth, useUser } from '@/firebase';
import { initiateEmailSignIn, initiateEmailSignUp } from '@/firebase/non-blocking-login';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  
  const redirectPath = searchParams.get('redirect') || '/';

  useEffect(() => {
    if (user && !loading) {
      router.push(redirectPath);
    }
  }, [user, router, redirectPath, loading]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

    try {
      if (activeTab === 'login') {
        initiateEmailSignIn(auth, email, password);
      } else {
        initiateEmailSignUp(auth, email, password);
        // Note: In a real app, we'd update the profile with the name here
      }
      
      // We don't await here because our auth provider will pick up the state change
      // But we'll give it a moment to show a loading state
      setTimeout(() => {
        setLoading(false);
      }, 2000);

    } catch (error: any) {
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: error.message || "Failed to process your request.",
      });
    }
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-accent/5">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-accent/5 py-32 px-4">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl"
      >
        <div className="text-center mb-10 space-y-4">
          <Link href="/" className="inline-block">
            <div className="relative w-32 h-32 mx-auto">
              <Image
                src={CONTACT_INFO.headerLogo}
                alt="PGK GIFTS Logo"
                fill
                className="object-contain"
              />
            </div>
          </Link>
          <h1 className="text-4xl font-headline font-bold">Welcome to PGK Gifts</h1>
          <p className="text-muted-foreground">Premium personalized gifts and memories.</p>
        </div>

        <Card className="rounded-[3rem] border-none shadow-2xl overflow-hidden bg-card/80 backdrop-blur-xl">
          <CardContent className="p-10">
            <Tabs defaultValue="login" onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-full h-14 bg-accent/20 p-1 mb-10">
                <TabsTrigger value="login" className="rounded-full font-bold uppercase tracking-widest text-xs data-[state=active]:bg-white data-[state=active]:shadow-lg">Login</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-full font-bold uppercase tracking-widest text-xs data-[state=active]:bg-white data-[state=active]:shadow-lg">Sign Up</TabsTrigger>
              </TabsList>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {activeTab === 'signup' && (
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-4">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            name="name"
                            required
                            placeholder="John Doe"
                            className="h-16 rounded-full pl-16 pr-8 bg-accent/5 border-none focus-visible:ring-primary"
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-4">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          name="email"
                          type="email"
                          required
                          placeholder="name@example.com"
                          className="h-16 rounded-full pl-16 pr-8 bg-accent/5 border-none focus-visible:ring-primary"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center ml-4">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Password</Label>
                        {activeTab === 'login' && (
                          <Button variant="link" className="text-[10px] uppercase font-bold text-primary p-0 h-auto">Forgot Password?</Button>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          name="password"
                          type="password"
                          required
                          placeholder="••••••••"
                          className="h-16 rounded-full pl-16 pr-8 bg-accent/5 border-none focus-visible:ring-primary"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-16 rounded-full text-lg font-bold shadow-xl transition-all active:scale-95"
                    >
                      {loading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <>{activeTab === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight className="ml-2 w-5 h-5" /></>
                      )}
                    </Button>
                  </form>
                </motion.div>
              </AnimatePresence>
            </Tabs>

            <div className="mt-10 pt-10 border-t border-dashed flex flex-col items-center gap-6">
              <div className="flex items-center gap-3 text-muted-foreground text-xs font-medium">
                <CheckCircle2 className="w-4 h-4 text-green-500" /> Secure Encryption
                <Sparkles className="w-4 h-4 text-yellow-500 ml-2" /> One-click Auth
              </div>
              <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest leading-relaxed px-10">
                By continuing, you agree to PGK Gifts' Terms of Service and Privacy Policy.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
