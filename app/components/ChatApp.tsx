'use client'

import { Database } from "@/lib/supabase";
import { TABLE_NAME, addSupabaseData, fetchDatabase } from "@/lib/supabaseFunctions";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from '@/app/context/AuthProvider'
import { useRouter } from "next/navigation";

const ChatApp = () => {
  const [inputText, setInputText] = useState(""); // 入力テキスト
  const [messageText, setMessageText] = useState<Database[]>([]); // メッセージ
  const [errorMessage, setErrorMessage] = useState(""); // エラーメッセージ
  const { user } = useAuth();
  const router = useRouter();

  // ログアウト済みの場合はログインページにリダイレクト
  useEffect(() => {
    if (!user) router.push("/");
  }, [user, router]);

  // リアルタイムデータ更新
  const fetchRealtimeData = () => {
    try {
      const channel = supabase
        .channel("table_postgres_changes")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: TABLE_NAME,
          },
          (payload) => {
            console.log("payload: ", payload);
            const { created_at, id, message, url, name } = payload.new;
            setMessageText((prev) => [{ created_at, id, message, url, name }, ...prev].slice(0, 10));
          }
        )
        .subscribe();

      // リスナーの解除
      return () => {
        supabase.removeChannel(channel);
      };
    } catch (error) {
      console.error(error);
    }
  };

  // 初回のみ全データフェッチとリアルタイムリスナー登録
  useEffect(() => {
    (async () => {
      const allMessage = await fetchDatabase();
      setMessageText(allMessage?.slice(0, 10) as Database[]);
    })();
    fetchRealtimeData();
  }, []);

  // 入力したメッセージ
  const onChangeInputText = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(event.target.value);
    if (event.target.value.length > 50) {
      setErrorMessage("入力上限を超えています");
    } else {
      setErrorMessage("");
    }
  };

  // メッセージの送信
  const onSubmitNewMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inputText.length > 50) {
      setErrorMessage("入力上限を超えています");
      return;
    }
    if (inputText.trim() === "") return;

    await addSupabaseData({ message: inputText, name: user?.email ?? 'ゲスト', url: 'https://example.com' });
    setInputText("");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      {/* チャット入力フォーム */}
      <form onSubmit={onSubmitNewMessage} className="bg-white p-4 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold text-center mb-3">チャットを送信</h2>
        <input
          type="text"
          name="message"
          value={inputText}
          onChange={onChangeInputText}
          maxLength={50}
          aria-label="新規メッセージを入力"
          className="w-full p-2 border-2 border-blue-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
          placeholder="メッセージを入力 (50文字以内)"
        />
        {errorMessage && <p className="text-red-500 text-sm mt-1">{errorMessage}</p>}
        <button
          type="submit"
          disabled={inputText === "" || inputText.length > 50}
          className={`w-full mt-2 p-2 rounded-lg text-white font-bold transition-all ${
            inputText === "" || inputText.length > 50
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          送信
        </button>
      </form>

      {/* チャットメッセージ一覧 */}
      <div className="mt-6 w-full max-w-md bg-white p-4 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-center mb-3">メッセージ一覧</h2>
        {messageText?.length > 0 ? (
          messageText.map((msg) => (
            <div key={msg.id} className="p-2 border-b border-gray-300">
              <p className="font-semibold">{msg.name}:</p>
              <p className="text-gray-700">{msg.message}</p>
              <p className="text-xs text-gray-500">{new Date(msg.created_at).toLocaleString()}</p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">メッセージがありません</p>
        )}
      </div>
    </div>
  );
};

export default ChatApp;
