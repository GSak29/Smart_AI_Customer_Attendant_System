import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { db } from '../firebase';
import { collection, doc, setDoc, deleteDoc, updateDoc, onSnapshot } from 'firebase/firestore';

export interface Product {
    Product_ID: string;
    Category: string;
    Product_Name: string;
    Material_Type: string;
    Wood_Type: string;
    Length_mm: number;
    Width_mm: number;
    Height_mm: number;
    Thickness_mm: number;
    Size_Description: string;
    Price_Min_INR: number;
    Price_Max_INR: number;
    Stock_Quantity: number;
    Grade: string;
    Usage_Type: string;
    Image_URL?: string; // Optional image URL
}

interface ProductContextType {
    products: Product[];
    loading: boolean;
    setProducts: (products: Product[]) => void;
    addProduct: (product: Product) => Promise<void>;
    updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("Setting up Firestore listener for 'products'...");
        const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
            console.log(`Firestore update: ${snapshot.docs.length} products found.`);
            const productsData: Product[] = snapshot.docs.map(doc => doc.data() as Product);
            setProducts(productsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching products from Firestore: ", error);
            if (error.code === 'permission-denied') {
                alert("Error: Permission denied. Please check your Firestore Security Rules.");
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const addProduct = async (product: Product) => {
        console.log("Attempting to add product:", product);
        try {
            await setDoc(doc(db, "products", product.Product_ID), product);
            console.log("Product added successfully!");
        } catch (error: any) {
            console.error("Error adding product: ", error);
            alert(`Failed to add product: ${error.message}`);
        }
    };

    const updateProduct = async (id: string, updatedProduct: Partial<Product>) => {
        console.log(`Attempting to update product ${id}:`, updatedProduct);
        try {
            const productRef = doc(db, "products", id);
            await updateDoc(productRef, updatedProduct);
            console.log("Product updated successfully!");
        } catch (error: any) {
            console.error("Error updating product: ", error);
            alert(`Failed to update product: ${error.message}`);
        }
    };

    const deleteProduct = async (id: string) => {
        console.log(`Attempting to delete product ${id}`);
        try {
            await deleteDoc(doc(db, "products", id));
            console.log("Product deleted successfully!");
        } catch (error: any) {
            console.error("Error deleting product: ", error);
            alert(`Failed to delete product: ${error.message}`);
        }
    };

    return (
        <ProductContext.Provider value={{ products, loading, setProducts, addProduct, updateProduct, deleteProduct }}>
            {children}
        </ProductContext.Provider>
    );
};

export const useProducts = () => {
    const context = useContext(ProductContext);
    if (context === undefined) {
        throw new Error('useProducts must be used within a ProductProvider');
    }
    return context;
};
