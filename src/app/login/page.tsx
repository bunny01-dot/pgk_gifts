'use client';

import { useState, useEffect, Suspense } from 'react';
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

function LoginContent() {
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

    try {
      if (activeTab === 'login') {
        initiateEmailSignIn(auth, email, password);
      } else {
        initiateEmailSignUp(auth, email, password);
      }
      
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 py-32 px-4 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/3 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl"
      >
        <div className="text-center mb-12 space-y-4">
          <Link href="/" className="inline-block group">
            <div className="relative w-24 h-24 mx-auto transition-transform duration-700 group-hover:scale-110">
              <Image
                src={CONTACT_INFO.headerLogo}
                alt="PGK GIFTS Logo"
                fill
                className="object-contain"
              />
            </div>
          </Link>
          <h1 className="text-5xl font-headline font-bold">Studio Access</h1>
          <p className="text-muted-foreground font-light text-lg">Secure authentication for our premium members.</p>
        </div>

        <Card className="rounded-[2.5rem] border border-border/50 shadow-premium overflow-hidden bg-card/80 backdrop-blur-3xl">
          <CardContent className="p-12">
            <Tabs defaultValue="login" onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-2xl h-16 bg-secondary p-1.5 mb-10">
                <TabsTrigger value="login" className="rounded-xl font-bold uppercase tracking-[0.2em] text-[10px] data-[state=active]:bg-white data-[state=active]:shadow-lg">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-xl font-bold uppercase tracking-[0.2em] text-[10px] data-[state=active]:bg-white data-[state=active]:shadow-lg">Join Us</TabsTrigger>
              </TabsList>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {activeTab === 'signup' && (
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-6">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-7 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            name="name"
                            required
                            placeholder="Recipient Name"
                            className="h-16 rounded-full pl-16 pr-8 bg-secondary/50 border-border focus-visible:ring-primary text-base"
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-6">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-7 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          name="email"
                          type="email"
                          required
                          placeholder="studio@pgk.com"
                          className="h-16 rounded-full pl-16 pr-8 bg-secondary/50 border-border focus-visible:ring-primary text-base"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center ml-6">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Password</Label>
                        {activeTab === 'login' && (
                          <Button variant="link" className="text-[10px] uppercase font-bold text-primary p-0 h-auto tracking-widest opacity-60 hover:opacity-100">Reset</Button>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-7 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          name="password"
                          type="password"
                          required
                          placeholder="••••••••"
                          className="h-16 rounded-full pl-16 pr-8 bg-secondary/50 border-border focus-visible:ring-primary text-base"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-16 rounded-full text-lg font-bold shadow-2xl shadow-primary/20 transition-all active:scale-95 mt-4"
                    >
                      {loading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <span className="flex items-center gap-3">
                          {activeTab === 'login' ? 'Authenticate' : 'Establish Account'} <ArrowRight className="w-5 h-5" />
                        </span>
                      )}
                    </Button>
                  </form>
                </motion.div>
              </AnimatePresence>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}