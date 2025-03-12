import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/sessionAccount";

// セッションを取得
export async function GET(req: NextRequest) {
  const session = await getIronSession<SessionData>(req, new NextResponse(), sessionOptions);
  return NextResponse.json(session.account || null);
}

// セッションを設定
export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = new NextResponse();
  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  
  session.account = body.account;
  await session.save();
  
  return NextResponse.json({ message: "Session saved" });
}

// セッションを削除
export async function DELETE(req: NextRequest) {
  const res = new NextResponse();
  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  
  session.destroy();
  
  return NextResponse.json({ message: "Session cleared" });
}
