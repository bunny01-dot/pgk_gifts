'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, MessageSquare, Loader2, Sparkles } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { OrdersService } from '@/services/orders.service';

interface FeedbackModalProps {
  orderId: string;
  onSuccess: () => void;
}

export function FeedbackModal({ orderId, onSuccess }: FeedbackModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');

  const handleSubmit = async () => {
    if (!comment.trim()) {
      toast({ variant: "destructive", title: "Review Empty", description: "Please share a brief comment about your experience." });
      return;
    }

    setLoading(true);
    try {
      const svc = new OrdersService(firestore);
      await svc.submitFeedback(orderId, rating, comment);
      
      toast({ 
        title: "Feedback Submitted!", 
        description: "Thank you for helping us craft better memories." 
      });
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Submission Failed", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-full h-16 px-10 border-primary/30 text-primary hover:bg-primary hover:text-white transition-all font-bold">
          <MessageSquare className="w-5 h-5 mr-3" /> Share Feedback & Review
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-2xl md:rounded-[3rem] p-5 md:p-10 border-none shadow-premium bg-card">
        <DialogHeader className="mb-6 text-center">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <DialogTitle className="text-3xl font-headline font-bold">Share Your Experience</DialogTitle>
          <DialogDescription className="text-sm mt-1">
            How did you like your handcrafted PGK Gift? Your review helps our small studio grow!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center space-y-2 py-4">
            <Label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Your Rating</Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="transition-transform active:scale-90 hover:scale-110"
                >
                  <Star 
                    className={`w-10 h-10 transition-colors ${
                      star <= (hoverRating ?? rating) 
                        ? 'fill-amber-400 text-amber-400 drop-shadow-md' 
                        : 'text-muted-foreground/30 fill-none'
                    }`} 
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-primary mt-2">
              {rating === 5 && "Absolute Masterpiece! ⭐⭐⭐⭐⭐"}
              {rating === 4 && "Loved it! ⭐⭐⭐⭐"}
              {rating === 3 && "Nice gift! ⭐⭐⭐"}
              {rating === 2 && "Could be better ⭐⭐"}
              {rating === 1 && "Disappointed ⭐"}
            </span>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Written Review</Label>
            <Textarea 
              className="rounded-2xl bg-secondary/35 border-none p-5 text-sm min-h-[110px] resize-none focus-visible:ring-primary"
              placeholder="Tell us what you liked (or how we can improve)..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="mt-8">
          <Button 
            disabled={loading} 
            onClick={handleSubmit}
            className="w-full h-14 rounded-full text-base font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]"
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Submitting...</> : "Submit Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
