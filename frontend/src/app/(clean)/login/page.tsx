"use client";
import Button from "@/app/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/card";
import Input from "@/app/components/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/dialogs";
import axios from "axios";
import { Pages, Api } from "@/app/routes";
import { BookOpen } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetMessage, setResetMessage] = useState("");
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
      await axios.post(`${Api.AUTH}/login`, {
        username,
        password,
      });
      router.push(Pages.DASHBOARD);
    } catch (error) {
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  const handleResetDialogChange = (open: boolean) => {
    setResetDialogOpen(open);
    if (open) {
      setResetEmail("");
      setResetError("");
      setResetMessage("");
    }
  };

  const handleSendResetEmail = async () => {
    if (!resetEmail.trim()) {
      setResetError("Email is required.");
      return;
    }

    setResetLoading(true);
    setResetError("");
    setResetMessage("");

    try {
      const response = await fetch(`${Api.PASSWORD_RESET}/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message ?? "Could not send reset email.");
      }

      setResetMessage(
        data?.message ?? "If the account exists, a reset email has been sent.",
      );
    } catch (sendError) {
      setResetError(
        sendError instanceof Error
          ? sendError.message
          : "Could not send reset email.",
      );
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full items-center justify-center p-4 bg-switch-background/20">
      <Card className="w-full max-w-md border rounded-xl pt-6 bg-background">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-indigo-100 rounded-2xl">
              <BookOpen className="size-8 text-indigo-600" />
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
            <div className="flex ">
              <Button type="submit" disabled={loading} className="mx-auto">
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </div>
          </form>
          <div className="mt-3 text-center">
            <Dialog
              open={resetDialogOpen}
              onOpenChange={handleResetDialogChange}
            >
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="text-sm text-indigo-600 hover:underline"
                >
                  Forgot password?
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reset your password</DialogTitle>
                  <DialogDescription>
                    Enter your account email and we will send a reset link.
                  </DialogDescription>
                </DialogHeader>

                <Input
                  label={"Email"}
                  setValue={(value) => {
                    setResetEmail(value);
                    setResetError("");
                  }}
                  placeholder="you@example.com"
                  value={resetEmail}
                  type="email"
                  error={resetError}
                />

                {resetMessage && (
                  <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                    {resetMessage}
                  </div>
                )}

                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" disabled={resetLoading}>
                      Close
                    </Button>
                  </DialogClose>
                  <Button
                    onClick={handleSendResetEmail}
                    disabled={resetLoading}
                  >
                    {resetLoading ? "Sending..." : "Send reset email"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="mt-4 text-center text-sm text-gray-600">
            Dont have an account?{" "}
            <Link
              href={Pages.REGISTER}
              className="text-indigo-600 hover:underline"
            >
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
