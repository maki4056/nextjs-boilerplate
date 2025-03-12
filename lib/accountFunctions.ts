import supabase from "./supabase";

// データの全取得
export const fetchAccounts = async (userId?:string) => {
  try {
    const { data } = await supabase.rpc('get_account_json', { account_id: userId });
    return data;
  } catch (error) {
    console.error(error);
  }
};