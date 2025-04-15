// src/pages/LoginPage.jsx
import { useEffect } from "react";
import { auth } from "../firebase";
import {
  signInWithPopup,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("✅ 已登入使用者：", user.email);
        navigate("/rooms");
      } else {
        console.log("🕵️ 尚未登入");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();

    try {
      // 設定登入狀態儲存策略為 local 儲存（記住登入）
      await setPersistence(auth, browserLocalPersistence);

      // 登入
      await signInWithPopup(auth, provider);

      console.log("✅ 登入成功！");
      navigate("/rooms");
    } catch (error) {
      console.error("❌ 登入錯誤：", error.code, error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">歡迎來到密室地圖 🗺️</h1>
      <button
        onClick={handleGoogleLogin}
        className="bg-white border px-6 py-3 rounded-lg shadow hover:bg-gray-100 transition"
      >
        使用 Google 登入
      </button>
    </div>
  );
};

export default LoginPage;
