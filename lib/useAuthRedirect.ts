import { supabase } from '@/lib/supabase'
import { App } from '@capacitor/app'; //FOR Android
import { Browser } from '@capacitor/browser'; //FOR Android
import { PluginListenerHandle } from '@capacitor/core'; //FOR Android

// Google サインイン
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'capacitor://com.example.app/auth/callback',
    },
  });

  if (error) {
    console.error('Error signing in:', error);
    return;
  }

  if (data?.url) {
    await Browser.open({ url: data.url });
  }
};

// Deep Link のリスナーセットアップ
export const setupDeepLinkListener = async (): Promise<PluginListenerHandle> => {
  const handle = await App.addListener('appUrlOpen', async (event) => {
    let url = event.url;
    console.log('🔍 Received URL:', url);

    // `#` を `?` に変換して正しいクエリパラメータの形にする
    url = url.replace('#', '?');
    console.log('📌 Fixed URL:', url);

    const params = new URLSearchParams(url.split('?')[1]);

    if (params.has('access_token')) {
      const accessToken = params.get('access_token')!;
      const refreshToken = params.get('refresh_token')!;

      console.log('🔑 Access Token:', accessToken);
      console.log('♻️ Refresh Token:', refreshToken);

      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) {
        console.error('❌ Error setting session:', error);
      } else {
        console.log('✅ Successfully logged in:', data);
      }
    } else {
      console.error('❌ No access_token found in URL.');
    }
  });

  return handle; // handle は再代入されないので const で問題なし
};
