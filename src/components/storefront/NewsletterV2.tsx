'use client';

import { useState } from 'react';
import { Send, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export function NewsletterV2() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
        setLoading(false);
        setSubscribed(true);
        toast.success("Welcome aboard! You've successfully subscribed.");
        localStorage.setItem('newsletter_subscribed', 'true');
    }, 1500);
  };

  return (
    <section className="py-24">
      <div className="container px-4 md:px-6">
        <div className="relative overflow-hidden bg-primary rounded-[3rem] p-12 md:p-24 text-primary-foreground shadow-2xl shadow-primary/20">
            {/* Background pattern */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 size-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 size-64 bg-white/5 rounded-full blur-3xl" />
            
            <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto space-y-8">
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-none px-6 py-1 font-bold tracking-widest uppercase text-[10px]">
                    Join the Community
                </Badge>
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight">
                    Get <span className="text-black/20">Exclusive</span> Offers Sent To Your Inbox
                </h2>
                <p className="text-primary-foreground/80 md:text-xl font-medium">
                    Subscribe now and get 15% off your first order! Stay updated with new collections and member-only flash sales.
                </p>

                {subscribed ? (
                    <div className="bg-white/10 border border-white/20 p-6 rounded-3xl flex items-center gap-4 animate-in fade-in zoom-in duration-500">
                        <div className="bg-white rounded-full p-2 text-primary">
                            <CheckCircle2 className="size-6" />
                        </div>
                        <div className="text-left">
                            <p className="font-bold">You're on the list!</p>
                            <p className="text-xs text-primary-foreground/70">Check your email for your welcome discount code.</p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubscribe} className="w-full relative max-w-md group">
                        <Input 
                            type="email" 
                            placeholder="your.email@example.com"
                            className="h-16 w-full rounded-2xl bg-white/10 border-white/20 text-white placeholder:text-white/50 pl-6 pr-40 focus-visible:ring-white/30 transition-all text-lg"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <div className="absolute right-2 top-2">
                             <Button 
                                type="submit" 
                                className="h-12 px-8 rounded-xl bg-white text-black hover:bg-white/90 font-black text-sm uppercase tracking-widest gap-2"
                                disabled={loading}
                             >
                                 {loading ? (
                                     <Loader2 className="size-4 animate-spin" />
                                 ) : (
                                     <>
                                        Subscribe <Send className="size-4" />
                                     </>
                                 )}
                             </Button>
                        </div>
                    </form>
                )}
                
                <p className="text-[10px] text-primary-foreground/50 uppercase tracking-widest font-bold">
                    UNSUBSCRIBE ANYTIME • NO SPAM • PRIVACY PROTECTED
                </p>
            </div>
        </div>
      </div>
    </section>
  );
}
