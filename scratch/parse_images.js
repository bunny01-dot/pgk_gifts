
const images = [
"https://i.postimg.cc/6Qm3b3nK/4D-CUTTING-FRAME-12-10-INCHES-1300-RS.jpg",
"https://i.postimg.cc/PqRxVxYq/acrylic-photo-frame-12-8-999RS.jpg",
"https://i.postimg.cc/LsbXQXL8/acrylic-transparent-photo-frame-12-8-999RS.jpg",
"https://i.postimg.cc/6Qm3b3n8/Anniversary-photo-frame-12-18-INCH-600-RS.jpg",
"https://i.postimg.cc/W4H3Y3gZ/baby-birthday-frame-15-10-450-RS.jpg",
"https://i.postimg.cc/yd3NMHyk/badge-frame-999RS-8-8-INCH.jpg",
"https://i.postimg.cc/Tw5Pz6JQ/bird-collage-frame-12-18-6OO-RS.jpg",
"https://i.postimg.cc/cCqJZbFB/black-and-white-mosaic-frameframe-12-18-600-RS.jpg",
"https://i.postimg.cc/yxqNBbLG/book-rotating-frame-600RS.jpg",
"https://i.postimg.cc/C5yKYQv0/calender-frame-12-8-250-RS.jpg",
"https://i.postimg.cc/nr8LZPdn/collage-frame-12-8-350RS.jpg",
"https://i.postimg.cc/zvnGfFMJ/date-of-birth-frame-9-6-350-RS.jpg",
"https://i.postimg.cc/6qdpQfSq/digital-painting-frame-15-12-500RS.jpg",
"https://i.postimg.cc/6qdpQfS4/double-exposure-12-10-500RS.jpg",
"https://i.postimg.cc/MHypGm41/eye-connect-frame-4-4IN-99RS.jpg",
"https://i.postimg.cc/Kjn8YDVL/eye-frame4-4-99RS.jpg",
"https://i.postimg.cc/dQd1nJ0W/farewell-frame-12-18-700-RS.jpg",
"https://i.postimg.cc/T2mwQTP7/flim-strip-9-6-350.jpg",
"https://i.postimg.cc/T2mwQTP4/folding-frame8-6-600.jpg",
"https://i.postimg.cc/SQ8sVmKP/google-map-frame15-10-450RS.jpg",
"https://i.postimg.cc/13M46Mzt/google-search-frame12-8-350RS.jpg",
"https://i.postimg.cc/pdTrB89Q/heart-collage-frame8-6-250.jpg",
"https://i.postimg.cc/VN6vFMSj/illusion-frame12-8-1300RS.jpg",
"https://i.postimg.cc/6Q3qhR7h/insta-collage-frame-12-18-600.jpg",
"https://i.postimg.cc/s2XxJSBY/magic-led-frame1300RS-12-8.jpg",
"https://i.postimg.cc/VN6vFMSG/moon-collage-frame12-8-350RS.jpg",
"https://i.postimg.cc/0NQjCm6L/mosaic-frame12-10-400RS.jpg",
"https://i.postimg.cc/43dy1tKD/pencil-art-frame12-8-1299RS.jpg",
"https://i.postimg.cc/SKsRG820/resin-art8-8-2500-RS.jpg",
"https://i.postimg.cc/5t0ymvYW/spalshing-effect-frame8-6-250RS.jpg",
"https://i.postimg.cc/DzMZpZsD/spotify-frame10-8-300-RS.jpg",
"https://i.postimg.cc/pd6TcT83/vintage-frame12-18-600-RS.jpg",
"https://i.postimg.cc/g0TJtJ8W/wedding-th-Umb-print-frame-frame12-18-600.jpg"
];

function parse(url) {
    const filename = url.split('/').pop().split('.')[0];
    let price = 0;
    const priceMatch = filename.match(/(\d+)RS/i) || filename.match(/(\d+)-RS/i) || filename.match(/-(\d+)$/);
    if (priceMatch) {
        price = parseInt(priceMatch[1]);
    } else {
        // Fallback for cases like bird-collage-frame-12-18-6OO-RS (O instead of 0)
        const weirdMatch = filename.match(/(\d+O+)-RS/i);
        if (weirdMatch) {
            price = parseInt(weirdMatch[1].replace(/O/g, '0'));
        }
    }

    if (price === 0) {
        // Try one more time for things like anniversary-photo-frame-12-18-600
        const simpleMatch = filename.match(/-(\d+)$/);
        if (simpleMatch) price = parseInt(simpleMatch[1]);
    }

    let name = filename
        .replace(/-/g, ' ')
        .replace(/\d+RS/i, '')
        .replace(/\d+-RS/i, '')
        .replace(/INCH(ES)?/i, '')
        .trim();
    
    // Title case
    name = name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

    return {
        id: filename.toLowerCase(),
        name: name,
        price: price || 499, // default price if not found
        image: url,
        category: "Mdf Frames",
        description: `Premium ${name}. Crafted with precision and high-quality materials.`,
        active: true
    };
}

const products = images.map(parse);
console.log(JSON.stringify(products, null, 2));
