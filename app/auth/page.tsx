'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import ChatApp from "@/app/components/ChatApp";
import { useAuth } from '@/app/context/AuthProvider'
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const { user, logout } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isLogin, setIsLogin] = useState(true)  // ログインと新規登録フォームの切り替え

  const router = useRouter()

  const gotoTop = () => {
    router.push('/')
  }

  // 新規登録処理
  const handleSignUp = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    setLoading(false)

    if (error) {
      alert('新規登録失敗: ' + error.message)
    } else {
      alert('新規登録成功！メールを確認してください')
    }
  }

  // ログイン処理
  const handleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    setLoading(false)

    if (error) {
      alert('ログイン失敗: ' + error.message)
    } else {
      alert('ログイン成功！')
    }
  }

  // ログインフォームと新規登録フォームの切り替え
  const toggleForm = () => setIsLogin(!isLogin)

  return (
    <div className="flex flex-col items-center justify-center h-screen">
        <button onClick={gotoTop} className="bg-black text-white px-4 py-2 rounded mb-4">
        TOP
        </button>
      {user ? (
        <>
          <h1 className="text-3xl font-bold mb-4">ようこそ、{user.email}さん！</h1>
          <h2>チャットアプリ</h2>
          
            <ChatApp />
          <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded">
            ログアウト
          </button>
        </>
      ) : (
        <>
          {isLogin ? (
            <>
              <h1 className="text-3xl font-bold mb-4">ログイン</h1>
              <input
                type="email"
                placeholder="メールアドレス"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border p-2 mb-2"
              />
              <input
                type="password"
                placeholder="パスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border p-2 mb-4"
              />
              <button
                onClick={handleLogin}
                className="bg-blue-500 text-white px-4 py-2 rounded"
                disabled={loading}
              >
                {loading ? 'ログイン中...' : 'ログイン'}
              </button>
              <p className="mt-4">
                新規登録はこちら{' '}
                <button onClick={toggleForm} className="text-blue-500">新規登録</button>
              </p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold mb-4">新規登録</h1>
              <input
                type="email"
                placeholder="メールアドレス"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border p-2 mb-2"
              />
              <input
                type="password"
                placeholder="パスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border p-2 mb-4"
              />
              <button
                onClick={handleSignUp}
                className="bg-blue-500 text-white px-4 py-2 rounded"
                disabled={loading}
              >
                {loading ? '登録中...' : '新規登録'}
              </button>
              <p className="mt-4">
                すでにアカウントをお持ちですか？{' '}
                <button onClick={toggleForm} className="text-blue-500">ログイン</button>
              </p>
            </>
          )}
        </>
      )}

    </div>
  )
}
