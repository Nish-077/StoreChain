import { NextResponse } from "next/server";
import { pinata } from "@/utils/config";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { error: "Missing cid parameter" },
      { status: 400 }
    );
  }
  try {
    const res = await pinata.files.public.delete([id]);
    return NextResponse.json(res);
  } catch (e) {
    return NextResponse.json(
      { error: `Failed to fetch files: ${e}` },
      { status: 500 }
    );
  }
}
