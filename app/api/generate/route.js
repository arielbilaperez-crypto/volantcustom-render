import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "API ready",
    message: "It works!"
  });
}

export async function POST(req) {
  const body = await req.json();

  return NextResponse.json({
    ok: true,
    received: body
  });
}
