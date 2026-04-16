"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/card";
import Input from "@/app/components/input";
import axios from "axios";
import { BookOpen } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/api/auth/login", {
        username,
        password,
      });
      router.push("/dashboard");
    } catch (error) {
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full items-center justify-center dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4 bg-switch-background/20">
      <Card className="w-full max-w-md border rounded-xl pt-6 bg-background">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-2xl">
              <BookOpen className="size-8 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome to StudyBuddy</CardTitle>
          <CardDescription>
            Sign in to continue your learning journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={"Username"}
              setValue={(value) => {
                setUsername(value);
              }}
              placeholder="your.username"
              value={username}
              type="text"
            />
            <Input
              label={"Password"}
              setValue={(value) => {
                setPassword(value);
                setError("");
              }}
              placeholder="••••••••••"
              value={password}
              type="password"
              error={error}
            />
            <button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
          <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Dont have an account?{" "}
            <Link
              href="/register"
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
