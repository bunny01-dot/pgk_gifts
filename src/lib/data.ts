
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
  | "Cute Toys"
  | "Customized Gifts"
  | "Wall Decor and Photo Frames" 
  | "Personalized Gifts" 
  | "MDF Wall Frames" 
  | "Unique Gifts" 
  | "Car Dashboard Accessories" 
  | "Hamper Boxes"
  | "Keychains"
  | (string & {});

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
  dimensions?: string;
  requiredPhotoSlots?: number | null | undefined;
  needsMainImage?: boolean | undefined;
  sizes?: { name: string; price: number }[] | undefined;
  deliveryCharge?: 'complimentary' | 'regular' | undefined;
  weight?: number | null | undefined;
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
    "category": "Wall Decor and Photo Frames",
    "description": "Premium 4d Cutting Frame 12 10 Inches. Crafted with precision and high-quality materials.",
    "active": true
  },
{
    "id": "acrylic-photo-frame-12-8-999rs",
    "name": "Acrylic Photo Frame 12 8",
    "price": 999,
    "image": "https://i.postimg.cc/PqRxVxYq/acrylic-photo-frame-12-8-999RS.jpg",
    "category": "Wall Decor and Photo Frames",
    "description": "Premium Acrylic Photo Frame 12 8. Crafted with precision and high-quality materials.",
    "active": true
  },
{
    "id": "acrylic-transparent-photo-frame-12-8-999rs",
    "name": "Acrylic Transparent Photo Frame 12 8",
    "price": 999,
    "image": "https://i.postimg.cc/LsbXQXL8/acrylic-transparent-photo-frame-12-8-999RS.jpg",
    "category": "Wall Decor and Photo Frames",
    "description": "Premium Acrylic Transparent Photo Frame 12 8. Crafted with precision and high-quality materials.",
    "active": true
  },
{
    "id": "anniversary-photo-frame-12-18-inch-600-rs",
    "name": "Anniversary Photo Frame 12 18 Inch",
    "price": 600,
    "image": "https://i.postimg.cc/6Qm3b3n8/Anniversary-photo-frame-12-18-INCH-600-RS.jpg",
    "category": "Wall Decor and Photo Frames",
    "description": "Premium Anniversary Photo Frame 12 18 Inch. Crafted with precision and high-quality materials.",
    "active": true
  },
{
    "id": "baby-birthday-frame-15-10-450-rs",
    "name": "Baby Birthday Frame 15 10",
    "price": 450,
    "image": "https://i.postimg.cc/W4H3Y3gZ/baby-birthday-frame-15-10-450-RS.jpg",
    "category": "Wall Decor and Photo Frames",
    "description": "Premium Baby Birthday Frame 15 10. Crafted with precision and high-quality materials.",
    "active": true
  },
{
    "id": "badge-frame-999rs-8-8-inch",
    "name": "Badge Frame 8 8",
    "price": 999,
    "image": "https://i.postimg.cc/yd3NMHyk/badge-frame-999RS-8-8-INCH.jpg",
    "category": "Wall Decor and Photo Frames",
    "description": "Premium Badge Frame 8 8. Crafted with precision and high-quality materials.",
    "active": true
  },
{
    "id": "bird-collage-frame-12-18-6oo-rs",
    "name": "Bird Collage Frame 12 18",
    "price": 600,
    "image": "https://i.postimg.cc/Tw5Pz6JQ/bird-collage-frame-12-18-6OO-RS.jpg",
    "category": "Wall Decor and Photo Frames",
    "description": "Premium Bird Collage Frame 12 18. Crafted with precision and high-quality materials.",
    "active": true
  },
{
    "id": "black-and-white-mosaic-frame-12-18-600-rs",
    "name": "Black And White Mosaic Frame 12 18",
    "price": 600,
    "image": "https://i.postimg.cc/cCqJZbFB/black-and-white-mosaic-frame-12-18-600-RS.jpg",
    "category": "Wall Decor and Photo Frames",
    "description": "Premium Black And White Mosaic Frameframe 12 18. Crafted with precision and high-quality materials.",
    "active": true
  },
{
    "id": "book-rotating-frame-600rs",
    "name": "Book Rotating Frame",
    "price": 600,
    "image": "https://i.postimg.cc/yxqNBbLG/book-rotating-frame-600RS.jpg",
    "category": "Wall Decor and Photo Frames",
    "description": "Premium Book Rotating Frame. Crafted with precision and high-quality materials.",
    "active": true
  },
{
    "id": "calender-frame-12-8-250-rs",
    "name": "Calender Frame 12 8",
    "price": 250,
    "image": "https://i.postimg.cc/C5yKYQv0/calender-frame-12-8-250-RS.jpg",
    "category": "Wall Decor and Photo Frames",
    "description": "Premium Calender Frame 12 8. Crafted with precision and high-quality materials.",
    "active": true
  },
{
    "id": "collage-frame-12-8-350rs",
    "name": "Collage Frame 12 8",
    "price": 350,
    "image": "https://i.postimg.cc/nr8LZPdn/collage-frame-12-8-350RS.jpg",
    "category": "Wall Decor and Photo Frames",
    "description": "Premium Collage Frame 12 8. Crafted with precision and high-quality materials.",
    "active": true
  },
{
    "id": "date-of-birth-frame-9-6-350-rs",
    "name": "Date Of Birth Frame 9 6",
    "price": 350,
    "image": "https://i.postimg.cc/zvnGfFMJ/date-of-birth-frame-9-6-350-RS.jpg",
    "category": "Wall Decor and Photo Frames",
    "description": "Premium Date Of Birth Frame 9 6. Crafted with precision and high-quality materials.",
    "active": true
  },
{
    "id": "digital-painting-frame-15-12-500rs",
    "name": "Digital Painting Frame 15 12",
    "price": 500,
    "image": "https://i.postimg.cc/6qdpQfSq/digital-painting-frame-15-12-500RS.jpg",
    "category": "Wall Decor and Photo Frames",
    "description": "Premium Digital Painting Frame 15 12. Crafted with precision and high-quality materials.",
    "active": true
  },
{
    "id": "double-exposure-12-10-500rs",
    "name": "Double Exposure 12 10",
    "price": 500,
    "image": "https://i.postimg.cc/6qdpQfS4/double-exposure-12-10-500RS.jpg",
    "category": "Wall Decor and Photo Frames",
    "description": "Premium Double Exposure 12 10. Crafted with precision and high-quality materials.",
    "active": true
  },
{
    "id": "eye-connect-frame-4-4in-99rs",
    "name": "Eye Connect Frame 4 4in",
    "price": 99,
    "image": "https://i.postimg.cc/MHypGm41/eye-connect-frame-4-4IN-99RS.jpg",
    "category": "Wall Decor and Photo Frames",
    "description": "Premium Eye Connect Frame 4 4in. Crafted with precision and high-quality materials.",
    "active": true
  },
{
    "id": "farewell-frame-12-18-700-rs",
    "name": "Farewell Frame 12 18",
    "price": 700,
    "image": "https://i.postimg.cc/dQd1nJ0W/farewell-frame-12-18-700-RS.jpg",
    "category": "Wall Decor and Photo Frames",
    "description": "Premium Farewell Frame 12 18. Crafted with precision and high-quality materials.",
    "active": true
  },
{
    "id": "flim-strip-9-6-350",
    "name": "Flim Strip 9 6",
    "price": 350,
    "image": "https://i.postimg.cc/T2mwQTP7/flim-strip-9-6-350.jpg",
    "category": "Wall Decor and Photo Frames",
    "description": "Premium Flim Strip 9 6. Crafted with precision and high-quality materials.",
    "active": true
  },
{
    "id": "folding-frame8-6-600",
    "name": "Folding Frame8 6",
    "price": 600,
    "image": "https://i.postimg.cc/T2mwQTP4/folding-frame8-6-600.jpg",
    "category": "Wall Decor and Photo Frames",
    "description": "Premium Folding Frame8 6. Crafted with precision and high-quality materials.",
    "active": true
  },
{
    "id": "google-map-frame15-10-450rs",
    "name": "Google Map Frame15 10",
    "price": 450,
    "image": "https://i.postimg.cc/SQ8sVmKP/google-map-frame15-10-450RS.jpg",
    "category": "Wall Decor and Photo Frames",
    "description": "Premium Google Map Frame15 10. Crafted with precision and high-quality materials.",
    "active": true
  },
{
    "id": "google-search-frame12-8-350rs",
    "name": "Google Search Frame12 8",
    "price": 350,
    "image": "https://i.postimg.cc/13M46Mzt/google-search-frame12-8-350RS.jpg",
    "category": "Wall Decor and Photo Frames",
    "description": "Premium Google Search Frame12 8. Crafted with precision and high-quality materials.",
    "active": true
  },
{
    "id": "heart-collage-frame8-6-250",
    "name": "Heart Collage Frame8 6",
    "price": 250,
    "image": "https://i.postimg.cc/pdTrB89Q/heart-collage-frame8-6-250.jpg",
    "category": "Wall Decor and Photo Frames",
    "description": "Premium Heart Collage Frame8 6. Crafted with precision and high-quality materials.",
    "active": true
  },
{
    "id": "illusion-frame12-8-1300rs",
    "name": "Illusion Frame12 8",
    "price": 1300,
    "image": "https://i.postimg.cc/VN6vFMSj/illusion-frame12-8-1300RS.jpg",
    "category": "Wall Decor and Photo Frames",
    "description": "Premium Illusion Frame12 8. Crafted with precision and high-quality materials.",
    "active": true
  },
{
    "id": "insta-collage-frame-12-18-600",
    "name": "Insta Collage Frame 12 18",
    "price": 600,
    "image": "https://i.postimg.cc/6Q3qhR7h/insta-collage-frame-12-18-600.jpg",
    "category": "Wall Decor and Photo Frames",
    "description": "Premium Insta Collage Frame 12 18. Crafted with precision and high-quality materials.",
    "active": true
  },
{
    "id": "magic-led-frame1300rs-12-8",
    "name": "Magic Led Frame 12 8",
    "price": 1300,
    "image": "https://i.postimg.cc/s2XxJSBY/magic-led-frame1300RS-12-8.jpg",
    "category": "Wall Decor and Photo Frames",
    "description": "Premium Magic Led Frame 12 8. Crafted with precision and high-quality materials.",
    "active": true
  },
{
    "id": "moon-collage-frame12-8-350rs",
    "name": "Moon Collage Frame12 8",
    "price": 350,
    "image": "https://i.postimg.cc/VN6vFMSG/moon-collage-frame12-8-350RS.jpg",
    "category": "Wall Decor and Photo Frames",
    "description": "Premium Moon Collage Frame12 8. Crafted with precision and high-quality materials.",
    "active": true
  },
{
    "id": "mosaic-frame12-10-400rs",
    "name": "Mosaic Frame12 10",
    "price": 400,
    "image": "https://i.postimg.cc/0NQjCm6L/mosaic-frame12-10-400RS.jpg",
    "category": "Wall Decor and Photo Frames",
    "description": "Premium Mosaic Frame12 10. Crafted with precision and high-quality materials.",
    "active": true
  },
{
    "id": "pencil-art-frame12-8-1299rs",
    "name": "Pencil Art Frame12 8",
    "price": 1299,
    "image": "https://i.postimg.cc/43dy1tKD/pencil-art-frame12-8-1299RS.jpg",
    "category": "Wall Decor and Photo Frames",
    "description": "Premium Pencil Art Frame12 8. Crafted with precision and high-quality materials.",
    "active": true
  },
{
    "id": "resin-art8-8-2500-rs",
    "name": "Resin Art 8 8",
    "price": 2500,
    "image": "https://i.postimg.cc/SKsRG820/resin-art8-8-2500-RS.jpg",
    "category": "Wall Decor and Photo Frames",
    "description": "Premium Resin Art 8 8. Crafted with precision and high-quality materials.",
    "active": true
  },
{
    "id": "splashing-effect-frame8-6-250rs",
    "name": "Splashing Effect Frame 8x6",
    "price": 250,
    "image": "https://i.postimg.cc/5t0ymvYW/splashing-effect-frame8-6-250RS.jpg",
    "category": "Wall Decor and Photo Frames",
    "description": "Premium Spalshing Effect Frame8 6. Crafted with precision and high-quality materials.",
    "active": true
  },
{
    "id": "spotify-frame10-8-300-rs",
    "name": "Spotify Frame10 8",
    "price": 300,
    "image": "https://i.postimg.cc/DzMZpZsD/spotify-frame10-8-300-RS.jpg",
    "category": "Wall Decor and Photo Frames",
    "description": "Premium Spotify Frame10 8. Crafted with precision and high-quality materials.",
    "active": true
  },
{
    "id": "vintage-frame12-18-600-rs",
    "name": "Vintage Frame 12 18",
    "price": 600,
    "image": "https://i.postimg.cc/pd6TcT83/vintage-frame12-18-600-RS.jpg",
    "category": "Wall Decor and Photo Frames",
    "description": "Premium Vintage Frame 12 18. Crafted with precision and high-quality materials.",
    "active": true
  },
{
    "id": "wedding-thumb-print-frame-12-18-600",
    "name": "Wedding Thumb Print Frame 12x18",
    "price": 600,
    "image": "https://i.postimg.cc/g0TJtJ8W/wedding-thumb-print-frame-12-18-600.jpg",
    "category": "Wall Decor and Photo Frames",
    "description": "Premium Wedding Thumb Print Frame. Crafted with precision and high-quality materials.",
    "active": true
  },
{
  id: "mdf-mdf-wall-frame-14inch-rate-1400rs-16inch--1900rs",
  name: "MDF Wall Frame - Style 1",
  price: 1400,
  image: "/assets/mdf-wall-frames/MDF wall frame 14inch rate 1400rs 16inch -1900rs.jpg",
  category: "MDF Wall Frames",
  description: "Premium MDF Wall Frame. A high-quality cutout photo frame, perfect for home decor and gifting. Available in 14-inch (₹1400) and 16-inch (₹1900) sizes.",
  active: true,
  featured: false,
  dimensions: "14 / 16 inches",
  sizes: [
    {
      name: "14 inches",
      price: 1400
    },
    {
      name: "16 inches",
      price: 1900
    }
  ]
},
{
  id: "mdf-mdf-wall-framer-ate-14inch-1400rs--16inch-1900rs",
  name: "MDF Wall Frame - Style 2",
  price: 1400,
  image: "/assets/mdf-wall-frames/MDF wall framer ate 14inch-1400rs -16inch-1900rs.jpg",
  category: "MDF Wall Frames",
  description: "Premium MDF Wall Frame. A high-quality cutout photo frame, perfect for home decor and gifting. Available in 14-inch (₹1400) and 16-inch (₹1900) sizes.",
  active: true,
  featured: false,
  dimensions: "14 / 16 inches",
  sizes: [
    {
      name: "14 inches",
      price: 1400
    },
    {
      name: "16 inches",
      price: 1900
    }
  ]
},
{
  id: "mdf-mdf-wall-frames-rate-1500-rs",
  name: "MDF Wall Frame - Style 3",
  price: 1500,
  image: "/assets/mdf-wall-frames/MDF wall frames  rate 1500 rs.jpg",
  category: "MDF Wall Frames",
  description: "Premium MDF Wall Frame. A high-quality customized cutout photo frame, perfect for celebrating special moments and decorating your home.",
  active: true,
  featured: true,
  dimensions: "14 inches"
},
{
  id: "mdf-mdf-wall-frames-rate-2100",
  name: "MDF Wall Frame - Style 4",
  price: 2100,
  image: "/assets/mdf-wall-frames/MDF wall frames  rate 2100.jpg",
  category: "MDF Wall Frames",
  description: "Premium MDF Wall Frame. A high-quality customized cutout photo frame, perfect for celebrating special moments and decorating your home.",
  active: true,
  featured: false,
  dimensions: "14 inches"
},
{
  id: "mdf-mdf-wall-frames-14inch--1650rs-16inch-2200rs",
  name: "MDF Wall Frame - Style 5",
  price: 1650,
  image: "/assets/mdf-wall-frames/MDF wall frames 14inch -1650rs 16inch  2200rs.jpg",
  category: "MDF Wall Frames",
  description: "Premium MDF Wall Frame. A high-quality cutout photo frame, perfect for home decor and gifting. Available in 14-inch (₹1650) and 16-inch (₹2200) sizes.",
  active: true,
  featured: false,
  dimensions: "14 / 16 inches",
  sizes: [
    {
      name: "14 inches",
      price: 1650
    },
    {
      name: "16 inches",
      price: 2200
    }
  ]
},
{
  id: "mdf-mdf-wall-frames-rate-1300rs",
  name: "MDF Wall Frame - Style 6",
  price: 1300,
  image: "/assets/mdf-wall-frames/MDF wall frames rate 1300rs.jpg",
  category: "MDF Wall Frames",
  description: "Premium MDF Wall Frame. A high-quality customized cutout photo frame, perfect for celebrating special moments and decorating your home.",
  active: true,
  featured: false,
  dimensions: "14 inches"
},
{
  id: "mdf-mdf-wall-frames14-inch-rate-16-inch--1900rs",
  name: "MDF Wall Frame - Style 7",
  price: 1900,
  image: "/assets/mdf-wall-frames/MDF wall frames14 inch rate 16 inch -1900rs.jpg",
  category: "MDF Wall Frames",
  description: "Premium MDF Wall Frame. A high-quality customized cutout photo frame, perfect for celebrating special moments and decorating your home.",
  active: true,
  featured: false,
  dimensions: "14 inches"
},
{
  id: "mdf-mdf-wallframes-rate-1500",
  name: "MDF Wall Frame - Style 8",
  price: 1500,
  image: "/assets/mdf-wall-frames/MDF wallframes  rate 1500.jpg",
  category: "MDF Wall Frames",
  description: "Premium MDF Wall Frame. A high-quality customized cutout photo frame, perfect for celebrating special moments and decorating your home.",
  active: true,
  featured: false,
  dimensions: "14 inches"
},
{
  id: "mdf-mdf-wallframes-14inch--1400rs-16-inch--1900rs",
  name: "MDF Wall Frame - Style 9",
  price: 1400,
  image: "/assets/mdf-wall-frames/MDF wallframes 14inch -1400rs  16 inch -1900rs.jpg",
  category: "MDF Wall Frames",
  description: "Premium MDF Wall Frame. A high-quality customized cutout photo frame, perfect for celebrating special moments and decorating your home.",
  active: true,
  featured: true,
  dimensions: "14 inches"
},
{
  id: "mdf-mdf-wallframes-14inch-1400rs-16inch--1900rs",
  name: "MDF Wall Frame - Style 10",
  price: 1400,
  image: "/assets/mdf-wall-frames/MDF wallframes 14inch-1400rs 16inch -1900rs.jpg",
  category: "MDF Wall Frames",
  description: "Premium MDF Wall Frame. A high-quality cutout photo frame, perfect for home decor and gifting. Available in 14-inch (₹1400) and 16-inch (₹1900) sizes.",
  active: true,
  featured: false,
  dimensions: "14 / 16 inches",
  sizes: [
    {
      name: "14 inches",
      price: 1400
    },
    {
      name: "16 inches",
      price: 1900
    }
  ]
},
{
  id: "mdf-mdf-wallframes-rate-1900rs",
  name: "MDF Wall Frame - Style 11",
  price: 1900,
  image: "/assets/mdf-wall-frames/MDF wallframes rate 1900rs.jpg",
  category: "MDF Wall Frames",
  description: "Premium MDF Wall Frame. A high-quality customized cutout photo frame, perfect for celebrating special moments and decorating your home.",
  active: true,
  featured: false,
  dimensions: "14 inches"
},
{
  id: "mdf-mdfwall-frame-14inch-1400rs-16inch--1900rs",
  name: "MDF Wall Frame - Style 12",
  price: 1400,
  image: "/assets/mdf-wall-frames/MDFwall frame 14inch 1400rs 16inch -1900rs.jpg",
  category: "MDF Wall Frames",
  description: "Premium MDF Wall Frame. A high-quality cutout photo frame, perfect for home decor and gifting. Available in 14-inch (₹1400) and 16-inch (₹1900) sizes.",
  active: true,
  featured: false,
  dimensions: "14 / 16 inches",
  sizes: [
    {
      name: "14 inches",
      price: 1400
    },
    {
      name: "16 inches",
      price: 1900
    }
  ]
},
{
  id: "mdf-mdfwall-frames-14inch--1400rs-16inch-1900rs-couple-photo",
  name: "MDF Wall Frame - Couple Photo",
  price: 1400,
  image: "/assets/mdf-wall-frames/MDFwall frames 14inch -1400rs  16inch 1900rs couple photo.jpg",
  category: "MDF Wall Frames",
  description: "Premium MDF Wall Frame. A high-quality cutout photo frame, perfect for home decor and gifting. Available in 14-inch (₹1400) and 16-inch (₹1900) sizes.",
  active: true,
  featured: true,
  dimensions: "14 / 16 inches",
  sizes: [
    {
      name: "14 inches",
      price: 1400
    },
    {
      name: "16 inches",
      price: 1900
    }
  ]
},
{
  id: "mdf-mdfwall-frames-rate-1900",
  name: "MDF Wall Frame - Style 13",
  price: 1900,
  image: "/assets/mdf-wall-frames/MDFwall frames rate 1900.jpg",
  category: "MDF Wall Frames",
  description: "Premium MDF Wall Frame. A high-quality customized cutout photo frame, perfect for celebrating special moments and decorating your home.",
  active: true,
  featured: false,
  dimensions: "14 inches"
},
{
  id: "mdf-mdfwallframe-14inch-rate--1400rs-16inch--1900rs",
  name: "MDF Wall Frame - Style 14",
  price: 1400,
  image: "/assets/mdf-wall-frames/MDFwallframe 14inch rate -1400rs 16inch -1900rs.jpg",
  category: "MDF Wall Frames",
  description: "Premium MDF Wall Frame. A high-quality cutout photo frame, perfect for home decor and gifting. Available in 14-inch (₹1400) and 16-inch (₹1900) sizes.",
  active: true,
  featured: false,
  dimensions: "14 / 16 inches",
  sizes: [
    {
      name: "14 inches",
      price: 1400
    },
    {
      name: "16 inches",
      price: 1900
    }
  ]
},
{
  id: "mdf-mdfwallframe14-inch-rate-1400-rs-16-inch-1900-rs",
  name: "MDF Wall Frame - Style 15",
  price: 1400,
  image: "/assets/mdf-wall-frames/MDFwallframe14 inch rate-1400 rs 16 inch-1900 rs.jpg",
  category: "MDF Wall Frames",
  description: "Premium MDF Wall Frame. A high-quality customized cutout photo frame, perfect for celebrating special moments and decorating your home.",
  active: true,
  featured: false,
  dimensions: "14 inches"
},
{
  id: "mdf-mdfwallframes-2100rs",
  name: "MDF Wall Frame - Style 16",
  price: 2100,
  image: "/assets/mdf-wall-frames/MDFwallframes  2100rs.jpg",
  category: "MDF Wall Frames",
  description: "Premium MDF Wall Frame. A high-quality customized cutout photo frame, perfect for celebrating special moments and decorating your home.",
  active: true,
  featured: false,
  dimensions: "14 inches"
},
{
  id: "mdf-mdfwallframes-14-inch-rate--1400rs-16-inch--1900rs",
  name: "MDF Wall Frame - Style 17",
  price: 1400,
  image: "/assets/mdf-wall-frames/MDFwallframes 14 inch rate -1400rs 16 inch -1900rs.jpg",
  category: "MDF Wall Frames",
  description: "Premium MDF Wall Frame. A high-quality customized cutout photo frame, perfect for celebrating special moments and decorating your home.",
  active: true,
  featured: false,
  dimensions: "14 inches"
},
{
  id: "mdf-saddow-wall-light-frames-rate-18inch-2300",
  name: "Shadow Wall Light Frame - Style 1",
  price: 2300,
  image: "/assets/mdf-wall-frames/saddow wall  light frames rate 18inch-2300.jpg",
  category: "MDF Wall Frames",
  description: "Premium Shadow Wall Light Frame. Radiates a beautiful silhouette glow when turned on, creating a striking decor element for your walls. Crafted with precision and premium high-quality materials.",
  active: true,
  featured: true,
  dimensions: "18 inches"
},
{
  id: "mdf-sadow-wall-light-frames-rate-12inch--1300",
  name: "Shadow Wall Light Frame - Style 2",
  price: 1300,
  image: "/assets/mdf-wall-frames/sadow wall light frames rate 12inch  -1300.jpg",
  category: "MDF Wall Frames",
  description: "Premium Shadow Wall Light Frame. Radiates a beautiful silhouette glow when turned on, creating a striking decor element for your walls. Crafted with precision and premium high-quality materials.",
  active: true,
  featured: true,
  dimensions: "12 inches"
},
{
  id: "mdf-shadow-wall-light-frames-8inch--rate-2250rs",
  name: "Shadow Wall Light Frame - Style 3",
  price: 2250,
  image: "/assets/mdf-wall-frames/shadow wall light frames  8inch -rate 2250rs.jpg",
  category: "MDF Wall Frames",
  description: "Premium Shadow Wall Light Frame. Radiates a beautiful silhouette glow when turned on, creating a striking decor element for your walls. Crafted with precision and premium high-quality materials.",
  active: true,
  featured: true,
  dimensions: "8 inches"
},
{
  id: "mdf-shadow-wall-light-frames-12inch--1500rs",
  name: "Shadow Wall Light Frame - Style 4",
  price: 1500,
  image: "/assets/mdf-wall-frames/shadow wall light frames 12inch -1500rs.jpg",
  category: "MDF Wall Frames",
  description: "Premium Shadow Wall Light Frame. Radiates a beautiful silhouette glow when turned on, creating a striking decor element for your walls. Crafted with precision and premium high-quality materials.",
  active: true,
  featured: true,
  dimensions: "12 inches"
},
{
  id: "mdf-shadow-wall-light-frames-22inch--2500rs",
  name: "Shadow Wall Light Frame - Style 5",
  price: 2500,
  image: "/assets/mdf-wall-frames/shadow wall light frames 22inch -2500rs.jpg",
  category: "MDF Wall Frames",
  description: "Premium Shadow Wall Light Frame. Radiates a beautiful silhouette glow when turned on, creating a striking decor element for your walls. Crafted with precision and premium high-quality materials.",
  active: true,
  featured: true,
  dimensions: "22 inches"
},
{
  id: "mdf-shadow-wall-light-frames-rate-12inch-2200rs",
  name: "Shadow Wall Light Frame - Style 6",
  price: 2200,
  image: "/assets/mdf-wall-frames/shadow wall light frames rate 12inch 2200rs.jpg",
  category: "MDF Wall Frames",
  description: "Premium Shadow Wall Light Frame. Radiates a beautiful silhouette glow when turned on, creating a striking decor element for your walls. Crafted with precision and premium high-quality materials.",
  active: true,
  featured: true,
  dimensions: "12 inches"
},
{
  id: "custom-gift-black-magic-ceramic-mug",
  name: "Black Magic Ceramic Mug",
  price: 500,
  image: "/assets/customized-gifts/black-magic-ceramic-mug.webp",
  category: "Personalized Gifts",
  description: "Watch your favorite memory appear! This premium black magic mug reveals your custom photo when hot liquid is poured into it. An enchanting and heartwarming gift.",
  active: true,
  featured: true
},
{
  id: "custom-gift-color-inside-handle-ceramic-mug",
  name: "Color Inside & Handle Ceramic Mug",
  price: 340,
  image: "/assets/customized-gifts/color-inside-handle-ceramic-mug.webp",
  category: "Personalized Gifts",
  description: "Add a splash of color to your morning brew. Premium ceramic mug featuring customized colors inside and on the handle, beautifully housing your custom printed photo.",
  active: true,
  featured: false
},
{
  id: "custom-gift-color-inside-handle-mug-premium",
  name: "Color Inside & Handle Mug (Premium)",
  price: 400,
  image: "/assets/customized-gifts/color-inside-handle-mug-premium.webp",
  category: "Personalized Gifts",
  description: "High-quality ceramic mug with matching color handle and inner coating. Showcases your custom memories with crystal clear print definition.",
  active: true,
  featured: false
},
{
  id: "custom-gift-inside-heart-handle-white-ceramic-mug",
  name: "Inside Heart Handle White Ceramic Mug",
  price: 500,
  image: "/assets/customized-gifts/inside-heart-handle-white-ceramic-mug.webp",
  category: "Personalized Gifts",
  description: "A lovely white ceramic mug featuring a unique heart-shaped handle. Inside print options make it a sweet, romantic surprise for anniversaries and Valentine's Day.",
  active: true,
  featured: false
},
{
  id: "custom-gift-soft-touch-matte-ceramic-mug",
  name: "Soft Touch Matte Ceramic Mug",
  price: 500,
  image: "/assets/customized-gifts/soft-touch-matte-ceramic-mug.webp",
  category: "Personalized Gifts",
  description: "Experience premium feel with our soft-touch matte finish ceramic mug. Exquisitely printed with your personalized design for a luxurious sipping experience.",
  active: true,
  featured: false
},
{
  id: "custom-gift-full-color-printed-ceramic-mug",
  name: "Full Color Printed Ceramic Mug",
  price: 500,
  image: "/assets/customized-gifts/full-color-printed-ceramic-mug.webp",
  category: "Personalized Gifts",
  description: "Make your mornings vibrant with this full-bleed color printed ceramic mug. Durable construction and brilliant color accuracy for your custom designs.",
  active: true,
  featured: false
},
{
  id: "custom-gift-engraved-wooden-pen-with-gift-box",
  name: "Engraved Wooden Pen with Gift Box",
  price: 250,
  image: "/assets/customized-gifts/engraved-wooden-pen-with-gift-box.webp",
  category: "Personalized Gifts",
  description: "Elegant wooden ballpoint pen with custom text engraving, complete with a matching wooden presentation box. A professional and sophisticated gift.",
  active: true,
  featured: true
},
{
  id: "custom-gift-crystal-ballpoint-pen-customized",
  name: "Crystal Ballpoint Pen (Customized)",
  price: 200,
  image: "/assets/customized-gifts/crystal-ballpoint-pen-customized.webp",
  category: "Personalized Gifts",
  description: "Exquisite color crystal ballpoint pen personalized with your name or business text. Writes smoothly and adds a touch of sparkle to your desk.",
  active: true,
  featured: false
},
{
  id: "custom-gift-customized-premium-pen-style-1",
  name: "Customized Premium Pen - Style 1",
  price: 300,
  image: "/assets/customized-gifts/customized-premium-pen-style-1.webp",
  category: "Personalized Gifts",
  description: "Sleek, high-grade personalized writing pen. Crafted for smooth performance and personalized with precise engraving for a premium look.",
  active: true,
  featured: false
},
{
  id: "custom-gift-metal-ballpoint-pen-customized",
  name: "Metal Ballpoint Pen (Customized)",
  price: 140,
  image: "/assets/customized-gifts/metal-ballpoint-pen-customized.webp",
  category: "Personalized Gifts",
  description: "Sleek, durable metal ballpoint pen personalized with your text. Offers comfortable grip and professional engraving, perfect for corporate gifting.",
  active: true,
  featured: false
},
{
  id: "custom-gift-glossy-acrylic-fridge-magnet-style-1",
  name: "Glossy Acrylic Fridge Magnet - Style 1",
  price: 480,
  image: "/assets/customized-gifts/glossy-acrylic-fridge-magnet-style-1.webp",
  category: "Personalized Gifts",
  description: "Display your favorite memories on your fridge. Premium high-gloss acrylic custom photo magnet with strong magnetic backing.",
  active: true,
  featured: false
},
{
  id: "custom-gift-glossy-acrylic-fridge-magnet-style-4",
  name: "Glossy Acrylic Fridge Magnet - Style 4",
  price: 350,
  image: "/assets/customized-gifts/glossy-acrylic-fridge-magnet-style-4.webp",
  category: "Personalized Gifts",
  description: "Stunning acrylic fridge magnet with a high-gloss finish. Perfect small custom gift for family, friends, or corporate events.",
  active: true,
  featured: false
},
{
  id: "custom-gift-glossy-acrylic-fridge-magnet-style-2",
  name: "Glossy Acrylic Fridge Magnet - Style 2",
  price: 350,
  image: "/assets/customized-gifts/glossy-acrylic-fridge-magnet-style-2.webp",
  category: "Personalized Gifts",
  description: "Vibrant and glossy acrylic photo fridge magnet. Clean edges and high-definition print quality to keep your favorite moments in view.",
  active: true,
  featured: false
},
{
  id: "custom-gift-glossy-acrylic-fridge-magnet-style-3",
  name: "Glossy Acrylic Fridge Magnet - Style 3",
  price: 350,
  image: "/assets/customized-gifts/glossy-acrylic-fridge-magnet-style-3.webp",
  category: "Personalized Gifts",
  description: "Beautifully custom-shaped glossy acrylic fridge magnet. Scratch-resistant surface with long-lasting premium photo print.",
  active: true,
  featured: false
},
{
  id: "custom-gift-acrylic-fridge-magnet",
  name: "Acrylic Fridge Magnet",
  price: 350,
  image: "/assets/customized-gifts/acrylic-fridge-magnet.webp",
  category: "Personalized Gifts",
  description: "Minimalist acrylic photo fridge magnet. Durable structure, brilliant colors, and lightweight construction to stick securely.",
  active: true,
  featured: false
},
{
  id: "custom-gift-glossy-acrylic-fridge-magnet-style-5",
  name: "Glossy Acrylic Fridge Magnet - Style 5",
  price: 480,
  image: "/assets/customized-gifts/glossy-acrylic-fridge-magnet-style-5.webp",
  category: "Personalized Gifts",
  description: "Premium large-size glossy acrylic photo magnet. High clarity and robust magnetic hold to secure your notes and memories.",
  active: true,
  featured: false
},
{
  id: "custom-gift-circular-magic-mirror-photo-frame",
  name: "Circular Magic Mirror Photo Frame",
  price: 300,
  image: "/assets/customized-gifts/circular-magic-mirror-photo-frame.webp",
  category: "Personalized Gifts",
  description: "A mirror that turns into a photo frame! When switched off, it works as a standard circular mirror; when switched on, your custom photo lights up from behind.",
  active: true,
  featured: false
},
{
  id: "custom-gift-heart-shaped-magic-mirror-photo-frame",
  name: "Heart-Shaped Magic Mirror Photo Frame",
  price: 300,
  image: "/assets/customized-gifts/heart-shaped-magic-mirror-photo-frame.webp",
  category: "Personalized Gifts",
  description: "Romantic heart-shaped magic mirror. Plugs in via USB or runs on batteries; reveals your personalized photo with a warm LED glow when turned on.",
  active: true,
  featured: true
},
{
  id: "custom-gift-custom-magic-cushion-pillow",
  name: "Custom Magic Cushion Pillow",
  price: 1000,
  image: "/assets/customized-gifts/custom-magic-cushion-pillow.webp",
  category: "Personalized Gifts",
  description: "Premium quality magic sequins pillow. Swipe the sequins to reveal your hidden customized photo underneath. Fun, decorative, and interactive!",
  active: true,
  featured: false
},
{
  id: "custom-gift-3d-moon-light-lamp-with-wooden-stand",
  name: "3D Moon Light Lamp with Wooden Stand",
  price: 1750,
  image: "/assets/customized-gifts/3d-moon-light-lamp-with-wooden-stand.webp",
  category: "Personalized Gifts",
  description: "Bring the moon to your room! Premium 3D-printed moon lamp customized with your photo and text. Complete with an elegant wooden stand and adjustable LED colors.",
  active: true,
  featured: true
},
{
  id: "custom-gift-personalized-water-bottle-750ml",
  name: "Personalized Water Bottle (750ml)",
  price: 450,
  image: "/assets/customized-gifts/personalized-water-bottle-750ml.webp",
  category: "Personalized Gifts",
  description: "Durable stainless steel water bottle customized with high-quality name printing. Sleek design, leak-proof cap, and perfect for daily office or school use.",
  active: true,
  featured: false
},
{
  id: "custom-gift-personalized-soft-photo-pillow-style-1",
  name: "Personalized Soft Photo Pillow - Style 1",
  price: 1100,
  image: "/assets/customized-gifts/personalized-soft-photo-pillow-style-1.webp",
  category: "Personalized Gifts",
  description: "Ultra-soft premium customized cushion. Features high-definition full-print of your favorite photo on comfortable, huggable fabric.",
  active: true,
  featured: false
},
{
  id: "custom-gift-personalized-soft-photo-pillow-style-2",
  name: "Personalized Soft Photo Pillow - Style 2",
  price: 680,
  image: "/assets/customized-gifts/personalized-soft-photo-pillow-style-2.webp",
  category: "Personalized Gifts",
  description: "Cozy custom photo pillow. Perfect addition to your bedroom or couch decor, featuring vibrant print quality and high-density cotton filling.",
  active: true,
  featured: false
},
{
  id: "custom-gift-single-sided-personalized-photo-pillow",
  name: "Single-Sided Personalized Photo Pillow",
  price: 800,
  image: "/assets/customized-gifts/single-sided-personalized-photo-pillow.webp",
  category: "Personalized Gifts",
  description: "Comfortable square cushion printed with your choice of image on one side. Breathable fabric, soft texture, and durable print quality.",
  active: true,
  featured: false
},
{
  id: "custom-gift-led-glowing-fur-personalized-pillow",
  name: "LED Glowing Fur Personalized Pillow",
  price: 1000,
  image: "/assets/customized-gifts/led-glowing-fur-personalized-pillow.webp",
  category: "Personalized Gifts",
  description: "Stunning soft fur pillow with built-in warm LED lights surrounding your custom printed photo. Adds a cozy, magical glow to any room.",
  active: true,
  featured: false
},
{
  id: "custom-gift-personalized-soft-photo-pillow-style-3",
  name: "Personalized Soft Photo Pillow - Style 3",
  price: 1050,
  image: "/assets/customized-gifts/personalized-soft-photo-pillow-style-3.webp",
  category: "Personalized Gifts",
  description: "Deluxe custom cushion printed with your favorite collage. Extremely soft velvet feel, neat stitching, and hypoallergenic filling.",
  active: true,
  featured: false
},
{
  id: "custom-gift-personalized-soft-photo-pillow-style-4",
  name: "Personalized Soft Photo Pillow - Style 4",
  price: 1200,
  image: "/assets/customized-gifts/personalized-soft-photo-pillow-style-4.webp",
  category: "Personalized Gifts",
  description: "Extra-soft, premium size personalized pillow. Crafted with high-grade satin material to present your images with rich details and color contrast.",
  active: true,
  featured: false
},
{
  id: "custom-gift-customized-photo-t-shirt-printing",
  name: "Customized Photo T-Shirt Printing",
  price: 1300,
  image: "/assets/customized-gifts/customized-photo-t-shirt-printing.webp",
  category: "Personalized Gifts",
  description: "Premium quality custom photo t-shirt printing. Features full-color print capability with excellent washing durability, soft feel, and breathable fabric.",
  active: true,
  featured: false
},
{
  id: "custom-gift-customized-photo-text-t-shirt",
  name: "Customized Photo & Text T-Shirt",
  price: 300,
  image: "/assets/customized-gifts/customized-photo-text-t-shirt.webp",
  category: "Personalized Gifts",
  description: "Express your style with our customized premium white t-shirt. High-quality print for both custom images and text. Perfect for personal wear, birthdays, or team events.",
  active: true,
  featured: false
},
{
  id: "keychain-2d-crystal-keychain-style-1",
  name: "2D Crystal Keychain - Style 1",
  price: 400,
  image: "/assets/keychains/2d-crystal-keychain-style-1.webp",
  category: "Keychains",
  description: "Premium personalized 2d crystal keychain. Crafted with excellent clarity, durable materials, and customized photo/text integration. A perfect custom keepsake or premium gift for your loved ones.",
  active: true,
  featured: true
},
{
  id: "keychain-2d-crystal-keychain-style-2",
  name: "2D Crystal Keychain - Style 2",
  price: 400,
  image: "/assets/keychains/2d-crystal-keychain-style-2.webp",
  category: "Keychains",
  description: "Premium personalized 2d crystal keychain. Crafted with excellent clarity, durable materials, and customized photo/text integration. A perfect custom keepsake or premium gift for your loved ones.",
  active: true,
  featured: false
},
{
  id: "keychain-2d-crystal-keychain-style-3",
  name: "2D Crystal Keychain - Style 3",
  price: 400,
  image: "/assets/keychains/2d-crystal-keychain-style-3.webp",
  category: "Keychains",
  description: "Premium personalized 2d crystal keychain. Crafted with excellent clarity, durable materials, and customized photo/text integration. A perfect custom keepsake or premium gift for your loved ones.",
  active: true,
  featured: false
},
{
  id: "keychain-2d-crystal-keychain-style-4",
  name: "2D Crystal Keychain - Style 4",
  price: 500,
  image: "/assets/keychains/2d-crystal-keychain-style-4.webp",
  category: "Keychains",
  description: "Premium personalized 2d crystal keychain. Crafted with excellent clarity, durable materials, and customized photo/text integration. A perfect custom keepsake or premium gift for your loved ones.",
  active: true,
  featured: false
},
{
  id: "keychain-acrylic-keychain-style-1",
  name: "Acrylic Keychain - Style 1",
  price: 300,
  image: "/assets/keychains/acrylic-keychain-style-1.webp",
  category: "Keychains",
  description: "Premium personalized acrylic keychain. Crafted with excellent clarity, durable materials, and customized photo/text integration. A perfect custom keepsake or premium gift for your loved ones.",
  active: true,
  featured: true
},
{
  id: "keychain-acrylic-keychain-color-printing-style-1",
  name: "Acrylic Keychain (Color Printing) - Style 1",
  price: 200,
  image: "/assets/keychains/acrylic-keychain-color-printing-style-1.webp",
  category: "Keychains",
  description: "Premium personalized acrylic keychain (color printing). Crafted with excellent clarity, durable materials, and customized photo/text integration. A perfect custom keepsake or premium gift for your loved ones.",
  active: true,
  featured: true
},
{
  id: "keychain-acrylic-keychain-color-printing-style-2",
  name: "Acrylic Keychain (Color Printing) - Style 2",
  price: 180,
  image: "/assets/keychains/acrylic-keychain-color-printing-style-2.webp",
  category: "Keychains",
  description: "Premium personalized acrylic keychain (color printing). Crafted with excellent clarity, durable materials, and customized photo/text integration. A perfect custom keepsake or premium gift for your loved ones.",
  active: true,
  featured: false
},
{
  id: "keychain-acrylic-keychain-color-printing-style-3",
  name: "Acrylic Keychain (Color Printing) - Style 3",
  price: 200,
  image: "/assets/keychains/acrylic-keychain-color-printing-style-3.webp",
  category: "Keychains",
  description: "Premium personalized acrylic keychain (color printing). Crafted with excellent clarity, durable materials, and customized photo/text integration. A perfect custom keepsake or premium gift for your loved ones.",
  active: true,
  featured: false
},
{
  id: "keychain-acrylic-keychain-color-printing-style-4",
  name: "Acrylic Keychain (Color Printing) - Style 4",
  price: 200,
  image: "/assets/keychains/acrylic-keychain-color-printing-style-4.webp",
  category: "Keychains",
  description: "Premium personalized acrylic keychain (color printing). Crafted with excellent clarity, durable materials, and customized photo/text integration. A perfect custom keepsake or premium gift for your loved ones.",
  active: true,
  featured: false
},
{
  id: "keychain-acrylic-keychain-color-printing-style-5",
  name: "Acrylic Keychain (Color Printing) - Style 5",
  price: 400,
  image: "/assets/keychains/acrylic-keychain-color-printing-style-5.webp",
  category: "Keychains",
  description: "Premium personalized acrylic keychain (color printing). Crafted with excellent clarity, durable materials, and customized photo/text integration. A perfect custom keepsake or premium gift for your loved ones.",
  active: true,
  featured: false
},
{
  id: "keychain-acrylic-keychain-color-printing-style-6",
  name: "Acrylic Keychain (Color Printing) - Style 6",
  price: 500,
  image: "/assets/keychains/acrylic-keychain-color-printing-style-6.webp",
  category: "Keychains",
  description: "Premium personalized acrylic keychain (color printing). Crafted with excellent clarity, durable materials, and customized photo/text integration. A perfect custom keepsake or premium gift for your loved ones.",
  active: true,
  featured: false
},
{
  id: "keychain-acrylic-keychain-color-printing-style-7",
  name: "Acrylic Keychain (Color Printing) - Style 7",
  price: 200,
  image: "/assets/keychains/acrylic-keychain-color-printing-style-7.webp",
  category: "Keychains",
  description: "Premium personalized acrylic keychain (color printing). Crafted with excellent clarity, durable materials, and customized photo/text integration. A perfect custom keepsake or premium gift for your loved ones.",
  active: true,
  featured: false
},
{
  id: "keychain-acrylic-keychain-color-printing-style-8",
  name: "Acrylic Keychain (Color Printing) - Style 8",
  price: 400,
  image: "/assets/keychains/acrylic-keychain-color-printing-style-8.webp",
  category: "Keychains",
  description: "Premium personalized acrylic keychain (color printing). Crafted with excellent clarity, durable materials, and customized photo/text integration. A perfect custom keepsake or premium gift for your loved ones.",
  active: true,
  featured: false
},
{
  id: "keychain-acrylic-keychain-style-2",
  name: "Acrylic Keychain - Style 2",
  price: 160,
  image: "/assets/keychains/acrylic-keychain-style-2.webp",
  category: "Keychains",
  description: "Premium personalized acrylic keychain. Crafted with excellent clarity, durable materials, and customized photo/text integration. A perfect custom keepsake or premium gift for your loved ones.",
  active: true,
  featured: false
},
{
  id: "keychain-acrylic-keychain-style-3",
  name: "Acrylic Keychain - Style 3",
  price: 180,
  image: "/assets/keychains/acrylic-keychain-style-3.webp",
  category: "Keychains",
  description: "Premium personalized acrylic keychain. Crafted with excellent clarity, durable materials, and customized photo/text integration. A perfect custom keepsake or premium gift for your loved ones.",
  active: true,
  featured: false
},
{
  id: "keychain-acrylic-keychain-style-4",
  name: "Acrylic Keychain - Style 4",
  price: 200,
  image: "/assets/keychains/acrylic-keychain-style-4.webp",
  category: "Keychains",
  description: "Premium personalized acrylic keychain. Crafted with excellent clarity, durable materials, and customized photo/text integration. A perfect custom keepsake or premium gift for your loved ones.",
  active: true,
  featured: false
},
{
  id: "keychain-acrylic-keychain-style-5",
  name: "Acrylic Keychain - Style 5",
  price: 240,
  image: "/assets/keychains/acrylic-keychain-style-5.webp",
  category: "Keychains",
  description: "Premium personalized acrylic keychain. Crafted with excellent clarity, durable materials, and customized photo/text integration. A perfect custom keepsake or premium gift for your loved ones.",
  active: true,
  featured: false
},
{
  id: "keychain-acrylic-keychain-style-6",
  name: "Acrylic Keychain - Style 6",
  price: 300,
  image: "/assets/keychains/acrylic-keychain-style-6.webp",
  category: "Keychains",
  description: "Premium personalized acrylic keychain. Crafted with excellent clarity, durable materials, and customized photo/text integration. A perfect custom keepsake or premium gift for your loved ones.",
  active: true,
  featured: false
},
{
  id: "keychain-acrylic-keychain-style-7",
  name: "Acrylic Keychain - Style 7",
  price: 320,
  image: "/assets/keychains/acrylic-keychain-style-7.webp",
  category: "Keychains",
  description: "Premium personalized acrylic keychain. Crafted with excellent clarity, durable materials, and customized photo/text integration. A perfect custom keepsake or premium gift for your loved ones.",
  active: true,
  featured: false
},
{
  id: "keychain-acrylic-keychain-style-8",
  name: "Acrylic Keychain - Style 8",
  price: 220,
  image: "/assets/keychains/acrylic-keychain-style-8.webp",
  category: "Keychains",
  description: "Premium personalized acrylic keychain. Crafted with excellent clarity, durable materials, and customized photo/text integration. A perfect custom keepsake or premium gift for your loved ones.",
  active: true,
  featured: false
},
{
  id: "keychain-double-sided-wooden-keychain-color-printing-style-1",
  name: "Double-Sided Wooden Keychain (Color Printing) - Style 1",
  price: 300,
  image: "/assets/keychains/double-sided-wooden-keychain-color-printing-style-1.webp",
  category: "Keychains",
  description: "Premium personalized double-sided wooden keychain (color printing). Crafted with excellent clarity, durable materials, and customized photo/text integration. A perfect custom keepsake or premium gift for your loved ones.",
  active: true,
  featured: true
},
{
  id: "keychain-double-sided-wooden-keychain-color-printing-style-2",
  name: "Double-Sided Wooden Keychain (Color Printing) - Style 2",
  price: 300,
  image: "/assets/keychains/double-sided-wooden-keychain-color-printing-style-2.webp",
  category: "Keychains",
  description: "Premium personalized double-sided wooden keychain (color printing). Crafted with excellent clarity, durable materials, and customized photo/text integration. A perfect custom keepsake or premium gift for your loved ones.",
  active: true,
  featured: false
},
{
  id: "keychain-double-sided-wooden-keychain-color-printing-style-3",
  name: "Double-Sided Wooden Keychain (Color Printing) - Style 3",
  price: 300,
  image: "/assets/keychains/double-sided-wooden-keychain-color-printing-style-3.webp",
  category: "Keychains",
  description: "Premium personalized double-sided wooden keychain (color printing). Crafted with excellent clarity, durable materials, and customized photo/text integration. A perfect custom keepsake or premium gift for your loved ones.",
  active: true,
  featured: false
},
{
  id: "keychain-double-sided-wooden-keychain-color-printing-style-4",
  name: "Double-Sided Wooden Keychain (Color Printing) - Style 4",
  price: 300,
  image: "/assets/keychains/double-sided-wooden-keychain-color-printing-style-4.webp",
  category: "Keychains",
  description: "Premium personalized double-sided wooden keychain (color printing). Crafted with excellent clarity, durable materials, and customized photo/text integration. A perfect custom keepsake or premium gift for your loved ones.",
  active: true,
  featured: false
},
{
  id: "keychain-double-sided-wooden-keychain-color-printing-style-5",
  name: "Double-Sided Wooden Keychain (Color Printing) - Style 5",
  price: 300,
  image: "/assets/keychains/double-sided-wooden-keychain-color-printing-style-5.webp",
  category: "Keychains",
  description: "Premium personalized double-sided wooden keychain (color printing). Crafted with excellent clarity, durable materials, and customized photo/text integration. A perfect custom keepsake or premium gift for your loved ones.",
  active: true,
  featured: false
},
{
  id: "keychain-double-sided-wooden-keychain-color-printing-style-6",
  name: "Double-Sided Wooden Keychain (Color Printing) - Style 6",
  price: 300,
  image: "/assets/keychains/double-sided-wooden-keychain-color-printing-style-6.webp",
  category: "Keychains",
  description: "Premium personalized double-sided wooden keychain (color printing). Crafted with excellent clarity, durable materials, and customized photo/text integration. A perfect custom keepsake or premium gift for your loved ones.",
  active: true,
  featured: false
},
{
  id: "keychain-keychain-style-1",
  name: "Keychain - Style 1",
  price: 99,
  image: "/assets/keychains/keychain-style-1.webp",
  category: "Keychains",
  description: "Premium personalized keychain. Crafted with excellent clarity, durable materials, and customized photo/text integration. A perfect custom keepsake or premium gift for your loved ones.",
  active: true,
  featured: true
},
{
  id: "keychain-keychain-style-2",
  name: "Keychain - Style 2",
  price: 199,
  image: "/assets/keychains/keychain-style-2.webp",
  category: "Keychains",
  description: "Premium personalized keychain. Crafted with excellent clarity, durable materials, and customized photo/text integration. A perfect custom keepsake or premium gift for your loved ones.",
  active: true,
  featured: false
},
{
  id: "keychain-keychain-style-3",
  name: "Keychain - Style 3",
  price: 199,
  image: "/assets/keychains/keychain-style-3.webp",
  category: "Keychains",
  description: "Premium personalized keychain. Crafted with excellent clarity, durable materials, and customized photo/text integration. A perfect custom keepsake or premium gift for your loved ones.",
  active: true,
  featured: false
},
{
  id: "keychain-single-sided-acrylic-keychain-style-1",
  name: "Single-Sided Acrylic Keychain - Style 1",
  price: 200,
  image: "/assets/keychains/single-sided-acrylic-keychain-style-1.webp",
  category: "Keychains",
  description: "Premium personalized single-sided acrylic keychain. Crafted with excellent clarity, durable materials, and customized photo/text integration. A perfect custom keepsake or premium gift for your loved ones.",
  active: true,
  featured: true
},
{
  id: "keychain-single-sided-acrylic-keychain-style-2",
  name: "Single-Sided Acrylic Keychain - Style 2",
  price: 200,
  image: "/assets/keychains/single-sided-acrylic-keychain-style-2.webp",
  category: "Keychains",
  description: "Premium personalized single-sided acrylic keychain. Crafted with excellent clarity, durable materials, and customized photo/text integration. A perfect custom keepsake or premium gift for your loved ones.",
  active: true,
  featured: false
},
{
  id: "keychain-single-sided-acrylic-keychain-style-3",
  name: "Single-Sided Acrylic Keychain - Style 3",
  price: 200,
  image: "/assets/keychains/single-sided-acrylic-keychain-style-3.webp",
  category: "Keychains",
  description: "Premium personalized single-sided acrylic keychain. Crafted with excellent clarity, durable materials, and customized photo/text integration. A perfect custom keepsake or premium gift for your loved ones.",
  active: true,
  featured: false
},
{
  id: "keychain-single-sided-crystal-keychain-color-printing-style-1",
  name: "Single-Sided Crystal Keychain (Color Printing) - Style 1",
  price: 400,
  image: "/assets/keychains/single-sided-crystal-keychain-color-printing-style-1.webp",
  category: "Keychains",
  description: "Premium personalized single-sided crystal keychain (color printing). Crafted with excellent clarity, durable materials, and customized photo/text integration. A perfect custom keepsake or premium gift for your loved ones.",
  active: true,
  featured: true
},
{
  id: "keychain-single-sided-crystal-keychain-color-printing-style-2",
  name: "Single-Sided Crystal Keychain (Color Printing) - Style 2",
  price: 400,
  image: "/assets/keychains/single-sided-crystal-keychain-color-printing-style-2.webp",
  category: "Keychains",
  description: "Premium personalized single-sided crystal keychain (color printing). Crafted with excellent clarity, durable materials, and customized photo/text integration. A perfect custom keepsake or premium gift for your loved ones.",
  active: true,
  featured: false
},
{
  id: "keychain-single-sided-crystal-keychain-color-printing-style-3",
  name: "Single-Sided Crystal Keychain (Color Printing) - Style 3",
  price: 400,
  image: "/assets/keychains/single-sided-crystal-keychain-color-printing-style-3.webp",
  category: "Keychains",
  description: "Premium personalized single-sided crystal keychain (color printing). Crafted with excellent clarity, durable materials, and customized photo/text integration. A perfect custom keepsake or premium gift for your loved ones.",
  active: true,
  featured: false
}
];
