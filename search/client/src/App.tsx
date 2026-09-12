import { useState } from 'react';
import './App.css'
import api from './helpers/api';

export function debouncing(fn: (...args: any[]) => void, delay: number): (...args: any[]) => void {
  let timer: ReturnType<typeof setTimeout>;;

  return function (...args: any[]) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay)
  }
}

function App() {
  const [answers, setAnswers] = useState<any>(null);
  const handleSearch = async (text: string): Promise<void> => {
    try {
      console.log("text: ", text);
      const res = await api.get(`/search?query=${text}`);

      const data = res.data.message;
      console.log("data is: ", data)
      setAnswers(data);
    } catch (error) {
      console.log(error);
    }
  }


  const actualSearch: (text: string) => void = debouncing(handleSearch, 1000);
  return (
    <>
      <div className='w-screen h-screen overflow-hidden'>
        <div className='flex flex-col  gap-2 items-center'>
          <label htmlFor="search">Search here: </label>
          <input placeholder='Search here...' onChange={(e) => actualSearch(e.target.value)} className='border-black border text-black w-60 h-8 pl-2' />
        </div>

        <div className='w-full flex flex-col items-center'>
          {
            answers?.map((item: any) => (
              <div key={item._id}>
                <span>{item.name}</span>
              </div>
            ))
          }
        </div>
      </div>
    </>
  )
}

export default App
