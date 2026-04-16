import { NextResponse } from "next/server";
import axios from "axios";

const API_DOMAIN = process.env.API_DOMAIN ?? "";
const EXAMS = "exams";

function jsonError(message: string, status = 500) {
  return NextResponse.json({ message }, { status });
}

export async function GET() {
  try {
    const response = await axios.get(`${API_DOMAIN}${EXAMS}`, {
      timeout: 10_000,
    });

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 500;
      const message = error.response?.data?.message ?? "External API error";
      return jsonError(message, status);
    }

    return jsonError("Internal server error");
  }
}

export async function POST(req: Request) {
  const payload = await req.json();

  try {
    const response = await axios.post(`${API_DOMAIN}${EXAMS}`, payload, {
      headers: { "Content-Type": "application/json" },
      timeout: 10_000,
    });

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 500;
      const message = error.response?.data?.message ?? "External API error";
      return jsonError(message, status);
    }

    return jsonError("Internal server error");
  }
}

export async function PUT(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return jsonError("Missing exam id", 400);
  }

  const payload = await req.json();

  try {
    const response = await axios.put(`${API_DOMAIN}${EXAMS}/${id}`, payload, {
      headers: { "Content-Type": "application/json" },
      timeout: 10_000,
    });

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 500;
      const message = error.response?.data?.message ?? "External API error";
      return jsonError(message, status);
    }

    return jsonError("Internal server error");
  }
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return jsonError("Missing exam id", 400);
  }

  try {
    const response = await axios.delete(`${API_DOMAIN}${EXAMS}/${id}`, {
      timeout: 10_000,
    });

    return NextResponse.json({ status: response.status });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 500;
      const message = error.response?.data?.message ?? "External API error";
      return jsonError(message, status);
    }

    return jsonError("Internal server error");
  }
}
