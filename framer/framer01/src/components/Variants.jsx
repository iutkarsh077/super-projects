import { BadgeAlert, BedDouble, CircleChevronRight, Home, Sidebar } from "lucide-react"
import { motion } from "motion/react"
import { useState } from "react"

const Variants = () => {
    const [isOpen, setIsOpen] = useState(false);
    const sideBarVariants = {
        open: {
            width: "200px",
        },
        closed: {
            width: "50px",
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.1,
            }
        }
    }

    const itemsVariants = {
        open:{
            opacity: 1,
            y: 0
        },
        closed: {
            opacity: 0,
            y: 30
        }
    }
  return (
    <div className="h-screen w-full">
      <motion.div initial={false} whileHover={isOpen ? "open" : "closed"} variants={sideBarVariants} className="h-full w-50 bg-gray-400 flex flex-col items-end pr-5 gap-y-10">
        <div className="flex gap-x-4 items-center text-2xl font-semibold">
            <span>Dashboard</span>
            <CircleChevronRight onClick={()=>setIsOpen(!isOpen)} className="text-3xl" />
        </div>
        <motion.ul  className="flex flex-col gap-y-5">
            <motion.li variants={itemsVariants} className="flex gap-x-4 items-center font-semibold text-2xl">
                <Home/> <span>Home</span>
            </motion.li>

            <motion.li variants={itemsVariants} className="flex gap-x-4 items-center font-semibold text-2xl">
                <BadgeAlert /> <span>About</span>
            </motion.li>

            <motion.li variants={itemsVariants} className="flex gap-x-4 items-center font-semibold text-2xl">
               <BedDouble /> <span>Contact</span>
            </motion.li>
        </motion.ul>
      </motion.div>
    </div>
  )
}

export default Variants
