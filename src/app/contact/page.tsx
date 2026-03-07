
"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Instagram, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Message Sent!",
        description: "John Solomon will get back to you shortly.",
      });
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  return (
    <div className="bg-background py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-5xl font-headline font-bold mb-6">Let's Create Together</h1>
          <p className="text-xl text-muted-foreground">
            Whether you want to book a photography session, inquire about custom gifts, 
            or just say hello, we're always happy to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-24">
          {/* Contact Details */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-none shadow-lg bg-primary text-primary-foreground">
              <CardContent className="p-8 space-y-8">
                <h3 className="text-2xl font-headline font-bold">Contact Info</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-white/10 p-3 rounded-full"><Phone className="w-6 h-6" /></div>
                    <div>
                      <p className="font-bold">Phone</p>
                      <p className="opacity-80">+1 (234) 567-890</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-white/10 p-3 rounded-full"><Mail className="w-6 h-6" /></div>
                    <div>
                      <p className="font-bold">Email</p>
                      <p className="opacity-80">hello@pgklegacy.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-white/10 p-3 rounded-full"><MapPin className="w-6 h-6" /></div>
                    <div>
                      <p className="font-bold">Studio</p>
                      <p className="opacity-80">123 Creative Studio, Art District, New York</p>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/20">
                  <p className="font-bold mb-4">Follow Us</p>
                  <div className="flex gap-4">
                    <Button variant="ghost" size="icon" className="bg-white/10 hover:bg-white/20 rounded-full">
                      <Instagram />
                    </Button>
                    <Button variant="ghost" size="icon" className="bg-white/10 hover:bg-white/20 rounded-full">
                      <MessageCircle />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <Card className="border-none shadow-xl p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="John Doe" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="john@example.com" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">What are you interested in?</Label>
                  <Input id="subject" placeholder="e.g. Wedding Photography Inquiry" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Your Message</Label>
                  <Textarea id="message" placeholder="Tell us more about your project or inquiry..." className="min-h-[150px]" required />
                </div>
                <Button type="submit" size="lg" className="w-full md:w-auto px-12 rounded-full" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send Message"} <Send className="ml-2 w-4 h-4" />
                </Button>
              </form>
            </Card>
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="w-full h-[500px] rounded-[2rem] overflow-hidden shadow-2xl relative grayscale hover:grayscale-0 transition-all duration-700">
           {/* In a real app, use @vis.gl/react-google-maps here */}
           <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
             <div className="text-center space-y-4">
               <MapPin className="w-12 h-12 text-primary mx-auto animate-bounce" />
               <p className="text-xl font-headline font-bold">Find Us in the Art District</p>
               <p className="text-muted-foreground">Interactive Map Integration Ready</p>
             </div>
           </div>
           {/* Mock Map Image */}
           <Image 
             src="https://picsum.photos/seed/pgk-map/1200/500" 
             alt="Location map" 
             fill 
             className="object-cover opacity-30" 
           />
        </div>
      </div>
    </div>
  );
}
