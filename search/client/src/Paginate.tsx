import { useEffect, useState } from "react"
import api from "./helpers/api";
import { debouncing } from "./App";

const Pagination = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [data, setData] = useState<any>(null);
    const [totalPages, setTotalPages] = useState(1);


    const handleGetPaginateData = async (type?: string) => {
        let page = currentPage;

        if (type === "next") {
            page = page + 1;
        }
        if (type === "prev") {
            page = page - 1;
        }
        setCurrentPage(page);
        try {
            const res = await api.get(`/paginate?page=${page}`);

            console.log(res);
            setData(res?.data?.message?.findUsers);
            setTotalPages(res?.data?.message?.totalPages)
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        handleGetPaginateData()
    }, [])


    const handlePaginate: (args: string) => void = debouncing(handleGetPaginateData, 1000)

    return (
        <div className="flex flex-col items-center overflow-x-hidden bg-gray-500 h-screen pt-5">
            <div className="footer flex gap-6 mb-10">
                <button disabled={currentPage === 1} onClick={() => handlePaginate("prev")} className="bg-black text-white py-1 px-4 rounded-md hover:cursor-pointer disabled:bg-gray-300">Prev</button>
                <button disabled={currentPage === totalPages} onClick={() => handlePaginate("next")} className="bg-black text-white py-1 px-4 rounded-md hover:cursor-pointer disabled:bg-gray-300">Next</button>
            </div>
            <div>
                {
                    data && data.map((item) => (
                        <div key={item._id} className="flex gap-4 items-end">
                            <span>{item.name}</span>
                            <span>{item.email}</span>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}


export default Pagination