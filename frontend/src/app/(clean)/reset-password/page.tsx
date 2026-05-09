"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Button from "@/app/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/card";
import Input from "@/app/components/input";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError("");
    setSuccessMessage("");

    let hasError = false;

    if (!token) {
      setFormError("Reset token is missing or invalid.");
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      hasError = true;
    } else {
      setPasswordError("");
    }

    if (confirmPassword !== newPassword) {
      setConfirmError("Passwords do not match.");
      hasError = true;
    } else {
      setConfirmError("");
    }

    if (hasError) return;

    setLoading(true);

    try {
      const response = await fetch("/api/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message ?? "Could not reset password.");
      }

      setSuccessMessage(
        data?.message ?? "Password reset successful. You can now sign in.",
      );
      setNewPassword("");
      setConfirmPassword("");
    } catch (resetError) {
      setFormError(
        resetError instanceof Error
          ? resetError.message
          : "Could not reset password.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full items-center justify-center p-4 bg-switch-background/20">
      <Card className="w-full max-w-md border rounded-xl pt-6 bg-background">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Reset your password</CardTitle>
          <CardDescription>
            Choose a new password to continue using StudyBuddy.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {formError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {formError}
            </div>
          )}

          {successMessage && (
            <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <Input
              label={"New password"}
              setValue={(value) => {
                setNewPassword(value);
                setPasswordError("");
                setFormError("");
              }}
              placeholder="••••••••"
              value={newPassword}
              type="password"
              error={passwordError}
              disabled={loading}
            />
            <Input
              label={"Confirm password"}
              setValue={(value) => {
                setConfirmPassword(value);
                setConfirmError("");
                setFormError("");
              }}
              placeholder="••••••••"
              value={confirmPassword}
              type="password"
              error={confirmError}
              disabled={loading}
            />
            <div className="flex">
              <Button type="submit" disabled={loading} className="mx-auto">
                {loading ? "Updating..." : "Update password"}
              </Button>
            </div>
          </form>

          <div className="mt-4 text-center text-sm text-gray-600">
            Remembered your password?{" "}
            <Link href="/login" className="text-indigo-600 hover:underline">
              Back to login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
