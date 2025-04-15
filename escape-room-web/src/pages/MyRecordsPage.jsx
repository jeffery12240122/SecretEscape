import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const MyRecordsPage = () => {
  const [playedRooms, setPlayedRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

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
          ...doc.data()
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

  if (loading) return <div className="p-4">載入中...</div>;

  if (!user) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-xl font-semibold">請先登入才能查看紀錄 🕵️</h2>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">我的密室紀錄</h1>
      {playedRooms.length === 0 ? (
        <div>你還沒有紀錄喔！快去玩一場吧 🧩</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {playedRooms.map((room) => (
            <div
              key={room.id}
              className="bg-white shadow-md rounded-lg p-4 border"
            >
              <div className="text-lg font-semibold">{room.name}</div>
              <div className="text-sm text-gray-500">{room.location}</div>
              <div className="text-yellow-600">⭐️ {room.rating}</div>
              <div className="text-xs text-gray-400">
                玩過日期：
                {room.playedAt?.toDate?.().toLocaleDateString?.() || "不明"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRecordsPage;
