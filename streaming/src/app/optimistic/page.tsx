"use client";
import { startTransition, useOptimistic, useState } from "react"

const OptimisticUpdate = () => {
    const [liked, setLiked] = useState(false);
    const [optimisticLike, setOptimisticLiked] = useOptimistic(liked);

    const handleOptimisticLikes = async () => {
        const nextLiked = !liked;
        startTransition(async () => {
            try {
                setOptimisticLiked(!liked);

                await new Promise((resolve) => setTimeout(resolve, 3000));

                const res = await fetch(
                    "https://jsonplaceholder.typicode.com/pots"
                );

                if (!res.ok) {
                    throw new Error("API request failed");
                }

                setLiked(nextLiked);
            } catch (error) {
                console.log(error);
            }
        })
    }
    return (
        <div>
            <div>
                <img src="https://static.vecteezy.com/system/resources/thumbnails/049/174/246/small/a-smiling-young-indian-man-with-formal-shirts-outdoors-photo.jpg" alt="image" className="rounded-md w-80 h-auto" />
                <button onClick={handleOptimisticLikes} className="ml-4 hover:cursor-pointer">{optimisticLike ? "UnLike" : "Like"}</button>
            </div>
        </div>
    )
}

export default OptimisticUpdate;