import { Account } from "@/app/model/Accounts";
import { SessionOptions } from "iron-session";

export type SessionData = {
  account?: Account;
};

export const sessionOptions: SessionOptions = {
  cookieName: "account-session",
  password: process.env.SESSION_SECRET as string, // .env に設定
  cookieOptions: {
    secure: process.env.NODE_ENV === "production", // 本番環境では secure を有効化
    sameSite: "strict",
  },
};

export const saveAccountToSession = async (account: Account) => {
    await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ account }),
    });
  };

export const getAccountFromSession = async (): Promise<Account | null> => {
    const res = await fetch("/api/session",{method: "GET"});
    return res.ok ? res.json() : null;
  };
