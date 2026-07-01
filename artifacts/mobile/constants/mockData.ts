export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  category: string;
  rating: number;
  reviews: number;
  discount: number;
  gradientColors: [string, string];
  badge?: string;
  isWishlisted?: boolean;
  description?: string;
  fabric?: string;
  sizes?: string[];
  colors?: string[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  bgColor: string;
  accentColor: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  gradientColors: [string, string];
  tag: string;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
  date: string;
  verified: boolean;
}

export interface Order {
  id: string;
  orderId: string;
  date: string;
  status: "Delivered" | "In Transit" | "Processing" | "Cancelled";
  items: { name: string; qty: number; price: number }[];
  total: number;
  tracking: string | null;
}

export const BANNERS: Banner[] = [
  {
    id: "1",
    title: "Festival Season",
    subtitle: "Premium silk sarees up to 60% off",
    cta: "Shop Now",
    gradientColors: ["#6B1A1A", "#2C1206"],
    tag: "Limited Time",
  },
  {
    id: "2",
    title: "New Arrivals",
    subtitle: "Bridal lehenga collection 2025",
    cta: "Explore",
    gradientColors: ["#8B6914", "#C9A84C"],
    tag: "Just In",
  },
  {
    id: "3",
    title: "Silver Jewels",
    subtitle: "Handcrafted 925 silver jewellery",
    cta: "View All",
    gradientColors: ["#3A3A4A", "#5A5A6A"],
    tag: "Exclusive",
  },
];

export const CATEGORIES: Category[] = [
  { id: "1", name: "Women", icon: "woman", bgColor: "#FDEEE8", accentColor: "#6B1A1A" },
  { id: "2", name: "Men", icon: "man", bgColor: "#E8EDF5", accentColor: "#1A2C6B" },
  { id: "3", name: "Kids", icon: "happy", bgColor: "#E8F5E8", accentColor: "#1A6B1A" },
  { id: "4", name: "Silver", icon: "diamond", bgColor: "#EBEBEB", accentColor: "#505060" },
  { id: "5", name: "Festival", icon: "star", bgColor: "#FDF5E0", accentColor: "#C9A84C" },
  { id: "6", name: "Bridal", icon: "heart", bgColor: "#FDEBEB", accentColor: "#8B0000" },
];

