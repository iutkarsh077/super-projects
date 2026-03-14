import { motion } from "motion/react"
const Button = () => {
  return (
    <div className="bg-black text-white h-screen w-full flex items-center justify-center">
        <motion.button initial={{
          rotate: 0,
          opacity: 0
        }} 
        animate={{
          opacity: 1
        }}
        whileHover={{
          rotate: [0, 20, 0],
          y: -10,
          boxShadow: "0px 20px 50px rgba(8,112,184,0.7)"
        }}
        transition={{
          duration: 1
        }} className="bg-neutral-800 hover:cursor-pointer shadow-md shadow-cyan-600 h-14 w-40 text-xl rounded-md font-medium text-white uppercase">Subscribe</motion.button>
    </div>
  )
}

export default Button
