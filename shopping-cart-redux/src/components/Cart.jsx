import { useDispatch, useSelector } from "react-redux";
import { removeProduct } from "../features/cart";
import { Trash2, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";

const Cart = () => {
  const [products, setCartProducts] = useState(null);
  const dispatch = useDispatch();
  
  const selectedProducts = useSelector((state) => state.cartProducts.products);
  useEffect(()=>{
    setCartProducts(selectedProducts)
  }, [selectedProducts])

  if (products === null || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <ShoppingCart className="w-12 h-12 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">
          Your cart is empty 🛒
        </h2>
        <p className="text-gray-500 mt-2">Start adding some products!</p>
      </div>
    );
  }

  return (
    <div className="p-6 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product, index) => (
        <div
          key={index}
          className="border border-gray-200 rounded-xl p-5 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow bg-white"
        >
          <img
            src={product.image}
            alt={product.title}
            className="w-28 h-28 object-contain mb-3"
          />
          <h3 className="font-semibold text-sm text-center line-clamp-2">
            {product.title}
          </h3>
          <p className="text-blue-600 font-bold text-lg mt-2">${product.price}</p>

          <button
            onClick={() => dispatch(removeProduct(product.id))}
            className="mt-4 flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            Remove
          </button>
        </div>
      ))}
    </div>
  );
};

export default Cart;
