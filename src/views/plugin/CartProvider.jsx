// src/plugin/CartProvider.jsx
import React, { useState } from "react";
import { CartContext } from "./Context";

export const CartProvider = ({ children }) => {
    const [cartCount, setCartCount] = useState(0);

    return (
        <CartContext.Provider value={[cartCount, setCartCount]}>
            {children}
        </CartContext.Provider>
    );
};
