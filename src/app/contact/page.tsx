'use client';

import { CONTACT_INFO } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, Mail, MapPin, Instagram, Youtube, MessageSquare, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ContactPage() {
  return (
    <div className="min-h-screen pt-32 bg-background">
      <div className="container mx-auto px-4">
        <header className="text-center max-w-3xl mx-auto mb-24 space-y-6">
          <h1 className="text-5xl md:text-7xl font-headline font-bold text-foreground">Get In Touch</h1>
          <p className="text-xl text-muted-foreground">
            We'd love to hear from you. Whether you have a question about our products or want to discuss a custom project, we're here to help.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start max-w-6xl mx-auto mb-24">
          <div className="space-y-12">
            <div className="space-y-8">
               <h2 className="text-4xl font-headline font-bold text-foreground">Contact Information</h2>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
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

            <div className="flex flex-col gap-4">
               <Button asChild size="lg" className="rounded-full h-16 text-xl gap-3 shadow-xl">
                 <a href={CONTACT_INFO.whatsapp} target="_blank" rel="noopener noreferrer">
                   <MessageSquare className="w-6 h-6" /> Chat on WhatsApp
                 </a>
               </Button>
               <div className="flex gap-4">
                 <Button asChild variant="outline" className="flex-1 rounded-full h-14 border-2 gap-2 hover:bg-primary hover:text-primary-foreground">
                   <a href={CONTACT_INFO.instagram} target="_blank" rel="noopener noreferrer">
                     <Instagram className="w-5 h-5" /> Instagram
                   </a>
                 </Button>
                 <Button asChild variant="outline" className="flex-1 rounded-full h-14 border-2 gap-2 hover:bg-primary hover:text-primary-foreground">
                   <a href={CONTACT_INFO.youtube} target="_blank" rel="noopener noreferrer">
                     <Youtube className="w-5 h-5" /> YouTube
                   </a>
                 </Button>
               </div>
            </div>
          </div>

          <div className="space-y-8">
            <h2 className="text-4xl font-headline font-bold text-foreground">Visit Our Location</h2>
            <Card className="overflow-hidden border-none shadow-2xl rounded-[3rem]">
              <CardContent className="p-0 h-[500px] relative">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15712.3023963483!2d78.7061763!3d9.8856143!2m3!1f0!2f0!3f0!3m2!1i1024!2i1026!3m4!1s0x3b0067645601972f%3A0xc6e467d302a24683!2zUEdLIFNUVURJTw!5e0!3m2!1sen!2sin!4v1709400000000!5m2!1sen!2sin" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  className="dark:opacity-80"
                ></iframe>
              </CardContent>
            </Card>
            <Button asChild variant="link" className="text-lg font-bold p-0 h-auto">
               <a href={CONTACT_INFO.googleMap} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                 Open in Google Maps <MapPin className="w-4 h-4" />
               </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactItem({ icon, title, content, subContent }: { icon: React.ReactNode; title: string; content: string; subContent?: string }) {
  return (
    <div className="space-y-3">
      <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-muted-foreground uppercase tracking-widest text-[10px]">{title}</h4>
        <p className="font-headline text-xl font-bold leading-tight text-foreground">{content}</p>
        {subContent && <p className="text-sm text-muted-foreground mt-1">{subContent}</p>}
      </div>
    </div>
  );
}
