
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
  footerLogo: "https://i.postimg.cc/qBNfQKKb/logo.png",
  qrCode: "https://i.postimg.cc/L5YVf2n0/Google-Pay-QR.png"
};

export type Category = "Light Lamps" | "Cute Toys" | "Customized Gifts";

export interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  category: Category;
  featured?: boolean;
}

export const PRODUCTS: Product[] = [
  // Featured / Home Grid
  {
    id: "panda-lamp-1",
    name: "Panda Light Lamp",
    price: "₹500",
    image: "https://i.postimg.cc/kG6y8qBj/500-rs-6-colour-lights-panda-light-lamp.png",
    category: "Light Lamps",
    featured: true
  },
  {
    id: "sleeping-panda-lamp",
    name: "Sleeping Panda Lamp",
    price: "₹99",
    image: "https://i.postimg.cc/Hnq99Ryq/Light-lamp-sleeping-panda-99-rs.png",
    category: "Light Lamps",
    featured: true
  },
  {
    id: "custom-mug",
    name: "Custom Mug Print",
    price: "₹199",
    image: "https://i.postimg.cc/VLtxPcDT/Mug-print-199-rs.png",
    category: "Customized Gifts",
    featured: true
  },
  {
    id: "breathing-teddy",
    name: "Breathing Teddy",
    price: "₹350",
    image: "https://i.postimg.cc/2j1pTWv5/BREATHING-TEDDY-350-RS.jpg",
    category: "Cute Toys",
    featured: true
  },
  {
    id: "rabbit-dashboard",
    name: "Rabbit Dashboard Toy",
    price: "₹170",
    image: "https://i.postimg.cc/JndqGG4P/Rabbit-car-dashboard-170-rs.jpg",
    category: "Cute Toys",
    featured: true
  },
  {
    id: "mini-pillow",
    name: "Mini Pillow",
    price: "₹150",
    image: "https://i.postimg.cc/L6PcFMNB/Mini-pillow-150rs.png",
    category: "Customized Gifts",
    featured: true
  },

  // More Light Lamps
  { id: "panda-lamp-3", name: "Classic Panda Lamp", price: "₹499", image: "https://i.postimg.cc/hjGsD9g4/panda.jpg", category: "Light Lamps" },
  { id: "panda-lamp-4", name: "Panda 2.0 Lamp", price: "₹499", image: "https://i.postimg.cc/CMX32KH5/panda-2.png", category: "Light Lamps" },
  { id: "panda-heart", name: "Panda with Heart", price: "₹550", image: "https://i.postimg.cc/tTgkqhyQ/panda-with-heart.png", category: "Light Lamps" },
  { id: "panda-hat", name: "Panda with Hat", price: "₹550", image: "https://i.postimg.cc/SsKdSWqN/panda-with-yellow-hat.jpg", category: "Light Lamps" },
  { id: "sleeping-panda-2", name: "Dreamy Panda", price: "₹499", image: "https://i.postimg.cc/sX0cvvDG/sleeping-panda.png", category: "Light Lamps" },
  { id: "rabbit-lamp", name: "Bright Rabbit Lamp", price: "₹450", image: "https://i.postimg.cc/sX0cvvD5/rabbit.png", category: "Light Lamps" },
  { id: "rabbit-sleep-lamp", name: "Sleeping Rabbit Lamp", price: "₹450", image: "https://i.postimg.cc/ydNj1FBD/rabbit-sleeping.png", category: "Light Lamps" },
  { id: "unicorn-lamp", name: "Magical Unicorn Lamp", price: "₹599", image: "https://i.postimg.cc/QtnbHHxf/unicorn.png", category: "Light Lamps" },

  // More Cute Toys
  { id: "dog-bowtie", name: "Dog with Bowtie", price: "₹299", image: "https://i.postimg.cc/NF9xTB5V/dog-with-bowtie.jpg", category: "Cute Toys" },
  { id: "rabbit-panda-plush", name: "Rabbit Panda Plush", price: "₹399", image: "https://i.postimg.cc/zBPjVVXh/rabiit-panda.jpg", category: "Cute Toys" },

  // More Customized Gifts
  { id: "heart-sponge", name: "Heart Sponge Frame", price: "₹250", image: "https://i.postimg.cc/hvk116mR/heart-sponge.png", category: "Customized Gifts" },
];
