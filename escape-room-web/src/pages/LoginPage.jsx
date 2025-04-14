// src/pages/LoginPage.jsx
import { useEffect } from "react";
import { auth } from "../firebase";
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 如果已經登入，自動跳轉
    onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/rooms");
      }
    });
  }, []);

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate("/rooms");
    } catch (error) {
      console.error("登入錯誤：", error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">歡迎來到密室地圖 🗺️</h1>
      <button
        onClick={handleGoogleLogin}
        className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-600 transition"
      >
        使用 Google 登入
      </button>
    </div>
  );
};

export default LoginPage;
