
'use client';

import { MessageCircle } from 'lucide-react';
import { CONTACT_INFO } from '@/lib/data';
import { motion } from 'framer-motion';

export function FloatingWhatsApp() {
  return (
    <motion.a
      href={CONTACT_INFO.whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
      }}
      whileHover={{ width: 'auto', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-8 right-8 z-[100] hidden bg-[#25D366] text-white p-4 h-16 w-16 hover:w-auto rounded-full shadow-[0_10px_40px_rgba(37,211,102,0.4)] md:flex items-center justify-center gap-0 hover:gap-3 group transition-all duration-500 ease-in-out overflow-hidden"
      aria-label="Chat on WhatsApp"
    >
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
        className="shrink-0 flex items-center justify-center"
      >
        <MessageCircle className="w-8 h-8 fill-current" />
      </motion.div>
      <span className="font-bold text-base tracking-tight max-w-0 group-hover:max-w-[200px] opacity-0 group-hover:opacity-100 transition-all duration-500 whitespace-nowrap overflow-hidden">
        Chat with us
      </span>
    </motion.a>
  );
}
