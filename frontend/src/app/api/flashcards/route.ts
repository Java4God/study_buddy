import axios from "axios";
import { NextResponse } from "next/server";
import { getAuthorizedToken, refreshAccessToken } from "@/app/lib/auth";

const API_DOMAIN = process.env.API_DOMAIN ?? "";

function jsonError(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

export async function GET() {
  let accessToken = await getAuthorizedToken();
  if (!accessToken) return jsonError("Unauthorized", 401);

  try {
    let response = await axios.get(`${API_DOMAIN}flashcards`, {
      timeout: 10_000,
      validateStatus: () => true,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 401 || response.status === 403) {
      accessToken = await refreshAccessToken();
      if (!accessToken) return jsonError("Unauthorized", 401);
      response = await axios.get(`${API_DOMAIN}flashcards`, {
        timeout: 10_000,
        validateStatus: () => true,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
    }

    if (response.status < 200 || response.status >= 400) {
      return jsonError("External API error", response.status);
    }

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    return jsonError("Internal server error", 500);
  }
}

export async function POST(req: Request) {
  const payload = await req.json();
  let accessToken = await getAuthorizedToken();
  if (!accessToken) return jsonError("Unauthorized", 401);

  try {
    let response = await axios.post(`${API_DOMAIN}flashcards/new`, payload, {
      timeout: 10_000,
      validateStatus: () => true,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 401 || response.status === 403) {
      accessToken = await refreshAccessToken();
      if (!accessToken) return jsonError("Unauthorized", 401);
      response = await axios.post(`${API_DOMAIN}flashcards/new`, payload, {
        timeout: 10_000,
        validateStatus: () => true,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
    }

    if (response.status < 200 || response.status >= 400) {
      return jsonError("External API error", response.status);
    }

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    return jsonError("Internal server error", 500);
  }
}

export async function PUT(req: Request) {
  const { searchParams } = new URL(req.url);
  const flashcardId = searchParams.get("id");

  if (!flashcardId) return jsonError("Missing flashcard id", 400);

  const payload = await req.json();
  let accessToken = await getAuthorizedToken();
  if (!accessToken) return jsonError("Unauthorized", 401);

  try {
    let response = await axios.put(
      `${API_DOMAIN}flashcards/update/${flashcardId}`,
      payload,
      {
        timeout: 10_000,
        validateStatus: () => true,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (response.status === 401 || response.status === 403) {
      accessToken = await refreshAccessToken();
      if (!accessToken) return jsonError("Unauthorized", 401);
      response = await axios.put(
        `${API_DOMAIN}flashcards/update/${flashcardId}`,
        payload,
        {
          timeout: 10_000,
          validateStatus: () => true,
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );
    }

    if (response.status < 200 || response.status >= 400) {
      return jsonError("External API error", response.status);
    }

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    return jsonError("Internal server error", 500);
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const flashcardId = searchParams.get("id");

  if (!flashcardId) return jsonError("Missing flashcard id", 400);

  let accessToken = await getAuthorizedToken();
  if (!accessToken) return jsonError("Unauthorized", 401);

  try {
    let response = await axios.delete(
      `${API_DOMAIN}flashcards/delete/${flashcardId}`,
      {
        timeout: 10_000,
        validateStatus: () => true,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (response.status === 401 || response.status === 403) {
      accessToken = await refreshAccessToken();
      if (!accessToken) return jsonError("Unauthorized", 401);
      response = await axios.delete(
        `${API_DOMAIN}flashcards/delete/${flashcardId}`,
        {
          timeout: 10_000,
          validateStatus: () => true,
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );
    }

    if (response.status < 200 || response.status >= 400) {
      return jsonError("External API error", response.status);
    }

    return NextResponse.json(
      { message: "Deleted successfully" },
      { status: 204 },
    );
  } catch (error) {
    return jsonError("Internal server error", 500);
  }
}
