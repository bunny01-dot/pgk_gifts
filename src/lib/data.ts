
export const CONTACT_INFO = {
  businessName: "PGK GIFTS",
  studioName: "PGK STUDIO",
  tagline: "Turning Your Memories into Beautiful Personalized Gifts",
  address: "PGK Studio, Indira Nagar Church Road, Blessing Complex, Kallal – 630305, Near Britto School, Sivagangai District (Karaikudi Hub), Tamil Nadu",
  phone: "6383775476",
  alternateNumbers: ["8903200487", "7305181483"],
  email: "kalab320@gmail.com",
  hours: "Monday – Friday: 9:00 AM – 4:00 PM",
  instagram: "https://www.instagram.com/pgk_frames_kallal",
  whatsapp: "https://wa.me/message/VXHAM4LMXFOSB1",
  youtube: "https://youtube.com/@pgk_frames_kallal",
  googleMap: "https://maps.app.goo.gl/8gF9FSyhokzJeakW6",
  upiId: "kalab320-2@okhdfcbank",
  headerLogo: "https://i.postimg.cc/FzMVV8SY/logo-1.png",
  footerLogo: "https://i.postimg.cc/FzMVV8SY/logo-1.png",
  qrCode: "https://i.postimg.cc/L5YVf2n0/Google-Pay-QR.png"
};

export type Category = "Light Lamps" | "Cute Toys" | "Customized Gifts";

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: Category;
  description: string;
  featured?: boolean;
}

export const PRODUCTS: Product[] = [
  {
    id: "panda-lamp-1",
    name: "Panda Light Lamp",
    price: 500,
    image: "https://i.postimg.cc/kG6y8qBj/500-rs-6-colour-lights-panda-light-lamp.png",
    category: "Light Lamps",
    description: "Cute 6-colour LED panda lamp. Perfect for a bedside table. Includes multiple modes and soft silicone material.",
    featured: true
  },
  {
    id: "sleeping-panda-lamp",
    name: "Sleeping Panda Lamp",
    price: 99,
    image: "https://i.postimg.cc/Hnq99Ryq/Light-lamp-sleeping-panda-99-rs.png",
    category: "Light Lamps",
    description: "A tiny adorable sleeping panda lamp, affordable and cute.",
    featured: true
  },
  {
    id: "unicorn-lamp",
    name: "Magical Unicorn Lamp",
    price: 600,
    image: "https://i.postimg.cc/QtnbHHxf/unicorn.png",
    category: "Light Lamps",
    description: "Multi-color changing unicorn lamp for a magical room.",
    featured: true
  },
  {
    id: "breathing-teddy",
    name: "Breathing Teddy",
    price: 350,
    image: "https://i.postimg.cc/2j1pTWv5/BREATHING-TEDDY-350-RS.jpg",
    category: "Cute Toys",
    description: "A realistic breathing teddy bear. Soothing for all ages.",
    featured: true
  },
  {
    id: "rabbit-dashboard",
    name: "Rabbit Dashboard Toy",
    price: 170,
    image: "https://i.postimg.cc/JndqGG4P/Rabbit-car-dashboard-170-rs.jpg",
    category: "Cute Toys",
    description: "Spring-mounted rabbit toy for your car dashboard.",
    featured: false
  },
  {
    id: "custom-mug",
    name: "Custom Mug Print",
    price: 199,
    image: "https://i.postimg.cc/VLtxPcDT/Mug-print-199-rs.png",
    category: "Customized Gifts",
    description: "Your photo on a premium ceramic mug.",
    featured: true
  },
  {
    id: "mini-pillow",
    name: "Mini Photo Pillow",
    price: 150,
    image: "https://i.postimg.cc/L6PcFMNB/Mini-pillow-150rs.png",
    category: "Customized Gifts",
    description: "Small customized photo pillow for your car or couch.",
    featured: true
  },
  {
    id: "heart-sponge",
    name: "Heart Sponge Frame",
    price: 250,
    image: "https://i.postimg.cc/hvk116mR/heart-sponge.png",
    category: "Customized Gifts",
    description: "Soft heart-shaped sponge frame for anniversary gifts.",
    featured: false
  }
];
