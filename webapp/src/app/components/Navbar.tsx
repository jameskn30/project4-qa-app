import { FaUser, FaComment } from 'react-icons/fa';
import Link from 'next/link'; 

const Navbar = () => {
  return (
    <div className="flex items-center justify-between p-2 bg-green-500 text-gray-900 shadow">
      <div className="flex-1 justify-start text-left flex">
        <Link href="/" className="p-2 mx-2 bg-green-400 hover:bg-green-600 rounded flex items-center text-gray-900">About</Link>
      </div>
      <div className="flex-1 text-center">
        <span className="text-xl font-bold">Logo</span>
      </div>
      <div className="flex-1 text-right flex justify-end">
        <button className="p-2 mx-2 bg-green-400 hover:bg-green-600 rounded flex items-center text-gray-900">
          <span>
            <FaUser className="mr-2" />
          </span>
          User
        </button>
        <button className="p-2 mx-2 bg-green-400 hover:bg-green-600 rounded flex items-center text-gray-900">
          <span>
            <FaComment className="mr-2" />
          </span>
          Feedback
        </button>
      </div>
    </div>
  );
};

export default Navbar;