// src/components/Header.jsx
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";

const Header = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div className="w-full flex justify-between items-center px-6 py-4 bg-white shadow-md sticky top-0 z-50">
      <Link to="/rooms" className="text-xl font-bold text-blue-600">密室地圖</Link>

      {user && (
        <div className="flex items-center space-x-4">
          <Link to="/rooms" className="text-sm text-blue-600">📁 密室清單</Link>
          <Link to="/my" className="text-sm text-blue-600">📂 我的紀錄</Link>

          <span className="text-sm">{user.displayName}</span>
          <button
            onClick={handleLogout}
            className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-3 py-1 rounded"
          >
            登出
          </button>
        </div>
      )}
    </div>
  );
};

export default Header;
