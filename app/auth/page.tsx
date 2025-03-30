'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import ChatApp from "@/app/components/ChatApp";
import { fetchAccounts } from "@/lib/accountFunctions";
// import { getAccountFromSession,saveAccountToSession } from "@/lib/sessionAccount";
import { useAuth } from '@/app/context/AuthProvider'
import { useRouter } from 'next/navigation';
import { Account } from '../model/Accounts';
import { Auth } from '@supabase/auth-ui-react'; //アプリビルド時のみコメントアウト
import { ThemeSupa } from '@supabase/auth-ui-shared';　//アプリビルド時のみコメントアウト
// import { PluginListenerHandle } from '@capacitor/core'; //FOR Android
// import { signInWithGoogle, setupDeepLinkListener } from '@/lib/useAuthRedirect'; //FOR Android

export default function AuthPage() {
  const { user, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [account_name, setAccountName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [account, setAccount] = useState<Account | null>(null);
  const [isFetching, setIsFetching] = useState(true); // 追加: ローディング状態
  const router = useRouter();

  const gotoTop = () => router.push('/');

  useEffect(() => {
    const fetchAccountData = async () => {
      setIsFetching(true); // ローディング開始
      
       // sessionStorage にアカウントデータがある場合は即座にセット
       const cachedAccount = sessionStorage.getItem("account");
       if (cachedAccount) {
         setAccount(JSON.parse(cachedAccount));
         setIsFetching(false);
         return;
       }
 
       // 初回ログイン時のみ Supabase から取得
       if (user) {
           const fetchedAccount = await fetchAccounts(user.id);
           setAccount(fetchedAccount);
           sessionStorage.setItem("account", JSON.stringify(fetchedAccount)); // キャッシュ
       }
 
      setIsFetching(false); // ローディング終了
    };
    fetchAccountData();
  }, [user]);
  
  // Deep Link のリスナー FOR Android
  // useEffect(() => {
  //   let handle: PluginListenerHandle | undefined;

  //   const init = async () => {
  //     handle = await setupDeepLinkListener();
  //   };

  //   init();

  //   return () => {
  //     handle?.remove().catch(console.error);
  //   };
  // }, []);

  const handleSignUp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ 
      email,
      password,
      options: {
        data: {
          account_name,
        },
      },
     });
    setLoading(false);

    if (error) {
      alert('新規登録失敗: ' + error.message);
    } else {
      alert('新規登録成功！メールを確認してください');
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      alert('ログイン失敗: ' + error.message);
      return;
    }
    alert('ログイン成功！');
  };

  const toggleForm = () => setIsLogin(!isLogin);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <button onClick={gotoTop} className="bg-black text-white px-4 py-2 rounded mb-4">
        TOP
      </button>
      {/* ログイン情報取得中はローディング表示 */}
      {isFetching ? (
        <div className="text-lg font-bold">読み込み中...</div>
      ) : user ? (
        <div className="w-full flex flex-col items-center">
          <h1 className="text-3xl font-bold mb-2">
            ようこそ、{account?.account_name ?? "ゲスト"}さん！
          </h1>
          <h2 className="mb-4">チャットアプリ</h2>

          <div className="w-full max-w-3xl flex-1">
            {account && user && <ChatApp account={account} user={user} />}
          </div>

          <button
            onClick={() => {
              sessionStorage.removeItem("account"); // ログアウト時にキャッシュ削除
              logout();
            }}
            className="bg-red-500 text-white px-4 py-2 rounded mt-4"
          >
            ログアウト
          </button>
        </div>
      ) : (
        <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
          {isLogin ? (
            <>
              <h1 className="text-2xl font-bold mb-4">ログイン</h1>
              <input type="email" placeholder="メールアドレス" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border p-2 mb-2 rounded" />
              <input type="password" placeholder="パスワード" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border p-2 mb-4 rounded" />
              <button onClick={handleLogin} className="w-full bg-blue-500 text-white px-4 py-2 rounded" disabled={loading}>
                {loading ? 'ログイン中...' : 'ログイン'}
              </button>
              {/* For Android Start */}
              {/*<button onClick={signInWithGoogle} className="w-full bg-green-500 text-white px-4 py-2 rounded mt-2">
                  Google でログイン
              </button>*/}
              {/* For Android End */}
              {/* アプリビルド時のみコメントアウト START*/}
              <Auth
                supabaseClient={supabase}
                appearance={{ theme: ThemeSupa }}
                providers={['google']}
                onlyThirdPartyProviders={true}
              />
              {/* アプリビルド時のみコメントアウト　END */}
              <p className="mt-4 text-center">
                新規登録はこちら <button onClick={toggleForm} className="text-blue-500">新規登録</button>
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-4">新規登録</h1>
              <input type="text" placeholder="アカウント名" value={account_name} onChange={(e) => setAccountName(e.target.value)} className="w-full border p-2 mb-2 rounded" />
              <input type="email" placeholder="メールアドレス" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border p-2 mb-2 rounded" />
              <input type="password" placeholder="パスワード" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border p-2 mb-4 rounded" />
              <button onClick={handleSignUp} className="w-full bg-blue-500 text-white px-4 py-2 rounded" disabled={loading}>
                {loading ? '登録中...' : '新規登録'}
              </button>
              {/* For Android Start */}
              {/* <button onClick={signInWithGoogle} className="w-full bg-green-500 text-white px-4 py-2 rounded mt-2">
                  Google でログイン
              </button> */}
              {/* For Android End */}
              {/* アプリビルド時のみコメントアウト START*/}
              <Auth
                supabaseClient={supabase}
                appearance={{ theme: ThemeSupa }}
                providers={['google']}
                onlyThirdPartyProviders={true}
              />
              {/* アプリビルド時のみコメントアウト　END */}
              <p className="mt-4 text-center">
                 すでにアカウントをお持ちですか？{' '}
                 <button onClick={toggleForm} className="text-blue-500">ログイン</button>
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
