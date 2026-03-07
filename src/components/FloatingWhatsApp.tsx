
import { MessageCircle } from "lucide-react";
import Link from "next/link";

export function FloatingWhatsApp() {
  return (
    <Link
      href="https://wa.me/1234567890"
      target="_blank"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center group"
      aria-label="Contact on WhatsApp"
    >
      <MessageCircle className="w-6 h-6 fill-current" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out font-medium ml-0 group-hover:ml-2">
        Chat with us
      </span>
    </Link>
  );
}
