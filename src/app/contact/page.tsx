'use client';

import { CONTACT_INFO } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, Mail, MapPin, Instagram, Youtube, MessageSquare, Clock, Navigation, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ContactPage() {
  const primaryPhoneHref = `tel:${CONTACT_INFO.phone.replace(/\D/g, '')}`;

  return (
    <div className="min-h-screen pt-24 md:pt-32 bg-background">
      <div className="container mx-auto px-4">
        <header className="text-center max-w-3xl mx-auto mb-8 md:mb-20 space-y-3 md:space-y-6">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-primary shadow-sm">
            <MessageSquare className="h-3.5 w-3.5" /> Contact
          </div>
          <h1 className="text-4xl md:text-7xl font-headline font-bold text-foreground">Get In Touch</h1>
          <p className="text-base md:text-xl text-muted-foreground leading-relaxed">
            We&apos;d love to hear from you. Whether you have a question about our products or want to discuss a custom project, we&apos;re here to help.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-20 items-start max-w-6xl mx-auto mb-14 md:mb-24">
          <div className="space-y-6 md:space-y-10">
            <div className="grid grid-cols-2 gap-3 md:gap-4">
               <Button asChild size="lg" className="col-span-2 rounded-2xl md:rounded-full h-14 md:h-16 text-base md:text-xl gap-3 shadow-xl shadow-primary/15">
                 <a href={CONTACT_INFO.whatsapp} target="_blank" rel="noopener noreferrer">
                   <MessageSquare className="w-5 h-5 md:w-6 md:h-6" /> Chat on WhatsApp
                 </a>
               </Button>
               <Button asChild variant="outline" className="rounded-2xl h-12 md:h-14 border md:border-2 gap-2 font-bold hover:bg-primary hover:text-primary-foreground">
                 <a href={primaryPhoneHref}>
                   <Phone className="w-4 h-4" /> Call
                 </a>
               </Button>
               <Button asChild variant="outline" className="rounded-2xl h-12 md:h-14 border md:border-2 gap-2 font-bold hover:bg-primary hover:text-primary-foreground">
                 <a href={`mailto:${CONTACT_INFO.email}`}>
                   <Mail className="w-4 h-4" /> Email
                 </a>
               </Button>
            </div>

            <div className="space-y-4 md:space-y-6">
               <h2 className="text-2xl md:text-4xl font-body font-bold text-foreground">Contact Information</h2>
               <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-5">
                  <ContactItem 
                    icon={<Phone className="w-6 h-6" />} 
                    title="Phone" 
                    content={CONTACT_INFO.phone} 
                    subContent={CONTACT_INFO.alternateNumbers.join(' / ')}
                  />
                  <ContactItem 
                    icon={<Mail className="w-6 h-6" />} 
                    title="Email" 
                    content={CONTACT_INFO.email}
                  />
                  <ContactItem 
                    icon={<Clock className="w-6 h-6" />} 
                    title="Opening Hours" 
                    content={CONTACT_INFO.hours}
                  />
                  <ContactItem 
                    icon={<MapPin className="w-6 h-6" />} 
                    title="Our Studio" 
	                    content={CONTACT_INFO.address}
	                  />
	               </div>
	            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4">
               <Button asChild variant="secondary" className="rounded-2xl h-12 md:h-14 gap-2 font-bold">
                 <a href={CONTACT_INFO.instagram} target="_blank" rel="noopener noreferrer">
                   <Instagram className="w-5 h-5" /> Instagram
                 </a>
               </Button>
               <Button asChild variant="secondary" className="rounded-2xl h-12 md:h-14 gap-2 font-bold">
                 <a href={CONTACT_INFO.youtube} target="_blank" rel="noopener noreferrer">
                   <Youtube className="w-5 h-5" /> YouTube
                 </a>
               </Button>
            </div>
          </div>

          <div className="space-y-4 md:space-y-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl md:text-4xl font-body font-bold text-foreground">Visit Our Location</h2>
                <p className="mt-1 text-sm text-muted-foreground">Kallal, Tamil Nadu</p>
              </div>
              <Button asChild size="icon" variant="outline" className="rounded-2xl h-12 w-12 border-2 shrink-0">
                <a href={CONTACT_INFO.googleMap} target="_blank" rel="noopener noreferrer" aria-label="Open in Google Maps">
                  <Navigation className="w-5 h-5" />
                </a>
              </Button>
            </div>
            <Card className="overflow-hidden border border-border/50 shadow-2xl rounded-3xl md:rounded-[3rem] bg-card">
              <CardContent className="p-0">
                <div className="h-[300px] md:h-[500px] relative">
	                <iframe 
	                  src={`https://maps.google.com/maps?q=${encodeURIComponent('PGK Studio, Kallal')}&t=&z=15&ie=UTF8&iwloc=&output=embed`} 
	                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
	                  className="dark:opacity-80"
	                ></iframe>
                </div>
                <div className="p-4 md:p-6">
                  <Button asChild className="w-full h-12 md:h-14 rounded-2xl font-bold">
                    <a href={CONTACT_INFO.googleMap} target="_blank" rel="noopener noreferrer">
                      Open in Google Maps <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactItem({ icon, title, content, subContent }: { icon: React.ReactNode; title: string; content: string; subContent?: string }) {
  return (
    <div className="flex gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <h4 className="font-bold text-muted-foreground uppercase tracking-widest text-[10px]">{title}</h4>
        <p className="font-sans text-sm md:text-lg font-bold leading-snug text-foreground break-words">{content}</p>
        {subContent && <p className="text-sm text-muted-foreground mt-1">{subContent}</p>}
      </div>
    </div>
  );
}