export const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Kanjivaram Silk Saree",
    price: 4299,
    originalPrice: 5999,
    category: "Women",
    rating: 4.8,
    reviews: 234,
    discount: 28,
    gradientColors: ["#6B1A1A", "#2C1206"],
    badge: "Bestseller",
    description: "Pure Kanjivaram silk with traditional zari work. A timeless piece for every special occasion.",
    fabric: "100% Pure Silk",
    sizes: ["Free Size"],
    colors: ["Maroon", "Navy", "Green"],
  },
  {
    id: "2",
    name: "Banarasi Handloom",
    price: 3599,
    originalPrice: 4800,
    category: "Women",
    rating: 4.6,
    reviews: 187,
    discount: 25,
    gradientColors: ["#C9A84C", "#8B6914"],
    badge: "New",
    description: "Authentic Banarasi handloom with intricate gold thread weaving.",
    fabric: "Silk Cotton Blend",
    sizes: ["Free Size"],
    colors: ["Gold", "Red", "Blue"],
  },
  {
    id: "3",
    name: "Bridal Lehenga Set",
    price: 12999,
    originalPrice: 18000,
    category: "Women",
    rating: 4.9,
    reviews: 89,
    discount: 28,
    gradientColors: ["#8B0000", "#3D0000"],
    badge: "Premium",
    description: "Exquisite bridal lehenga with heavy embroidery and premium fabric.",
    fabric: "Georgette with Silk Lining",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["Red", "Pink", "Maroon"],
  },
  {
    id: "4",
    name: "Men's Sherwani",
    price: 6599,
    originalPrice: 8500,
    category: "Men",
    rating: 4.7,
    reviews: 156,
    discount: 22,
    gradientColors: ["#2C1206", "#1A0800"],
    badge: "Top Pick",
    description: "Regal sherwani with traditional embroidery. Perfect for weddings and celebrations.",
    fabric: "Raw Silk",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "Ivory", "Maroon"],
  },
  {
    id: "5",
    name: "Pattu Pavadai",
    price: 1899,
    originalPrice: 2500,
    category: "Kids",
    rating: 4.5,
    reviews: 203,
    discount: 24,
    gradientColors: ["#D4826A", "#9C4B35"],
    badge: undefined,
    description: "Beautiful silk pavadai for little ones. Perfect for festivals and functions.",
    fabric: "Silk",
    sizes: ["2Y", "4Y", "6Y", "8Y", "10Y"],
    colors: ["Red", "Green", "Pink"],
  },
  {
    id: "6",
    name: "Silver Chain Necklace",
    price: 899,
    originalPrice: 1200,
    category: "Silver",
    rating: 4.6,
    reviews: 312,
    discount: 25,
    gradientColors: ["#808090", "#505060"],
    badge: "Trending",
    description: "925 sterling silver chain with delicate pendant. Handcrafted by artisans.",
    fabric: "925 Sterling Silver",
    sizes: ["16 inch", "18 inch", "20 inch"],
    colors: ["Silver"],
  },
  {
    id: "7",
    name: "Chudidar Suit Set",
    price: 2299,
    originalPrice: 3200,
    category: "Women",
    rating: 4.4,
    reviews: 178,
    discount: 28,
    gradientColors: ["#1A5C6B", "#0D3B45"],
    badge: undefined,
    description: "Elegant chudidar set with matching dupatta and churidar.",
    fabric: "Cotton Silk",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Teal", "Blue", "Purple"],
  },
  {
    id: "8",
    name: "Pure Cotton Saree",
    price: 1499,
    originalPrice: 2000,
    category: "Women",
    rating: 4.3,
    reviews: 145,
    discount: 25,
    gradientColors: ["#4A7C59", "#2C5C3A"],
    badge: "Eco",
    description: "Soft pure cotton saree, ideal for everyday wear.",
    fabric: "100% Pure Cotton",
    sizes: ["Free Size"],
    colors: ["Green", "White", "Orange"],
  },
];

export const REVIEWS: Review[] = [
  {
    id: "1",
    name: "Priya Sharma",
    rating: 5,
    text: "Absolutely stunning quality! The Kanjivaram saree I ordered was exactly as shown. Fast delivery and beautiful packaging. Will definitely order again!",
    date: "2 days ago",
    verified: true,
  },
  {
    id: "2",
    name: "Meena Krishnan",
    rating: 5,
    text: "Best saree shop! The fabric quality is exceptional and the designs are timeless. The team was very helpful with sizing.",
    date: "1 week ago",
    verified: true,
  },
  {
    id: "3",
    name: "Anjali Nair",
    rating: 4,
    text: "Lovely collection of festival wear. Got a beautiful lehenga for my daughter's function. Very happy with the purchase!",
    date: "2 weeks ago",
    verified: true,
  },
];

export const ORDERS: Order[] = [
  {
    id: "1",
    orderId: "KRM2024001",
    date: "Dec 15, 2024",
    status: "Delivered",
    items: [{ name: "Kanjivaram Silk Saree", qty: 1, price: 4299 }],
    total: 4299,
    tracking: "TN123456789IN",
  },
  {
    id: "2",
    orderId: "KRM2024002",
    date: "Dec 20, 2024",
    status: "In Transit",
    items: [
      { name: "Bridal Lehenga Set", qty: 1, price: 12999 },
      { name: "Silver Chain Necklace", qty: 1, price: 899 },
    ],
    total: 13898,
    tracking: "TN987654321IN",
  },
  {
    id: "3",
    orderId: "KRM2024003",
    date: "Dec 22, 2024",
    status: "Processing",
    items: [{ name: "Men's Sherwani", qty: 1, price: 6599 }],
    total: 6599,
    tracking: null,
  },
];

export const TRENDING_SEARCHES = [
  "Silk Sarees",
  "Bridal Lehenga",
  "Silver Jewellery",
  "Festival Wear",
  "Kanjivaram",
  "Pattu Sarees",
  "Sherwani",
  "Chudidar",
];

export const RECENT_SEARCHES = ["Kanjivaram", "Gold jewellery", "Kids pattu"];
