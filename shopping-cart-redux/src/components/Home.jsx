import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Loader2, ShoppingCart } from "lucide-react";
import { useDispatch } from "react-redux";
import { addProducts } from "../features/cart";

const Home = () => {
  const dispatch = useDispatch();

  const fetchAllProducts = async () => {
    const res = await axios.get("https://fakestoreapi.com/products");
    return res.data;
  };

  const { data, error, isError, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: fetchAllProducts,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="text-blue-600 animate-spin w-10 h-10" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500 font-medium">
        Error: {error.message}
      </div>
    );
  }

  return (
    <div className="p-6 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {data?.map((product) => (
        <div
          key={product.id}
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
            onClick={() => dispatch(addProducts(product))}
            className="mt-4 flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-700 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            Add to Cart
          </button>
        </div>
      ))}
    </div>
  );
};

export default Home;
