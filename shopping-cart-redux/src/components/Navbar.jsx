import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useSelector } from "react-redux";

const Navbar = () => {
    const selectedProducts = useSelector((state)=>state.cartProducts.products);
  return (
    <nav className="w-full border-b border-stone-200 bg-white">
      <div className="flex items-center justify-between px-6 py-4 sm:px-8 lg:px-12">
        <Link
          to="/"
          className="flex items-center gap-2 font-semibold text-lg text-stone-900 hover:text-stone-700 transition-colors"
        >
          <div className="w-6 h-6 bg-stone-900 rounded-sm"></div>
          <span>Cart</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className="text-stone-600 hover:text-stone-900 transition-colors text-sm font-medium"
          >
            Home
          </Link>
          <Link
            to="/cart"
            className="relative flex items-center justify-center"
          >
            <ShoppingCart className="w-6 h-6 text-stone-900 hover:text-stone-700 transition-colors" />
            <span className="absolute -top-2 -right-2 bg-stone-900 text-white text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full">
              {selectedProducts.length || 0}
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
