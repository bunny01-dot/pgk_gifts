
export const CONTACT_INFO = {
  businessName: "PGK GIFTS",
  studioName: "PGK STUDIO",
  tagline: "Your Moments, Our Masterpiece.",
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

export const ADMIN_EMAILS = [
  "kalab320@gmail.com",
  // Add other authorized admin emails here
];

export type Category = 
  | "Night Lamps" 
  | "Wall Decor Photo Frames" 
  | "Personalized Gifts" 
  | "Mdf Frames" 
  | "Unique Gifts" 
  | "Car Dashboard Accessories" 
  | "Hamper Boxes";

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: Category;
  description: string;
  active: boolean;
  featured?: boolean;
  stockCount?: number;
  tags?: string[];
}

export const PRODUCTS: Product[] = [
  {
    id: "breathing-teddy",
    name: "Breathing Teddy",
    price: 350,
    image: "https://i.postimg.cc/2j1pTWv5/BREATHING-TEDDY-350-RS.jpg",
    category: "Car Dashboard Accessories",
    description: "A realistic breathing teddy bear. Soothing for all ages.",
    active: true,
    featured: true
  },
  {
    id: "rabbit-dashboard",
    name: "Rabbit Dashboard Toy",
    price: 99,
    image: "https://i.postimg.cc/JndqGG4P/Rabbit-car-dashboard-170-rs.jpg",
    category: "Car Dashboard Accessories",
    description: "Spring-mounted rabbit toy for your car dashboard.",
    active: true,
    featured: false
  },
  {
    id: "custom-mug",
    name: "Custom Mug Print",
    price: 99,
    image: "https://i.postimg.cc/VLtxPcDT/Mug-print-199-rs.png",
    category: "Personalized Gifts",
    description: "Your photo on a premium ceramic mug.",
    active: true,
    featured: true
  },
  {
    id: "mini-pillow",
    name: "Mini Photo Pillow",
    price: 99,
    image: "https://i.postimg.cc/L6PcFMNB/Mini-pillow-150rs.png",
    category: "Personalized Gifts",
    description: "Small customized photo pillow.",
    active: true,
    featured: true
  },
  {
    id: "heart-sponge",
    name: "Heart Sponge Frame",
    price: 99,
    image: "https://i.postimg.cc/hvk116mR/heart-sponge.png",
    category: "Night Lamps",
    description: "Soft heart-shaped sponge frame.",
    active: true,
    featured: false
  },
  {
    id: "charming-panda-heart",
    name: "Charming Panda with Bamboo Heart",
    price: 99,
    image: "https://i.postimg.cc/q7gPdZXY/Charming-panda-with-bamboo-heart.png",
    category: "Night Lamps",
    description: "An adorable panda plush holding a bamboo-inspired heart.",
    active: true,
    featured: true
  },
  {
    id: "chibi-panda-green",
    name: "Cheerful Chibi Panda",
    price: 99,
    image: "https://i.postimg.cc/k5D0dhvq/Cheerful-chibi-panda-with-green-hat.png",
    category: "Night Lamps",
    description: "Sweet chibi-style panda with a signature green hat.",
    active: true,
    featured: false
  },
  {
    id: "pastel-bunny-lollipop",
    name: "Pastel Bunny with Lollipop",
    price: 99,
    image: "https://i.postimg.cc/hGwH4b2f/Cute-pastel-bunny-with-lollipop.png",
    category: "Night Lamps",
    description: "Soft pastel-toned bunny featuring a whimsical lollipop accessory.",
    active: true,
    featured: true
  },
  {
    id: "deluxe-panda-lamp",
    name: "Deluxe Panda Night Lamp",
    price: 99,
    image: "https://i.postimg.cc/pTF3mhS6/Large-headed-panda-shaped-light.png",
    category: "Night Lamps",
    description: "A wide-angle panda lamp providing a soft, comforting ambient glow.",
    active: true,
    featured: true
  },

  {
    id: "sweetheart-panda",
    name: "Sweetheart Panda Figurine",
    price: 99,
    image: "https://i.postimg.cc/zvY6KDZm/Panda-holding-red-heart.png",
    category: "Night Lamps",
    description: "A classic panda figurine holding a deep red heart.",
    active: true,
    featured: false
  },
  {
    id: "raincoat-panda",
    name: "Raincoat Panda Plush",
    price: 99,
    image: "https://i.postimg.cc/5yWTL9d8/Panda-in-yellow-raincoat.jpg",
    category: "Night Lamps",
    description: "Brave the rain with this adorable panda in a vibrant yellow raincoat.",
    active: true,
    featured: false
  },
  {
    id: "peach-bunny-lamp",
    name: "Peach Bunny Glow Lamp",
    price: 99,
    image: "https://i.postimg.cc/Rh18Rr4f/Peach-bunny-shaped-light.png",
    category: "Night Lamps",
    description: "Soft peach-toned bunny lamp with energy-efficient LED glow technology.",
    active: true,
    featured: true
  },
  {
    id: "midnight-kuromi-lamp",
    name: "Midnight Kuromi Glow Lamp",
    price: 99,
    image: "https://i.postimg.cc/9XTjMK5r/Purple-Kuromi-shaped-ligh.png",
    category: "Night Lamps",
    description: "Premium character-styled lamp in a deep purple midnight glow.",
    active: true,
    featured: true
  },
  {
    id: "shinchan-dog-costume",
    name: "Shin-chan Dog Costume Figurine",
    price: 99,
    image: "https://i.postimg.cc/65XxGctD/Shin-chan-in-dog-costume-figurine.png",
    category: "Night Lamps",
    description: "Playful Shin-chan figurine dressed in a fluffy dog costume.",
    active: true,
    featured: false
  },
  {
    id: "sitting-panda-lamp",
    name: "Sitting Panda Cozy Lamp",
    price: 99,
    image: "https://i.postimg.cc/W15BCPr5/Sitting-panda-shaped-light.png",
    category: "Night Lamps",
    description: "Warm glow panda lamp in a cozy sitting posture.",
    active: true,
    featured: false
  },
  {
    id: "sleeping-panda-lamp-v2",
    name: "Dreamy Sleeping Panda",
    price: 99,
    image: "https://i.postimg.cc/FHFtTKf4/Sleeping-panda-shaped-light.png",
    category: "Night Lamps",
    description: "Soft-touch sleeping panda lamp for a tranquil and peaceful night.",
    active: true,
    featured: false
  },
  {
    id: "standing-panda-lamp",
    name: "Standing Panda Table Lamp",
    price: 99,
    image: "https://i.postimg.cc/N0L3wPky/Standing-panda-shaped-light.png",
    category: "Night Lamps",
    description: "An elegant standing panda lamp that doubles as a piece of modern art.",
    active: true,
    featured: false
  },
  {
    id: "caticorn-magic-lamp",
    name: "Magical Caticorn Lamp",
    price: 99,
    image: "https://i.postimg.cc/mgmvJGMQ/Unicorn-cat-shaped-light.png",
    category: "Night Lamps",
    description: "The dream combination: A cat and a unicorn in one glowing magical light.",
    active: true,
    featured: true
  },
  {
    id: "panda-scarf-lamp",
    name: "Panda Night Lamp (Scarf Edition)",
    price: 499,
    image: "https://i.postimg.cc/kG6y8qBj/500-rs-6-colour-lights-panda-light-lamp.png",
    category: "Night Lamps",
    description: "Premium edition panda night lamp featuring a cozy scarf and multi-color LED light.",
    active: true,
    featured: true
  },
  {
    id: "img-20260413-142620",
    name: "Grand Edition Night Light",
    price: 499,
    image: "https://i.postimg.cc/9QF9Csgm/IMG-20260413-142620.jpg",
    category: "Night Lamps",
    description: "Our largest and most detailed night light for ultimate ambiance.",
    active: true,
    featured: true
  },
  {
    "id": "4d-cutting-frame-12-10-inches-1300-rs",
    "name": "4d Cutting Frame 12 10 Inches",
    "price": 1300,
    "image": "https://i.postimg.cc/6Qm3b3nK/4D-CUTTING-FRAME-12-10-INCHES-1300-RS.jpg",
    "category": "Wall Decor Photo Frames",
    "description": "Premium 4d Cutting Frame 12 10 Inches. Crafted with precision and high-quality materials.",
    "active": true
  },
  {
    "id": "acrylic-photo-frame-12-8-999rs",
    "name": "Acrylic Photo Frame 12 8",
    "price": 999,
    "image": "https://i.postimg.cc/PqRxVxYq/acrylic-photo-frame-12-8-999RS.jpg",
    "category": "Wall Decor Photo Frames",
    "description": "Premium Acrylic Photo Frame 12 8. Crafted with precision and high-quality materials.",
    "active": true
  },
  {
    "id": "acrylic-transparent-photo-frame-12-8-999rs",
    "name": "Acrylic Transparent Photo Frame 12 8",
    "price": 999,
    "image": "https://i.postimg.cc/LsbXQXL8/acrylic-transparent-photo-frame-12-8-999RS.jpg",
    "category": "Wall Decor Photo Frames",
    "description": "Premium Acrylic Transparent Photo Frame 12 8. Crafted with precision and high-quality materials.",
    "active": true
  },
  {
    "id": "anniversary-photo-frame-12-18-inch-600-rs",
    "name": "Anniversary Photo Frame 12 18 Inch",
    "price": 600,
    "image": "https://i.postimg.cc/6Qm3b3n8/Anniversary-photo-frame-12-18-INCH-600-RS.jpg",
    "category": "Wall Decor Photo Frames",
    "description": "Premium Anniversary Photo Frame 12 18 Inch. Crafted with precision and high-quality materials.",
    "active": true
  },
  {
    "id": "baby-birthday-frame-15-10-450-rs",
    "name": "Baby Birthday Frame 15 10",
    "price": 450,
    "image": "https://i.postimg.cc/W4H3Y3gZ/baby-birthday-frame-15-10-450-RS.jpg",
    "category": "Wall Decor Photo Frames",
    "description": "Premium Baby Birthday Frame 15 10. Crafted with precision and high-quality materials.",
    "active": true
  },
  {
    "id": "badge-frame-999rs-8-8-inch",
    "name": "Badge Frame 8 8",
    "price": 999,
    "image": "https://i.postimg.cc/yd3NMHyk/badge-frame-999RS-8-8-INCH.jpg",
    "category": "Wall Decor Photo Frames",
    "description": "Premium Badge Frame 8 8. Crafted with precision and high-quality materials.",
    "active": true
  },
  {
    "id": "bird-collage-frame-12-18-6oo-rs",
    "name": "Bird Collage Frame 12 18",
    "price": 600,
    "image": "https://i.postimg.cc/Tw5Pz6JQ/bird-collage-frame-12-18-6OO-RS.jpg",
    "category": "Wall Decor Photo Frames",
    "description": "Premium Bird Collage Frame 12 18. Crafted with precision and high-quality materials.",
    "active": true
  },
  {
    "id": "black-and-white-mosaic-frame-12-18-600-rs",
    "name": "Black And White Mosaic Frame 12 18",
    "price": 600,
    "image": "https://i.postimg.cc/cCqJZbFB/black-and-white-mosaic-frame-12-18-600-RS.jpg",
    "category": "Wall Decor Photo Frames",
    "description": "Premium Black And White Mosaic Frameframe 12 18. Crafted with precision and high-quality materials.",
    "active": true
  },
  {
    "id": "book-rotating-frame-600rs",
    "name": "Book Rotating Frame",
    "price": 600,
    "image": "https://i.postimg.cc/yxqNBbLG/book-rotating-frame-600RS.jpg",
    "category": "Wall Decor Photo Frames",
    "description": "Premium Book Rotating Frame. Crafted with precision and high-quality materials.",
    "active": true
  },
  {
    "id": "calender-frame-12-8-250-rs",
    "name": "Calender Frame 12 8",
    "price": 250,
    "image": "https://i.postimg.cc/C5yKYQv0/calender-frame-12-8-250-RS.jpg",
    "category": "Wall Decor Photo Frames",
    "description": "Premium Calender Frame 12 8. Crafted with precision and high-quality materials.",
    "active": true
  },
  {
    "id": "collage-frame-12-8-350rs",
    "name": "Collage Frame 12 8",
    "price": 350,
    "image": "https://i.postimg.cc/nr8LZPdn/collage-frame-12-8-350RS.jpg",
    "category": "Wall Decor Photo Frames",
    "description": "Premium Collage Frame 12 8. Crafted with precision and high-quality materials.",
    "active": true
  },
  {
    "id": "date-of-birth-frame-9-6-350-rs",
    "name": "Date Of Birth Frame 9 6",
    "price": 350,
    "image": "https://i.postimg.cc/zvnGfFMJ/date-of-birth-frame-9-6-350-RS.jpg",
    "category": "Wall Decor Photo Frames",
    "description": "Premium Date Of Birth Frame 9 6. Crafted with precision and high-quality materials.",
    "active": true
  },
  {
    "id": "digital-painting-frame-15-12-500rs",
    "name": "Digital Painting Frame 15 12",
    "price": 500,
    "image": "https://i.postimg.cc/6qdpQfSq/digital-painting-frame-15-12-500RS.jpg",
    "category": "Wall Decor Photo Frames",
    "description": "Premium Digital Painting Frame 15 12. Crafted with precision and high-quality materials.",
    "active": true
  },
  {
    "id": "double-exposure-12-10-500rs",
    "name": "Double Exposure 12 10",
    "price": 500,
    "image": "https://i.postimg.cc/6qdpQfS4/double-exposure-12-10-500RS.jpg",
    "category": "Wall Decor Photo Frames",
    "description": "Premium Double Exposure 12 10. Crafted with precision and high-quality materials.",
    "active": true
  },
  {
    "id": "eye-connect-frame-4-4in-99rs",
    "name": "Eye Connect Frame 4 4in",
    "price": 99,
    "image": "https://i.postimg.cc/MHypGm41/eye-connect-frame-4-4IN-99RS.jpg",
    "category": "Wall Decor Photo Frames",
    "description": "Premium Eye Connect Frame 4 4in. Crafted with precision and high-quality materials.",
    "active": true
  },

  {
    "id": "farewell-frame-12-18-700-rs",
    "name": "Farewell Frame 12 18",
    "price": 700,
    "image": "https://i.postimg.cc/dQd1nJ0W/farewell-frame-12-18-700-RS.jpg",
    "category": "Wall Decor Photo Frames",
    "description": "Premium Farewell Frame 12 18. Crafted with precision and high-quality materials.",
    "active": true
  },
  {
    "id": "flim-strip-9-6-350",
    "name": "Flim Strip 9 6",
    "price": 350,
    "image": "https://i.postimg.cc/T2mwQTP7/flim-strip-9-6-350.jpg",
    "category": "Wall Decor Photo Frames",
    "description": "Premium Flim Strip 9 6. Crafted with precision and high-quality materials.",
    "active": true
  },
  {
    "id": "folding-frame8-6-600",
    "name": "Folding Frame8 6",
    "price": 600,
    "image": "https://i.postimg.cc/T2mwQTP4/folding-frame8-6-600.jpg",
    "category": "Wall Decor Photo Frames",
    "description": "Premium Folding Frame8 6. Crafted with precision and high-quality materials.",
    "active": true
  },
  {
    "id": "google-map-frame15-10-450rs",
    "name": "Google Map Frame15 10",
    "price": 450,
    "image": "https://i.postimg.cc/SQ8sVmKP/google-map-frame15-10-450RS.jpg",
    "category": "Wall Decor Photo Frames",
    "description": "Premium Google Map Frame15 10. Crafted with precision and high-quality materials.",
    "active": true
  },
  {
    "id": "google-search-frame12-8-350rs",
    "name": "Google Search Frame12 8",
    "price": 350,
    "image": "https://i.postimg.cc/13M46Mzt/google-search-frame12-8-350RS.jpg",
    "category": "Wall Decor Photo Frames",
    "description": "Premium Google Search Frame12 8. Crafted with precision and high-quality materials.",
    "active": true
  },
  {
    "id": "heart-collage-frame8-6-250",
    "name": "Heart Collage Frame8 6",
    "price": 250,
    "image": "https://i.postimg.cc/pdTrB89Q/heart-collage-frame8-6-250.jpg",
    "category": "Wall Decor Photo Frames",
    "description": "Premium Heart Collage Frame8 6. Crafted with precision and high-quality materials.",
    "active": true
  },
  {
    "id": "illusion-frame12-8-1300rs",
    "name": "Illusion Frame12 8",
    "price": 1300,
    "image": "https://i.postimg.cc/VN6vFMSj/illusion-frame12-8-1300RS.jpg",
    "category": "Wall Decor Photo Frames",
    "description": "Premium Illusion Frame12 8. Crafted with precision and high-quality materials.",
    "active": true
  },
  {
    "id": "insta-collage-frame-12-18-600",
    "name": "Insta Collage Frame 12 18",
    "price": 600,
    "image": "https://i.postimg.cc/6Q3qhR7h/insta-collage-frame-12-18-600.jpg",
    "category": "Wall Decor Photo Frames",
    "description": "Premium Insta Collage Frame 12 18. Crafted with precision and high-quality materials.",
    "active": true
  },
  {
    "id": "magic-led-frame1300rs-12-8",
    "name": "Magic Led Frame 12 8",
    "price": 1300,
    "image": "https://i.postimg.cc/s2XxJSBY/magic-led-frame1300RS-12-8.jpg",
    "category": "Wall Decor Photo Frames",
    "description": "Premium Magic Led Frame 12 8. Crafted with precision and high-quality materials.",
    "active": true
  },
  {
    "id": "moon-collage-frame12-8-350rs",
    "name": "Moon Collage Frame12 8",
    "price": 350,
    "image": "https://i.postimg.cc/VN6vFMSG/moon-collage-frame12-8-350RS.jpg",
    "category": "Wall Decor Photo Frames",
    "description": "Premium Moon Collage Frame12 8. Crafted with precision and high-quality materials.",
    "active": true
  },
  {
    "id": "mosaic-frame12-10-400rs",
    "name": "Mosaic Frame12 10",
    "price": 400,
    "image": "https://i.postimg.cc/0NQjCm6L/mosaic-frame12-10-400RS.jpg",
    "category": "Wall Decor Photo Frames",
    "description": "Premium Mosaic Frame12 10. Crafted with precision and high-quality materials.",
    "active": true
  },
  {
    "id": "pencil-art-frame12-8-1299rs",
    "name": "Pencil Art Frame12 8",
    "price": 1299,
    "image": "https://i.postimg.cc/43dy1tKD/pencil-art-frame12-8-1299RS.jpg",
    "category": "Wall Decor Photo Frames",
    "description": "Premium Pencil Art Frame12 8. Crafted with precision and high-quality materials.",
    "active": true
  },
  {
    "id": "resin-art8-8-2500-rs",
    "name": "Resin Art 8 8",
    "price": 2500,
    "image": "https://i.postimg.cc/SKsRG820/resin-art8-8-2500-RS.jpg",
    "category": "Wall Decor Photo Frames",
    "description": "Premium Resin Art 8 8. Crafted with precision and high-quality materials.",
    "active": true
  },
  {
    "id": "splashing-effect-frame8-6-250rs",
    "name": "Splashing Effect Frame 8x6",
    "price": 250,
    "image": "https://i.postimg.cc/5t0ymvYW/splashing-effect-frame8-6-250RS.jpg",
    "category": "Wall Decor Photo Frames",
    "description": "Premium Spalshing Effect Frame8 6. Crafted with precision and high-quality materials.",
    "active": true
  },
  {
    "id": "spotify-frame10-8-300-rs",
    "name": "Spotify Frame10 8",
    "price": 300,
    "image": "https://i.postimg.cc/DzMZpZsD/spotify-frame10-8-300-RS.jpg",
    "category": "Wall Decor Photo Frames",
    "description": "Premium Spotify Frame10 8. Crafted with precision and high-quality materials.",
    "active": true
  },
  {
    "id": "vintage-frame12-18-600-rs",
    "name": "Vintage Frame 12 18",
    "price": 600,
    "image": "https://i.postimg.cc/pd6TcT83/vintage-frame12-18-600-RS.jpg",
    "category": "Wall Decor Photo Frames",
    "description": "Premium Vintage Frame 12 18. Crafted with precision and high-quality materials.",
    "active": true
  },
  {
    "id": "wedding-thumb-print-frame-12-18-600",
    "name": "Wedding Thumb Print Frame 12x18",
    "price": 600,
    "image": "https://i.postimg.cc/g0TJtJ8W/wedding-thumb-print-frame-12-18-600.jpg",
    "category": "Wall Decor Photo Frames",
    "description": "Premium Wedding Thumb Print Frame. Crafted with precision and high-quality materials.",
    "active": true
  }
];
