import { NextResponse } from "next/server";
import { pinata } from "@/utils/config";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cid = searchParams.get("cid");
  if (!cid) {
    return NextResponse.json(
      { error: "Missing cid parameter" },
      { status: 400 }
    );
  }
  try {
    const res = await pinata.files.public.list().cid(cid);
    return NextResponse.json(res);
  } catch (e) {
    return NextResponse.json(
      { error: `Failed to fetch files: ${e}` },
      { status: 500 }
    );
  }
}
