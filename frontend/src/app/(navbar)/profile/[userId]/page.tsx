"use client";

import { use, useEffect, useMemo, useState } from "react";
import {
  Badge,
  Users,
  Activity,
  Timer,
  Layers,
  Calendar,
  Trophy,
  Flame,
  Target,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/card";
import Button from "@/app/components/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/tabs";

type UserProfile = {
  uuid: string;
  username: string;
  email: string;
};

type Friend = {
  id: string;
  name: string;
  status: "online" | "offline";
  lastActivity: string;
};

type ActivityItem = {
  id: string;
  user: string;
  action: string;
  time: string;
  type: "study" | "achievement" | "social";
};

type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  earned: boolean;
};

type ProfilePageProps = {
  params: Promise<{ userId: string }>;
};

function getInitials(username: string, email: string) {
  const source = username.trim() || email.trim();
  const parts = source.split(/[\s._-]+/).filter(Boolean);

  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { userId } = use(params);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Placeholder data
  const friends: Friend[] = [
    {
      id: "1",
      name: "Sarah Chen",
      status: "online",
      lastActivity: "Studying Chemistry",
    },
    {
      id: "2",
      name: "Mike Brown",
      status: "online",
      lastActivity: "In Study Room",
    },
    {
      id: "3",
      name: "Emily Davis",
      status: "offline",
      lastActivity: "2 hours ago",
    },
    {
      id: "4",
      name: "John Smith",
      status: "offline",
      lastActivity: "Yesterday",
    },
  ];

  const activityFeed: ActivityItem[] = [
    {
      id: "1",
      user: "Sarah Chen",
      action: "completed 4 Pomodoro sessions",
      time: "2 hours ago",
      type: "study",
    },
    {
      id: "2",
      user: "Mike Brown",
      action: 'earned "Week Warrior" badge',
      time: "3 hours ago",
      type: "achievement",
    },
    {
      id: "3",
      user: "Emily Davis",
      action: "reviewed 50 flashcards",
      time: "5 hours ago",
      type: "study",
    },
    {
      id: "4",
      user: "User",
      action: 'joined "Calculus Study Group"',
      time: "Yesterday",
      type: "social",
    },
  ];

  const stats = {
    totalStudyHours: 142,
    totalPomodoros: 284,
    flashcardsReviewed: 1250,
    examsCompleted: 8,
    currentStreak: 7,
    longestStreak: 21,
  };

  const achievements: Achievement[] = [
    {
      id: "1",
      name: "First Timer",
      description: "Complete your first Pomodoro",
      icon: Timer,
      earned: true,
    },
    {
      id: "2",
      name: "Week Warrior",
      description: "7 day study streak",
      icon: Flame,
      earned: true,
    },
    {
      id: "3",
      name: "Flashcard Master",
      description: "Review 1000 flashcards",
      icon: Layers,
      earned: true,
    },
    {
      id: "4",
      name: "Month Marathon",
      description: "30 day study streak",
      icon: Target,
      earned: false,
    },
  ];

  useEffect(() => {
    if (!userId) return;

    const controller = new AbortController();

    async function fetchProfile() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/profile?id=${encodeURIComponent(userId)}`,
          {
            signal: controller.signal,
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message ?? "Could not load profile.");
        }

        setProfile({
          uuid: data.uuid ?? data.id ?? userId,
          username: data.username ?? "",
          email: data.email ?? "",
        });
      } catch (fetchError) {
        if ((fetchError as Error).name === "AbortError") return;
        setProfile(null);
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Could not load profile.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();

    return () => controller.abort();
  }, [userId]);

  const initials = useMemo(
    () => getInitials(profile?.username ?? "", profile?.email ?? ""),
    [profile?.username, profile?.email],
  );

  if (loading) {
    return (
      <div className="space-y-6 p-8 px-20 flex-1 bg-switch-background/20">
        <div>
          <h1 className="text-3xl mb-2">Profile</h1>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-8 px-20 flex-1 bg-switch-background/20">
        <div>
          <h1 className="text-3xl mb-2">Profile</h1>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-6 p-8 px-20 flex-1 bg-switch-background/20">
        <div>
          <h1 className="text-3xl mb-2">Profile</h1>
          <p className="text-gray-600">Profile not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8 px-20 flex-1 bg-switch-background/20">
      <div>
        <h1 className="text-3xl mb-2">Profile</h1>
        <p className="text-gray-600">Your stats, friends, and achievements</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-indigo-100 text-3xl font-semibold text-indigo-600">
              {initials}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl mb-1">{profile.username}</h2>
              <p className="text-gray-600 mb-3">{profile.email}</p>
              <div className="flex gap-2">
                <Badge className="gap-1">
                  <Flame className="size-3" />
                  {stats.currentStreak} day streak
                </Badge>
                <Badge className="gap-1">
                  <Trophy className="size-3" />
                  {achievements.filter((a) => a.earned).length} achievements
                </Badge>
              </div>
            </div>
            <Button variant="outline">Edit Profile</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Timer className="size-6 mx-auto mb-2 text-indigo-600" />
            <p className="text-2xl">{stats.totalPomodoros}</p>
            <p className="text-xs text-gray-600">Pomodoros</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Activity className="size-6 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl">{stats.totalStudyHours}h</p>
            <p className="text-xs text-gray-600">Study Time</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Layers className="size-6 mx-auto mb-2 text-purple-600" />
            <p className="text-2xl">{stats.flashcardsReviewed}</p>
            <p className="text-xs text-gray-600">Flashcards</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="size-6 mx-auto mb-2 text-green-600" />
            <p className="text-2xl">{stats.examsCompleted}</p>
            <p className="text-xs text-gray-600">Exams</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Flame className="size-6 mx-auto mb-2 text-orange-600" />
            <p className="text-2xl">{stats.currentStreak}</p>
            <p className="text-xs text-gray-600">Current Streak</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="size-6 mx-auto mb-2 text-red-600" />
            <p className="text-2xl">{stats.longestStreak}</p>
            <p className="text-xs text-gray-600">Best Streak</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="friends">
        <TabsList>
          <TabsTrigger value="friends" className="gap-2">
            <Users className="size-4" />
            Friends
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2">
            <Activity className="size-4" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="achievements" className="gap-2">
            <Trophy className="size-4" />
            Achievements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Friends ({friends.length})</CardTitle>
                <Button variant="outline">Add Friend</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {friends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-semibold text-sm">
                      {friend.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{friend.name}</p>
                        <div
                          className={`size-2 rounded-full ${
                            friend.status === "online"
                              ? "bg-green-500"
                              : "bg-gray-400"
                          }`}
                        />
                      </div>
                      <p className="text-sm text-gray-600">
                        {friend.lastActivity}
                      </p>
                    </div>
                    <Button variant="ghost">Message</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityFeed.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        activity.type === "study"
                          ? "bg-blue-100"
                          : activity.type === "achievement"
                            ? "bg-yellow-100"
                            : "bg-purple-100"
                      }`}
                    >
                      {activity.type === "study" && (
                        <Timer className="size-4 text-blue-600" />
                      )}
                      {activity.type === "achievement" && (
                        <Trophy className="size-4 text-yellow-600" />
                      )}
                      {activity.type === "social" && (
                        <Users className="size-4 text-purple-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span>{" "}
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-600">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => {
              const Icon = achievement.icon;
              return (
                <Card
                  key={achievement.id}
                  className={!achievement.earned ? "opacity-50" : ""}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-3 rounded-xl ${
                          achievement.earned ? "bg-yellow-100" : "bg-gray-100"
                        }`}
                      >
                        <Icon
                          className={`size-6 ${
                            achievement.earned
                              ? "text-yellow-600"
                              : "text-gray-400"
                          }`}
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">
                          {achievement.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
