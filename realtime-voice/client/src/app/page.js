"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [userList, setUserList] = useState([]);
  const [retry, setRetry] = useState(0);


  const fetchUserList = async () => {
    try {
      const res = await fetch("http://localhost:4000/users");
      const data = await res.json();
      console.log(data);
      setUserList(data.data);
      setRetry((prev) => prev + 1);
    } catch (error) {
      if (retry < 3) {
        fetchUserList();
      }
      console.log(error);
    }
  }


  useEffect(() => {
    fetchUserList();
  }, [])
  return (
    <div className="w-screen h-screen overflow-auto p-4">
      <div>retry is : {retry}</div>
      {userList && userList.length > 0 ? (
        <ul className="space-y-2">
          {userList.map((item) => (
            <li key={item.id} className="p-2 border-b border-gray-200">
              {item.name}
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">
          No users found.
        </div>
      )}
    </div>
  );
}
