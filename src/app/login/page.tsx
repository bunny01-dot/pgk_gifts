'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CONTACT_INFO } from '@/lib/data';
import { useAuth, useUser } from '@/firebase';
import { initiateEmailSignIn, initiateEmailSignUp } from '@/firebase/non-blocking-login';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab ] = useState('login');
  
  const redirectPath = searchParams.get('redirect') || '/';

  useEffect(() => {
    if (user) {
      router.push(redirectPath);
    }
  }, [user, router, redirectPath]);

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      setLoading(false);
      toast({ variant: "destructive", title: "Social Auth Error", description: error.message });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!auth) return;
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
      setTimeout(() => setLoading(false), 2000);
    } catch (error: any) {
      setLoading(false);
      toast({ variant: "destructive", title: "Security Halt", description: error.message });
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
    <div className="min-h-screen flex bg-background overflow-hidden selection:bg-primary/20">
      {/* Left Pane: Cinematic Visual */}
      <div className="hidden lg:flex w-1/2 relative p-12 flex-col justify-between overflow-hidden">
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-x-0 inset-y-0"
        >
          <Image
            src="/boutique_auth_sidebar_1776461961255.png"
            alt="Boutique Showcase"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </motion.div>

        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20">
            <Image src={CONTACT_INFO.headerLogo} alt="Logo" width={32} height={32} />
          </div>
          <span className="text-white font-headline text-2xl font-bold tracking-tight">PGK GIFTS</span>
        </div>

        <div className="relative z-10 space-y-6 max-w-lg mb-12">
          <Badge className="bg-primary/20 text-primary border-primary/30 backdrop-blur-md rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-widest">
            Handcrafted Masterpieces
          </Badge>
          <h2 className="text-7xl font-headline font-black text-white leading-[1.05] tracking-tighter">
            Where Gifts Become <span className="italic text-primary">Art.</span>
          </h2>
          <p className="text-xl text-white/60 leading-relaxed font-medium">
            Join the community of elite gift-givers and discover the magic of personalized craftsmanship.
          </p>
          <div className="flex items-center gap-8 pt-6">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`w-12 h-12 rounded-full border-4 border-black bg-muted ring-2 ring-white/10`} />
              ))}
            </div>
            <p className="text-sm font-bold text-white/80 uppercase tracking-widest">+2.4k Members</p>
          </div>
        </div>
      </div>

      {/* Right Pane: Auth Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative overflow-y-auto">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(var(--primary-rgb),0.05),transparent_50%)]" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8 relative z-10"
        >
          <div className="text-center space-y-2">
            <h1 className="text-4xl md:text-5xl font-headline font-black tracking-tight">Access Studio</h1>
            <p className="text-lg text-muted-foreground font-medium italic">Premium authentication required.</p>
          </div>

          {/* Social Provider */}
          <Button 
             onClick={handleGoogleSignIn}
             variant="outline" 
             className="w-full h-16 rounded-2xl border border-white/10 hover:bg-white/5 flex items-center justify-center gap-4 transition-all active:scale-95 group relative mb-4"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="text-sm font-bold uppercase tracking-widest">Sign in with Google</span>
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5" /></div>
            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest text-muted-foreground/40"><span className="bg-background px-4">Or use credentials</span></div>
          </div>

          <Tabs defaultValue="login" onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-xl h-12 bg-white/5 p-1 mb-8">
              <TabsTrigger value="login" className="rounded-lg font-bold uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-lg font-bold uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">Join Us</TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <TabsContent key="login" value="login" className="m-0 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-4 opacity-40">Email</Label>
                    <Input name="email" type="email" required placeholder="name@email.com" className="h-14 rounded-2xl bg-white/5 border-none text-base focus-visible:ring-1 focus-visible:ring-primary/40 px-6 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center ml-4">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Password</Label>
                      <Button variant="link" size="sm" className="text-[9px] uppercase font-bold p-0 h-auto opacity-30 hover:opacity-100">Forgot?</Button>
                    </div>
                    <Input name="password" type="password" required placeholder="••••••••" className="h-14 rounded-2xl bg-white/5 border-none text-base focus-visible:ring-1 focus-visible:ring-primary/40 px-6 transition-all" />
                  </div>
                  <Button disabled={loading} className="w-full h-14 rounded-2xl text-base font-bold shadow-xl mt-4">
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Enter Studio'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent key="signup" value="signup" className="m-0 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-4 opacity-40">Full Name</Label>
                    <Input name="name" required placeholder="Collector Name" className="h-14 rounded-2xl bg-white/5 border-none text-base focus-visible:ring-1 focus-visible:ring-primary/40 px-6 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-4 opacity-40">Email</Label>
                    <Input name="email" type="email" required placeholder="name@email.com" className="h-14 rounded-2xl bg-white/5 border-none text-base focus-visible:ring-1 focus-visible:ring-primary/40 px-6 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-4 opacity-40">Create Password</Label>
                    <Input name="password" type="password" required placeholder="••••••••" className="h-14 rounded-2xl bg-white/5 border-none text-base focus-visible:ring-1 focus-visible:ring-primary/40 px-6 transition-all" />
                  </div>
                  <Button disabled={loading} className="w-full h-14 rounded-2xl text-base font-bold shadow-xl mt-4">
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </AnimatePresence>
          </Tabs>

          <p className="text-center text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest">
            Need support? <Link href="/contact" className="text-primary hover:underline">Contact curation</Link>
          </p>
        </motion.div>
      </div>
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
