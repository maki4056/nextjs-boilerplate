import supabase, { Database } from "./supabase";

// テーブル名
export const TABLE_NAME = "chat-app";

// データの全取得
export const fetchDatabase = async () => {
  try {
    const { data } = await supabase.from(TABLE_NAME).select("*").order("created_at", { ascending: false });
    return data;
  } catch (error) {
    console.error(error);
  }
};

type InsertProps = Pick<Database, "message" | "name" | "url">;

// データの追加
export const addSupabaseData = async ({ message, url, name }: InsertProps) => {
  try {
    await supabase.from(TABLE_NAME).insert({ message, url, name });
  } catch (error) {
    console.error(error);
  }
};