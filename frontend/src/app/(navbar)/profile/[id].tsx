"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  ShieldCheck,
  UserRound,
  Mail,
  KeyRound,
  CircleAlert,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/card";
import Button from "@/app/components/button";
import Input from "@/app/components/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/dialogs";

interface ProfileContentProps {
  profileId: string;
}

interface ProfileResponse {
  id: string;
  username: string;
  email: string | null;
  isOwnProfile: boolean;
}

export default function ProfileContent({ profileId }: ProfileContentProps) {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [sendingReset, setSendingReset] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      setLoading(true);
      setError("");

      try {
        const { data } = await axios.get<ProfileResponse>(
          `/api/profile?id=${encodeURIComponent(profileId)}`,
          { timeout: 10_000 },
        );

        if (!isMounted) {
          return;
        }

        setProfile(data);
        if (data.email) {
          setResetEmail(data.email);
        }
      } catch (err) {
        if (!isMounted) {
          return;
        }

        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message ?? "Could not load profile.");
        } else {
          setError("Could not load profile.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [profileId]);

  const sendResetLink = async () => {
    setResetMessage("");
    setResetError("");

    if (!resetEmail.trim()) {
      setResetError("Email is required.");
      return;
    }

    setSendingReset(true);

    try {
      const { data } = await axios.post(
        "/api/profile",
        { email: resetEmail.trim() },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 10_000,
        },
      );

      setResetMessage(
        data?.message ??
          "Password reset link has been sent to your email if the account exists.",
      );
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setResetError(
          err.response?.data?.message ?? "Failed to send password reset email.",
        );
      } else {
        setResetError("Failed to send password reset email.");
      }
    } finally {
      setSendingReset(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-3xl mx-auto px-6 py-10">
        <p className="text-slate-500">Loading profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="w-full max-w-3xl mx-auto px-6 py-10">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-red-600">
              <CircleAlert className="size-5" />
              <p>{error || "Profile was not found."}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Profile</h1>
        <p className="text-sm text-slate-500 mt-1">
          {profile.isOwnProfile
            ? "Manage your account details and security settings."
            : "Viewing a public profile overview."}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserRound className="size-5 text-indigo-600" />
            User Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6 pt-0">
          <div className="rounded-lg border border-slate-200 p-4 bg-slate-50/80">
            <p className="text-xs text-slate-500 mb-1">Username</p>
            <p className="text-base text-slate-900 font-medium">
              {profile.username}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 p-4 bg-slate-50/80">
            <p className="text-xs text-slate-500 mb-1">Profile ID</p>
            <p className="text-base text-slate-900 break-all">{profile.id}</p>
          </div>

          <div className="rounded-lg border border-slate-200 p-4 bg-slate-50/80">
            <p className="text-xs text-slate-500 mb-1 flex items-center gap-2">
              <Mail className="size-4" />
              Email
            </p>
            <p className="text-base text-slate-900">
              {profile.isOwnProfile
                ? (profile.email ?? "No email available")
                : "Hidden for privacy"}
            </p>
          </div>
        </CardContent>
      </Card>

      {profile.isOwnProfile ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-emerald-600" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setResetError("");
                    setResetMessage("");
                  }}
                  variant="secondary"
                >
                  <KeyRound className="size-4" />
                  Reset Password
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reset Password</DialogTitle>
                  <DialogDescription>
                    Enter your email and we will send a password reset link.
                  </DialogDescription>
                </DialogHeader>

                <Input
                  type="email"
                  label="Email"
                  placeholder="you@example.com"
                  value={resetEmail}
                  setValue={setResetEmail}
                  error={resetError || undefined}
                />

                {resetMessage ? (
                  <p className="text-sm text-emerald-600">{resetMessage}</p>
                ) : null}

                <DialogFooter>
                  <Button
                    variant="primary"
                    onClick={() => {
                      void sendResetLink();
                    }}
                    disabled={sendingReset}
                  >
                    {sendingReset ? "Sending..." : "Send Reset Link"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
