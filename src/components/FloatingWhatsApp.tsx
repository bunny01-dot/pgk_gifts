
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
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-8 right-8 z-[100] bg-[#25D366] text-white p-5 rounded-full shadow-[0_10px_40px_rgba(37,211,102,0.4)] flex items-center justify-center group"
      aria-label="Contact on WhatsApp"
    >
      <MessageCircle className="w-8 h-8 fill-current" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-500 ease-in-out font-bold ml-0 group-hover:ml-3 text-lg">
        Order Now
      </span>
    </motion.a>
  );
}
