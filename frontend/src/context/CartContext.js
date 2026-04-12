import { createContext, useState, useContext, useEffect } from 'react';
import API from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [cartCount, setCartCount] = useState(0);
    const { user } = useAuth();

    useEffect(() => { if (user) fetchCart(); else setCartItems([]); }, [user]);
    useEffect(() => { setCartCount(cartItems.reduce((sum, i) => sum + parseInt(i.quantity), 0)); }, [cartItems]);

    const fetchCart = async () => {
        try { const { data } = await API.get('/api/cart.php?action=list'); setCartItems(data); }
        catch (err) { console.error(err); }
    };

    const addToCart = async (productId, quantity = 1) => {
        await API.post('/api/cart.php?action=add', { product_id: productId, quantity });
        await fetchCart();
    };

    const updateQuantity = async (cartId, quantity) => {
        await API.put(`/api/cart.php?action=update&id=${cartId}`, { quantity });
        await fetchCart();
    };

    const removeFromCart = async (cartId) => {
        await API.delete(`/api/cart.php?action=remove&id=${cartId}`);
        await fetchCart();
    };

    const clearCart = async () => {
        await API.delete('/api/cart.php?action=clear');
        setCartItems([]);
    };

    const getTotal = () => cartItems.reduce((sum, item) => {
        const price = parseFloat(item.sale_price || item.price);
        return sum + price * parseInt(item.quantity);
    }, 0);

    return (
        <CartContext.Provider value={{ cartItems, cartCount, addToCart, updateQuantity, removeFromCart, clearCart, getTotal, fetchCart }}>
            {children}
        </CartContext.Provider>
    );
};
