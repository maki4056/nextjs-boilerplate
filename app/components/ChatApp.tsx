'use client'

import { Database } from "@/lib/supabase";
import { TABLE_NAME, addSupabaseData, fetchDatabase } from "@/lib/supabaseFunctions";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
// import Image from "next/image";
import { useAuth } from '@/app/context/AuthProvider'
import { useRouter } from "next/navigation";

const ChatApp = () => {
  const [inputText, setInputText] = useState(""); // 入力テキスト
  const [messageText, setMessageText] = useState<Database[]>([]); // メッセージ
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
            setMessageText((prev) => [{ created_at, id, message, url, name }, ...prev].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
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
      setMessageText(allMessage as Database[]); // '{ [x: string]: any; }[] | null'
    })();
    fetchRealtimeData();
  }, []);

  // 入力したメッセージ
  const onChangeInputText = (event: React.ChangeEvent<HTMLInputElement>) => setInputText(event.target.value);

  // メッセージの送信
  const onSubmitNewMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inputText === "") return;
    await addSupabaseData({ message: inputText, name: user?.email ?? 'ゲスト', url: 'https://example.com' });
    setInputText("");
  };

  return (
    <div>
      <form onSubmit={onSubmitNewMessage}>
        <input
          type="text"
          name="message"
          value={inputText}
          onChange={onChangeInputText}
          aria-label="新規メッセージを入力"
        />
        <button type="submit" disabled={inputText === ""}>送信</button>
      </form>
      <div>
        {messageText?.length > 0 ? (
          messageText.map((msg) => (
            <div key={msg.id}>
              {/* <Image src={msg.avatarUrl} alt={msg.name} width={40} height={40} /> */}
              <p>{msg.name}: {msg.message}</p>
              <p>{new Date(msg.created_at).toLocaleString()}</p>
            </div>
          ))
        ) : (
          <p>メッセージがありません</p>
        )}
      </div>
    </div>
  );
};

export default ChatApp;
