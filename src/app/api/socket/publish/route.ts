import { NextResponse } from "next/server";
import { getIO } from "@/server/socket";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const io = getIO();
    io.emit("publish", body);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Socket not initialized" }, { status: 500 });
  }
}