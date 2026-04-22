import { db } from '../config/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

// 1. HARDCODED DEFAULTS (Optional - keeps the app looking full while Firebase loads)
export const DEFAULT_PRODUCTS = [
  { 
    id: '1', 
    title: 'Sony Wireless Headphones', 
    price: '45,999', 
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800',
    category: 'Electronics'
  },
  { 
    id: '2', 
    title: 'Samsung Galaxy Watch', 
    price: '2,500', 
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800',
    category: 'Electronics'
  }
];

// 2. LIVE FETCH FUNCTION (The logic to get data from Firebase)
export const fetchFirebaseProducts = async () => {
  try {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    const products = [];
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });
    
    return products;
  } catch (error) {
    console.error("Error fetching products: ", error);
    return DEFAULT_PRODUCTS; // Fallback to defaults if Firebase fails
  }
};

/**
 * NOTE: 
 * Because Firebase is asynchronous (takes time to load), 
 * we usually use the `onSnapshot` method directly in our 
 * Home/Search screens to get "Real-Time" updates.
 */