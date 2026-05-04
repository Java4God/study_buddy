import { NextResponse } from "next/server";
import axios from "axios";
import { refreshAccessToken } from "@/app/lib/auth";

export async function POST() {
  try {
    const accessToken = await refreshAccessToken();
    if (!accessToken) {
      return NextResponse.json(
        { message: "Failed to refresh token" },
        { status: 401 },
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 500;
      const message =
        error.response?.data?.message ?? "Failed to refresh token";

      return NextResponse.json({ message }, { status });
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
