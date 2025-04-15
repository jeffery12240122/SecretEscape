// src/pages/LoginPage.jsx
import { useEffect } from "react";
import { auth } from "../firebase";
import {
    signInWithRedirect,
    GoogleAuthProvider,
    getRedirectResult,
    setPersistence,
    browserLocalPersistence,
    onAuthStateChanged
  } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    getRedirectResult(auth).then((result) => {
      if (result?.user) {
        console.log("🔁 redirect 登入成功：", result.user.email);
        navigate("/rooms");
      }
    }).catch((err) => {
      console.error("redirect 登入失敗", err);
    });
  
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
      await setPersistence(auth, browserLocalPersistence);
      await signInWithRedirect(auth, provider); // ✅ 重點：改用 redirect 模式
    } catch (error) {
      console.error("❌ 登入錯誤：", error.code, error.message);
      alert("登入失敗，請稍後再試");
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
