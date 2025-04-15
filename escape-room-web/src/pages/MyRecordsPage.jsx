// src/pages/MyRecordsPage.jsx
import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Header from "../components/Header";

const MyRecordsPage = () => {
  const [playedRooms, setPlayedRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [reviewStates, setReviewStates] = useState({}); // 每間密室暫存輸入

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchPlayedRooms = async () => {
      if (!user) return;

      try {
        const colRef = collection(db, "users", user.uid, "playedRooms");
        const snapshot = await getDocs(colRef);

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setPlayedRooms(data);
      } catch (error) {
        console.error("讀取紀錄失敗：", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayedRooms();
  }, [user]);

  const handleReviewChange = (roomId, field, value) => {
    setReviewStates((prev) => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        [field]: value,
      },
    }));
  };

  const handleReviewSubmit = async (roomId) => {
    const review = reviewStates[roomId];
    if (!review) return;

    const roomRef = doc(db, "users", user.uid, "playedRooms", roomId);
    const publicRef = doc(db, "reviews", roomId, "userReviews", user.uid);

    try {
      // ✅ 更新使用者自己的紀錄
      await updateDoc(roomRef, {
        reviewScore: parseInt(review.score),
        reviewText: review.text,
      });

      // ✅ 儲存到公開 Firestore 結構
      await setDoc(publicRef, {
        score: parseInt(review.score),
        text: review.text,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: new Date(),
      });

      alert("✅ 評論已儲存並公開！");
    } catch (error) {
      console.error("儲存評論失敗：", error);
    }
  };

  if (loading) return <div className="p-4">載入中...</div>;

  if (!user) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-xl font-semibold">請先登入才能查看紀錄 🕵️</h2>
      </div>
    );
  }

  return (
    <>
      <Header user={user} />
      <div className="p-6 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-center">我的密室紀錄 📂</h1>
        {playedRooms.length === 0 ? (
          <div className="text-center text-gray-500">你還沒有紀錄喔！快去玩一場吧 🧩</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {playedRooms.map((room) => (
              <div
                key={room.id}
                className="bg-white rounded-2xl shadow-md p-5 border border-gray-100"
              >
                <div className="text-xl font-bold text-gray-800 mb-1">{room.name}</div>
                <div className="text-sm text-gray-500 mb-2">{room.location}</div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {room.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <div className="text-xs text-gray-400 mb-2">
                  玩過日期：{room.playedAt?.toDate?.().toLocaleDateString?.() || "不明"}
                </div>

                {/* ✍️ 評論區塊 */}
                <div className="mt-3 space-y-2">
                  <label className="block text-sm text-gray-700">
                    評分（0～5）：
                    <input
                      type="number"
                      min="0"
                      max="5"
                      className="ml-2 border rounded px-2 py-1 w-16"
                      value={reviewStates[room.id]?.score || ""}
                      onChange={(e) =>
                        handleReviewChange(room.id, "score", e.target.value)
                      }
                    />
                  </label>
                  <textarea
                    rows="2"
                    placeholder="寫下你的感想..."
                    className="w-full border rounded px-2 py-1 text-sm"
                    value={reviewStates[room.id]?.text || ""}
                    onChange={(e) =>
                      handleReviewChange(room.id, "text", e.target.value)
                    }
                  />
                  <button
                    onClick={() => handleReviewSubmit(room.id)}
                    className="bg-blue-500 text-white text-sm px-4 py-1 rounded hover:bg-blue-600"
                  >
                    儲存評論
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default MyRecordsPage;
