import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Loader2, ShoppingCart } from "lucide-react";
import { useDispatch } from "react-redux";
import { addProducts } from "../features/cart";

const Home = () => {
  const dispatch = useDispatch();
  const fetchAllProducts = async () => {
    try {
      const res = await axios.get(`https://fakestoreapi.com/products`);
      return res.data;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };
  const { data, error, isError, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: fetchAllProducts,
  });

  console.log(data);
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="text-blue-500 animate-spin w-8 h-8 transition-all" />
      </div>
    );
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="p-4 grid grid-cols-4 gap-4">
      {data &&
        data?.map((product) => (
          <div
            key={product.id}
            className="border rounded-lg p-4 flex flex-col items-center shadow"
          >
            <img
              src={product.image}
              alt={product.title}
              className="w-24 h-24 object-contain"
            />
            <h3 className="font-semibold text-center mt-2">{product.title}</h3>
            <p className="text-blue-600 font-bold">${product.price}</p>
            <p className="flex items-center gap-x-4 mt-4">
              {" "}
              <ShoppingCart onClick={()=>dispatch(addProducts(product))} className="w-6 h-6 text-gray-400 hover:text-stone-600 hover:cursor-pointer transition-colors" />{" "}
              Add to Cart
            </p>
          </div>
        ))}
    </div>
  );
};

export default Home;
