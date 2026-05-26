"use client";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/card";
import { useRouter } from "next/navigation";
import Input from "@/app/components/input";
import Link from "next/link";
import axios from "axios";
import { Pages, Api } from "@/app/routes";
import {
  validateEmail,
  validatePassword,
  validateUsername,
} from "@/app/functions";
import { BookOpen } from "lucide-react";
import Button from "@/app/components/button";

function getPasswordStrength(password: string): {
  label: string;
  color: string;
  bgColor: string;
  width: string;
} {
  if (password.length === 0)
    return { label: "", color: "", bgColor: "", width: "0%" };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2)
    return {
      label: "Weak",
      color: "text-red-500",
      bgColor: "bg-red-500",
      width: "33%",
    };
  if (score <= 3)
    return {
      label: "Medium",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500",
      width: "66%",
    };
  return {
    label: "Strong",
    color: "text-green-500",
    bgColor: "bg-green-500",
    width: "100%",
  };
}

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState<string | undefined>("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | undefined>("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [repeatPasswordError, setRepeatPasswordError] = useState<
    string | undefined
  >("");
  const [formError, setFormError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const strength = getPasswordStrength(password);

  const checkInputErrors = () => {
    let isWrong = false;
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const usernameError = validateUsername(username);
    setUsernameError(usernameError);
    setEmailError(emailError);
    setPasswordError(passwordError);
    if (!passwordError && password !== repeatPassword) {
      setRepeatPasswordError("Password's don't match");
      isWrong = true;
    } else {
      setRepeatPasswordError(undefined);
    }
    if (
      emailError ||
      passwordError ||
      usernameError ||
      password !== repeatPassword
    ) {
      isWrong = true;
    }
    return isWrong;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(undefined);

    const isWrong = checkInputErrors();
    if (isWrong) {
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${Api.AUTH}/register`, { username, email, password });
      router.push(Pages.DASHBOARD);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message =
          (error.response?.data as { message?: string })?.message ??
          "Registration failed";

        if (status === 403) {
          setEmailError("Email is already in use.");
          setFormError(undefined);
        } else {
          setFormError(message);
        }
      } else {
        setFormError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-switch-background/20 p-4">
      <Card className="w-full max-w-md border rounded-xl pt-6 bg-background">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-indigo-100 rounded-2xl">
              <BookOpen className="size-8 text-indigo-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>
            Join StudyBuddy and boost your productivity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username"
              placeholder="alex.johnson"
              type="text"
              value={username}
              setValue={(value) => setUsername(value)}
              required
              error={usernameError}
            />
            <Input
              label="Email"
              placeholder="alex.johnson@mail.com"
              type="email"
              value={email}
              setValue={(value) => setEmail(value)}
              required
              error={emailError}
            />
            <Input
              label="Password"
              placeholder="••••••••"
              type="password"
              value={password}
              setValue={(value) => setPassword(value)}
              required
              error={passwordError}
              testId="password-input"
            />
            {password.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${strength.bgColor}`}
                    style={{ width: strength.width }}
                  />
                </div>
                <p className={`text-xs ${strength.color}`}>
                  Password strength:{" "}
                  <span className="font-medium">{strength.label}</span>
                </p>
              </div>
            )}
            <Input
              label="Repeat password"
              placeholder="••••••••"
              type="password"
              value={repeatPassword}
              setValue={(value) => setRepeatPassword(value)}
              required
              error={repeatPasswordError}
              testId="repeat-password-input"
            />
            <div className="flex">
              <Button type="submit" className="mx-auto" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </div>
            {formError ? (
              <p className="text-sm text-red-600 mt-2">{formError}</p>
            ) : null}
          </form>
          <div className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-600 hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;
