
import { Timestamp } from 'firebase/firestore';

export interface PortfolioItem {
  id: string;
  title: string;
  category: PortfolioCategory;
  subcategory: string;
  image: string;
  images: string[];
  description: string;
  tags: string[];
  featured: boolean;
  createdAt: any;
}

export type PortfolioCategory = 
  | "Crystal Gifts"
  | "Light & Lamp Gifts"
  | "Cute Gift Items"
  | "Photo Frames & Wall Decor"
  | "Customized Gifts"
  | "Car Dashboard & Idols"
  | "Corporate & Name Boards";

export const PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    id: "p1",
    title: "Panda Night Lamp (6 Color LED)",
    category: "Light & Lamp Gifts",
    subcategory: "Night Lamps",
    image: "https://i.postimg.cc/kG6y8qBj/500-rs-6-colour-lights-panda-light-lamp.png",
    images: [
      "https://i.postimg.cc/kG6y8qBj/500-rs-6-colour-lights-panda-light-lamp.png",
      "https://i.postimg.cc/Hnq99Ryq/Light-lamp-sleeping-panda-99-rs.png"
    ],
    description: "Our signature bedside companion. This soft-silicone panda features 6-color transition shades, perfect for children's rooms and emotional gifting.",
    tags: ["LED", "Kids", "Bedside", "Rechargeable"],
    featured: true,
    createdAt: new Date()
  },
  {
    id: "p2",
    title: "Heart Sponge Custom Frame",
    category: "Photo Frames & Wall Decor",
    subcategory: "Anniversary",
    image: "https://i.postimg.cc/hvk116mR/heart-sponge.png",
    images: [
      "https://i.postimg.cc/hvk116mR/heart-sponge.png"
    ],
    description: "A textures-rich heart-shaped pillow frame that blends plush comfort with high-definition photo printing. Designed for anniversaries.",
    tags: ["Anniversary", "Heart Shaped", "Custom Print"],
    featured: true,
    createdAt: new Date()
  },
  {
    id: "p3",
    title: "Breathing Teddy Experience",
    category: "Cute Gift Items",
    subcategory: "Interactive Toys",
    image: "https://i.postimg.cc/2j1pTWv5/BREATHING-TEDDY-350-RS.jpg",
    images: ["https://i.postimg.cc/2j1pTWv5/BREATHING-TEDDY-350-RS.jpg"],
    description: "Beyond just a toy—a lifelike companion. Our breathing teddy bear provides a sense of calm and sensory comfort through rhythmic motion.",
    tags: ["Relaxation", "Soft Toy", "Interactive"],
    featured: true,
    createdAt: new Date()
  },
  {
    id: "p4",
    title: "Celestial Unicorn Lamp",
    category: "Light & Lamp Gifts",
    subcategory: "Fantasy Collection",
    image: "https://i.postimg.cc/QtnbHHxf/unicorn.png",
    images: ["https://i.postimg.cc/QtnbHHxf/unicorn.png"],
    description: "A magical glow for magical moments. High-quality acrylic finish with color-changing LEDs to transform any space into a dreamland.",
    tags: ["Unicorn", "Magic", "Kids Room"],
    featured: false,
    createdAt: new Date()
  },
  {
    id: "p5",
    title: "Customized Memories Mug",
    category: "Customized Gifts",
    subcategory: "Mugs",
    image: "https://i.postimg.cc/VLtxPcDT/Mug-print-199-rs.png",
    images: ["https://i.postimg.cc/VLtxPcDT/Mug-print-199-rs.png"],
    description: "Premium high-gloss ceramic mugs printed with archival-grade inks. Guaranteed to keep your memories fresh with every sip.",
    tags: ["Coffee", "Ceramic", "Personalized"],
    featured: false,
    createdAt: new Date()
  },
  {
    id: "p6",
    title: "Rabbit Dashboard Duo",
    category: "Car Dashboard & Idols",
    subcategory: "Auto Decor",
    image: "https://i.postimg.cc/JndqGG4P/Rabbit-car-dashboard-170-rs.jpg",
    images: ["https://i.postimg.cc/JndqGG4P/Rabbit-car-dashboard-170-rs.jpg"],
    description: "Whimsical rabbit figurines with spring-mounted stability, specifically designed for car dashboards. High-durability finish.",
    tags: ["Car", "Figurine", "Accessories"],
    featured: false,
    createdAt: new Date()
  },
  {
    id: "p7",
    title: "Miniature Keepsake Pillow",
    category: "Customized Gifts",
    subcategory: "Pillows",
    image: "https://i.postimg.cc/L6PcFMNB/Mini-pillow-150rs.png",
    images: ["https://i.postimg.cc/L6PcFMNB/Mini-pillow-150rs.png"],
    description: "Compact memories. These mini photo pillows are perfect for car rear windows or office desks. Soft-touch fabric guaranteed.",
    tags: ["Small Gifts", "Photo Print", "Textiles"],
    featured: false,
    createdAt: new Date()
  },
  {
    id: "portfolio-panda-bamboo",
    title: "Charming Panda with Bamboo Heart",
    category: "Cute Gift Items",
    subcategory: "Plush Art",
    image: "https://i.postimg.cc/q7gPdZXY/Charming-panda-with-bamboo-heart.png",
    images: ["https://i.postimg.cc/q7gPdZXY/Charming-panda-with-bamboo-heart.png"],
    description: "A testament to soft craftsmanship. This panda isn't just a toy; it's a messenger of love, holding a heart inspired by its natural bamboo habitat.",
    tags: ["Handmade Feel", "Love", "Gift for Her"],
    featured: true,
    createdAt: new Date()
  },
  {
    id: "portfolio-kuromi-lamp",
    title: "Midnight Kuromi Glow Lamp",
    category: "Light & Lamp Gifts",
    subcategory: "Premium Mood Lighting",
    image: "https://i.postimg.cc/9XTjMK5r/Purple-Kuromi-shaped-ligh.png",
    images: ["https://i.postimg.cc/9XTjMK5r/Purple-Kuromi-shaped-ligh.png"],
    description: "Blending character art with atmospheric lighting. This Kuromi lamp casts a deep, enchanting purple glow that redefines bedside aesthetics.",
    tags: ["Aesthetic", "Purple Glow", "Character Art"],
    featured: true,
    createdAt: new Date()
  },
  {
    id: "portfolio-caticorn-lamp",
    title: "Magical Caticorn Magic Lamp",
    category: "Light & Lamp Gifts",
    subcategory: "Imagination Collection",
    image: "https://i.postimg.cc/mgmvJGMQ/Unicorn-cat-shaped-light.png",
    images: ["https://i.postimg.cc/mgmvJGMQ/Unicorn-cat-shaped-light.png"],
    description: "A whimsical fusion of a feline and a unicorn. This lamp uses high-fidelity LED diffusion to create a soft, eye-friendly magical glow.",
    tags: ["Fantasy", "Safe LED", "Whimsical"],
    featured: true,
    createdAt: new Date()
  },
  {
    id: "portfolio-sleeping-panda",
    title: "Dreamy Sleeping Panda Lamp",
    category: "Light & Lamp Gifts",
    subcategory: "Sleep Aids",
    image: "https://i.postimg.cc/FHFtTKf4/Sleeping-panda-shaped-light.png",
    images: ["https://i.postimg.cc/FHFtTKf4/Sleeping-panda-shaped-light.png"],
    description: "Designed for tranquility. The soft-touch silicone and dimmable warm light help create a perfect environment for deep sleep.",
    tags: ["Sleep", "Calm", "Soft Touch"],
    featured: false,
    createdAt: new Date()
  },
  {
    id: "portfolio-waving-panda",
    title: "Happy Waving Panda Figurine",
    category: "Cute Gift Items",
    subcategory: "Desk Companions",
    image: "https://i.postimg.cc/FK1MQnVm/Waving-panda-shaped-light.jpg",
    images: ["https://i.postimg.cc/FK1MQnVm/Waving-panda-shaped-light.jpg"],
    description: "A small reminder of happiness. This high-detail figurine is designed to bring a smile to your workspace with its cheerful waving gesture.",
    tags: ["Happiness", "Office Decor", "Friendship"],
    featured: true,
    createdAt: new Date()
  },
  {
    id: "portfolio-lying-panda",
    title: "Lying Panda Relax Lamp",
    category: "Light & Lamp Gifts",
    subcategory: "Comfort Decor",
    image: "https://i.postimg.cc/d3cprQMz/Lying-panda-shaped-light.png",
    images: ["https://i.postimg.cc/d3cprQMz/Lying-panda-shaped-light.png"],
    description: "A low-profile lamp that emphasizes ergonomic design. Provides an upward-facing ambient glow that is perfect for mood setting.",
    tags: ["Interior Design", "Cozy", "Ambient"],
    featured: false,
    createdAt: new Date()
  }
];
