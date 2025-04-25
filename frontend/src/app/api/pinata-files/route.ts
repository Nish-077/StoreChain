import { NextResponse } from "next/server";
import { pinata } from "@/utils/config";

export async function GET() {
  try {
    const res = await pinata.files.public.list();
    return NextResponse.json(res);
  } catch (e) {
    return NextResponse.json(
      { error: `Failed to fetch files: ${e}` },
      { status: 500 }
    );
  }
}
