import React, { createContext, useState, useContext } from 'react';
import { db, auth } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Alert } from 'react-native';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // UPDATED: Now accepts quantity parameter to allow adding multiple at once
  const addToCart = (product, quantity = 1) => {
    setCartItems((prev) => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      }
      return [...prev, { ...product, quantity: quantity }];
    });
  };

  const removeFromCart = (id) => setCartItems(prev => prev.filter(item => item.id !== id));

  // NEW: Added clearCart function to empty the cart after successful order
  const clearCart = () => setCartItems([]);

  // UPDATED: Now accepts shippingData from the Checkout Screen
  const processOrder = async (shippingData) => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Login Required", "Please login to place an order");
      return false;
    }

    try {
      const orderData = {
        userId: user.uid,
        userEmail: user.email,
        items: cartItems,
        total: totalPrice,
        status: 'Processing',
        shippingInfo: shippingData, // Saving the address/phone here!
        createdAt: serverTimestamp(),
        date: new Date().toLocaleDateString(),
      };

      await addDoc(collection(db, "orders"), orderData);
      clearCart(); // Using the new clearCart function here
      Alert.alert("Success", "Your order has been placed!");
      return true;
    } catch (e) {
      console.error("Order error:", e);
      Alert.alert("Error", "Failed to place order.");
      return false;
    }
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  const totalPrice = cartItems.reduce((sum, item) => {
    const originalPrice = typeof item.price === 'string' 
      ? parseFloat(item.price.replace(/,/g, '')) 
      : item.price;
    
    const discount = parseFloat(item.discount) || 0;
    const actualPrice = originalPrice - (originalPrice * (discount / 100));
    return sum + (actualPrice * item.quantity);
  }, 0);

  return (
    // UPDATED: Included clearCart in the Provider value so other files can use it
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, cartCount, totalPrice, processOrder, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);