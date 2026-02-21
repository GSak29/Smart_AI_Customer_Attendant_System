import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

interface Product {
  Product_ID: string;
  Product_Name: string;
  Category: string;
  Price_Min_INR: number;
  Price_Max_INR: number;
  Stock_Quantity: number;
  Material_Type: string;
  Wood_Type: string;
  Length_mm: number;
  Width_mm: number;
  Height_mm: number;
  Thickness_mm: number;
  Grade: string;
  Usage_Type: string;
  Size_Description: string;
  Image_URL?: string;
}

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFromFirebase = async () => {
      try {
        // 1. Get the list of product IDs from python's output
        const res = await fetch('/products.json');
        const searchResults: any[] = await res.json();

        if (searchResults.length === 0) {
          setProducts([]);
          setLoading(false);
          return;
        }

        // 2. Fetch full live details from Firebase for each ID
        const liveProducts: Product[] = [];
        for (const item of searchResults) {
          if (!item.Product_ID) continue;

          const docRef = doc(db, 'products', item.Product_ID.toString());
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const dbData = docSnap.data();
            liveProducts.push({
              ...item,
              ...dbData,
              Image_URL: dbData.Image_URL || dbData.image_url || item.image_url || item.Image_URL
            } as Product);
          } else {
            console.warn(`Product ID ${item.Product_ID} not found in live database. Using local fallback.`);
            liveProducts.push({
              ...item,
              Image_URL: item.image_url || item.Image_URL || 'https://placehold.co/600x400?text=No+Image',
            } as Product);
          }
        }

        setProducts(liveProducts);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching live products:", err);
        setLoading(false);
      }
    };

    fetchFromFirebase();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-sans">Loading products...</div>;
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col font-sans">
        <h2 className="text-2xl font-bold mb-2">No products found</h2>
        <p className="text-gray-500">Run the python extractor to fetch products.</p>
      </div>
    );
  }

  const currentProduct = products[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? products.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === products.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="h-screen w-screen bg-white font-sans text-slate-800 flex flex-col overflow-hidden">
      {/* Main Header */}
      <div className="px-6 py-4 bg-white z-10 shrink-0 text-center border-b border-slate-100">
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Interactive Product Catalog</h1>
      </div>

      {/* Main Body */}
      <div className="flex-grow p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 overflow-y-auto bg-slate-50/50">

        {/* Left Column: Image Showcase 16:9 */}
        <div className="flex flex-col w-full lg:col-span-7 h-full gap-4 min-w-0">
          <div className="relative rounded-2xl overflow-hidden bg-white shadow-sm flex-grow aspect-video border border-slate-100 group">
            {/* Background gradient behind image */}
            <div className="absolute inset-0 bg-gradient-to-tr from-orange-50/80 to-slate-50/50 mix-blend-multiply pointer-events-none"></div>

            <img
              src={currentProduct.Image_URL || 'https://placehold.co/1920x1080?text=No+Image'}
              alt={currentProduct.Product_Name}
              className="absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-[1.02] transition-transform duration-700 ease-out"
            />

            {/* Slideshow Controls */}
            <button
              onClick={handlePrev}
              className="absolute top-1/2 left-4 -translate-y-1/2 w-10 h-10 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center shadow-md hover:shadow-lg hover:text-orange-600 hover:scale-110 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out font-bold z-10"
            >
              <ChevronLeft className="w-6 h-6 ml-[-2px] stroke-[3]" />
            </button>
            <button
              onClick={handleNext}
              className="absolute top-1/2 right-4 -translate-y-1/2 w-10 h-10 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center shadow-md hover:shadow-lg hover:text-orange-600 hover:scale-110 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out font-bold z-10"
            >
              <ChevronRight className="w-6 h-6 mr-[-2px] stroke-[3]" />
            </button>
          </div>

          {/* Thumbnails Row */}
          <div className="w-full relative group/scroll">
            <button
              onClick={() => {
                const container = document.getElementById('thumb-scroll');
                if (container) container.scrollBy({ left: -200, behavior: 'smooth' });
              }}
              className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 w-8 h-8 md:w-10 md:h-10 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center shadow-md hover:shadow-lg hover:text-orange-600 hover:scale-110 opacity-0 group-hover/scroll:opacity-100 transition-all duration-300 ease-out font-bold z-20 border border-slate-100"
            >
              <ChevronLeft className="w-5 h-5 ml-[-2px] stroke-[3]" />
            </button>
            <div
              id="thumb-scroll"
              className="flex flex-row overflow-x-auto gap-3 px-2 py-3 snap-x scroll-smooth hide-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <style>{`
                .hide-scrollbar::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              {products.map((prod, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`flex-none w-20 h-20 sm:w-24 sm:h-24 relative rounded-lg overflow-hidden aspect-square transition-all duration-500 ease-out bg-white snap-center ${idx === currentIndex
                    ? 'ring-2 ring-offset-2 ring-orange-500 shadow-md scale-105 z-10 opacity-100'
                    : 'ring-1 ring-slate-200 hover:ring-slate-400 opacity-60 hover:opacity-100 grayscale-[50%] hover:grayscale-0'
                    }`}
                >
                  <img
                    src={prod.Image_URL || 'https://placehold.co/600x400?text=No+Image'}
                    alt={prod.Product_Name}
                    className="w-full h-full object-cover p-1 bg-slate-50"
                  />
                  {idx === currentIndex && (
                    <div className="absolute inset-0 bg-orange-500/10 mix-blend-overlay"></div>
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                const container = document.getElementById('thumb-scroll');
                if (container) container.scrollBy({ left: 200, behavior: 'smooth' });
              }}
              className="absolute right-0 top-1/2 -translate-y-1/2 -mr-2 w-8 h-8 md:w-10 md:h-10 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center shadow-md hover:shadow-lg hover:text-orange-600 hover:scale-110 opacity-0 group-hover/scroll:opacity-100 transition-all duration-300 ease-out font-bold z-20 border border-slate-100"
            >
              <ChevronRight className="w-5 h-5 mr-[-2px] stroke-[3]" />
            </button>
          </div>
        </div>

        {/* Right Column: Data Grid */}
        <div className="flex flex-col w-full lg:col-span-5 h-full bg-white rounded-2xl p-6 shadow-sm border border-slate-100">

          <div className="mb-6">
            <h2 className="text-2xl font-black text-slate-900 leading-[1.2] tracking-tight mb-3">
              {currentProduct.Product_Name || 'Product Name Missing'}
            </h2>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-600 uppercase tracking-widest shadow-sm">
                {currentProduct.Category || 'Uncategorized'}
              </span>
              <p className="text-slate-400 font-mono text-xs px-2 py-1 bg-slate-50 rounded-md ring-1 ring-slate-200">ID: {currentProduct.Product_ID}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-6 gap-x-6">

            {/* Price Range */}
            <div className="col-span-2 bg-slate-50 p-4 rounded-xl ring-1 ring-slate-100">
              <p className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Price Range</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-black text-slate-900 leading-tight">
                  ₹{currentProduct.Price_Min_INR || '0'} <span className="text-slate-300 font-light mx-1 text-lg">to</span> ₹{currentProduct.Price_Max_INR || '0'}
                </p>
              </div>
            </div>

            {/* Stock */}
            <div>
              <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Stock Status</p>
              <p className="text-base font-bold text-slate-800 leading-tight flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
                {currentProduct.Stock_Quantity || '0'} units
              </p>
            </div>

            {/* Grade */}
            <div>
              <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Grade</p>
              <p className="text-base font-bold text-slate-800 leading-tight">
                {currentProduct.Grade || 'Standard'}
              </p>
            </div>

            {/* Material */}
            <div className="col-span-2">
              <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Material Overview</p>
              <p className="text-base font-bold text-slate-800 leading-tight">
                {currentProduct.Material_Type || 'Engineered Wood'}
                {currentProduct.Wood_Type && <span className="text-slate-500 font-medium ml-1.5">({currentProduct.Wood_Type})</span>}
              </p>
            </div>

            {/* Dimensions */}
            <div>
              <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Dimensions (mm)</p>
              <p className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                {currentProduct.Length_mm || '450'} <span className="text-slate-300 font-light text-xs">x</span> {currentProduct.Width_mm || '450'} <span className="text-slate-300 font-light text-xs">x</span> {currentProduct.Height_mm || '450'}
              </p>
            </div>

            {/* Thickness */}
            <div>
              <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Thickness</p>
              <p className="text-base font-bold text-slate-800 leading-tight">
                {currentProduct.Thickness_mm || '18'} <span className="text-slate-400 font-medium text-sm">mm</span>
              </p>
            </div>

            {/* Usage */}
            <div className="col-span-2">
              <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Primary Usage</p>
              <p className="text-base font-bold text-slate-800 leading-tight">
                {currentProduct.Usage_Type || 'Commercial & Residential Furniture'}
              </p>
            </div>

          </div>

          <div className="border-t border-slate-100 mt-6 pt-6 flex-grow">
            <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Product Description</p>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              {currentProduct.Size_Description || 'No description available for this item.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
