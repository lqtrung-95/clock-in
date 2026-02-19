"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoginBanner, LoginPrompt } from "@/components/auth/login-prompt";
import { toast } from "sonner";
import { Moon, Sun, Monitor, Settings2, Bell, Timer, Palette, User, Camera } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuthState } from "@/hooks/use-auth-state";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const GUEST_PREFS_KEY = "clockin-guest-preferences";

interface Preferences {
  email_digest_enabled: boolean;
  pomodoro_preset: "25/5" | "50/10" | "90/20" | "custom";
}

const defaultPrefs: Preferences = {
  email_digest_enabled: true,
  pomodoro_preset: "25/5",
};

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, isLoading: authLoading } = useAuthState();
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<Preferences>(defaultPrefs);
  const [saving, setSaving] = useState(false);

  // Profile state
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  // Avatar options
  const avatarOptions = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Zack",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Bella",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Leo",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Molly",
  ];

  async function loadPreferences() {
    if (isAuthenticated) {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("user_preferences")
          .select("email_digest_enabled, pomodoro_preset")
          .eq("user_id", user.id)
          .single();
        if (data) {
          const prefs = data as { email_digest_enabled?: boolean; pomodoro_preset?: Preferences["pomodoro_preset"] };
          setPreferences({
            email_digest_enabled: prefs.email_digest_enabled ?? true,
            pomodoro_preset: prefs.pomodoro_preset ?? "25/5",
          });
        }
        // Load profile
        setDisplayName(user.user_metadata?.display_name || "");
        setAvatarUrl(user.user_metadata?.avatar_url || "");
      }
    } else {
      // Load from localStorage for guests
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem(GUEST_PREFS_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setPreferences({ ...defaultPrefs, ...parsed });
          } catch {
            // ignore parse error
          }
        }
        const guestProfile = localStorage.getItem("clockin-guest-profile");
        if (guestProfile) {
          try {
            const parsed = JSON.parse(guestProfile);
            setDisplayName(parsed.display_name || "");
            setAvatarUrl(parsed.avatar_url || "");
          } catch {
            // ignore
          }
        }
      }
    }
    setLoading(false);
    setProfileLoading(false);
  }

  useEffect(() => {
    if (!authLoading) {
      loadPreferences();
    }
  }, [authLoading, isAuthenticated]);

  async function savePreferences() {
    setSaving(true);
    if (isAuthenticated) {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSaving(false);
        return;
      }
      const { error } = await supabase
        .from("user_preferences")
        .update({
          email_digest_enabled: preferences.email_digest_enabled,
          pomodoro_preset: preferences.pomodoro_preset,
        } as never)
        .eq("user_id", user.id);
      if (error) {
        toast.error("Failed to save");
      } else {
        toast.success("Settings saved");
      }
    } else {
      // Save to localStorage for guests
      if (typeof window !== "undefined") {
        localStorage.setItem(GUEST_PREFS_KEY, JSON.stringify(preferences));
        toast.success("Settings saved locally");
      }
    }
    setSaving(false);
  }

  async function saveProfile() {
    setSavingProfile(true);
    if (isAuthenticated) {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSavingProfile(false);
        return;
      }

      // Update auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          display_name: displayName.trim(),
          avatar_url: avatarUrl,
        },
      });

      // Update profiles table for social features
      // Check if profile exists first
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      const profileData = {
        id: user.id,
        user_id: user.id,
        display_name: displayName.trim(),
        avatar_url: avatarUrl,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        updated_at: new Date().toISOString(),
      };

      let profileError;
      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from("profiles")
          .update(profileData)
          .eq("id", user.id);
        profileError = error;
      } else {
        // Insert new profile with created_at
        const { error } = await supabase
          .from("profiles")
          .insert({
            ...profileData,
            created_at: new Date().toISOString(),
          } as never);
        profileError = error;
      }

      if (authError || profileError) {
        toast.error(authError?.message || profileError?.message || "Failed to update");
      } else {
        toast.success("Profile updated");
      }
    } else {
      // Save to localStorage for guests
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "clockin-guest-profile",
          JSON.stringify({ display_name: displayName.trim(), avatar_url: avatarUrl })
        );
        toast.success("Profile saved locally");
      }
    }
    setSavingProfile(false);
  }

  if (loading || authLoading || profileLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 lg:p-10">
      <div className="mx-auto max-w-2xl space-y-6">
        {!isAuthenticated && <LoginBanner feature="sync" />}

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/25">
            <Settings2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground">Customize your experience</p>
          </div>
        </div>

        <Card className="border border-border bg-card p-6 space-y-8">
          {/* Profile */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-cyan-400" />
              <h2 className="text-lg font-semibold text-foreground">Profile</h2>
            </div>
            <div className="space-y-4">
              {/* Avatar Selection */}
              <div className="space-y-2">
                <Label className="text-foreground">Avatar</Label>
                <div className="flex gap-2 flex-wrap">
                  {avatarOptions.map((url) => (
                    <button
                      key={url}
                      onClick={() => setAvatarUrl(url)}
                      className={`relative rounded-full p-1 transition-all ${
                        avatarUrl === url
                          ? "ring-2 ring-blue-500 ring-offset-2"
                          : "hover:opacity-80"
                      }`}
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={url} alt="Avatar option" />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                          <Camera className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  ))}
                </div>
              </div>
              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-foreground">
                  Display Name
                </Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your name"
                  maxLength={30}
                  className="border-border bg-card"
                />
              </div>
              {/* Save Profile Button */}
              <Button
                onClick={saveProfile}
                disabled={savingProfile || !displayName.trim()}
                variant="outline"
                className="w-full"
              >
                {savingProfile ? "Saving..." : "Update Profile"}
              </Button>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* Appearance */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-cyan-400" />
              <h2 className="text-lg font-semibold text-foreground">Appearance</h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Theme</Label>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred theme
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("light")}
                  className={theme === "light"
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-foreground"
                    : "border-border bg-card text-foreground/80 hover:bg-secondary hover:text-foreground"
                  }
                >
                  <Sun className="mr-2 h-4 w-4" />
                  Light
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("dark")}
                  className={theme === "dark"
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-foreground"
                    : "border-border bg-card text-foreground/80 hover:bg-secondary hover:text-foreground"
                  }
                >
                  <Moon className="mr-2 h-4 w-4" />
                  Dark
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("system")}
                  className={theme === "system"
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-foreground"
                    : "border-border bg-card text-foreground/80 hover:bg-secondary hover:text-foreground"
                  }
                >
                  <Monitor className="mr-2 h-4 w-4" />
                  Auto
                </Button>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* Pomodoro */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-cyan-400" />
              <h2 className="text-lg font-semibold text-foreground">Pomodoro</h2>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Default Preset</Label>
              <Select
                value={preferences.pomodoro_preset}
                onValueChange={(v) =>
                  setPreferences((p) => ({ ...p, pomodoro_preset: v as typeof p.pomodoro_preset }))
                }
              >
                <SelectTrigger className="border-border bg-card text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border border-border bg-card">
                  <SelectItem value="25/5" className="text-foreground">25m work / 5m break</SelectItem>
                  <SelectItem value="50/10" className="text-foreground">50m work / 10m break</SelectItem>
                  <SelectItem value="90/20" className="text-foreground">90m work / 20m break</SelectItem>
                  <SelectItem value="custom" className="text-foreground">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* Notifications */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-cyan-400" />
              <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
            </div>
            {isAuthenticated ? (
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-foreground">Weekly Digest</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive weekly summary emails
                  </p>
                </div>
                <Switch
                  checked={preferences.email_digest_enabled}
                  onCheckedChange={(v) =>
                    setPreferences((p) => ({ ...p, email_digest_enabled: v }))
                  }
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-cyan-500"
                />
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-white/[0.02] p-4">
                <p className="text-sm text-muted-foreground">
                  Sign in to configure email notifications and weekly digest settings.
                </p>
              </div>
            )}
          </div>

          {/* Save Button */}
          <Button
            onClick={savePreferences}
            disabled={saving}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
          >
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </Card>
      </div>
    </div>
  );
}
