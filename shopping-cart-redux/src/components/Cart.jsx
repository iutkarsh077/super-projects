import { useDispatch, useSelector } from 'react-redux'
import { removeProduct } from '../features/cart';
import { ShoppingCart } from 'lucide-react';

const Cart = () => {
  const dispatch = useDispatch();
  const selectedProducts = useSelector((state)=>state.cartProducts.products);
  return (
    <div className="p-4 grid grid-cols-4 gap-4">
      {selectedProducts &&
        selectedProducts?.map((product) => (
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
              <ShoppingCart onClick={()=>dispatch(removeProduct(product.id))} className="w-6 h-6 text-red-400 hover:text-red-600 hover:cursor-pointer transition-colors" />{" "}
              Remove from Cart
            </p>
          </div>
        ))}
    </div>
  )
}

export default Cart
