"use client";

import { useState } from "react";
import { authClient } from "@/engine/auth/auth-client";
import { Loader2, User, Lock, Trash2 } from "lucide-react";
import { useSession } from "@/engine/auth/auth-client";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { data: session } = useSession();
  const user = session?.user;

  const [name, setName] = useState(user?.name ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await authClient.updateUser({ name });
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setSavingPassword(true);
    try {
      await authClient.changePassword({ currentPassword, newPassword, revokeOtherSessions: true });
      toast.success("Password changed");
      setCurrentPassword("");
      setNewPassword("");
    } catch {
      toast.error("Failed to change password. Check your current password.");
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleDeleteAccount() {
    if (!window.confirm("Are you absolutely sure? We'll email you a link to confirm — your account isn't deleted until you click it.")) return;
    setDeletingAccount(true);
    try {
      const { error } = await authClient.deleteUser();
      if (error) toast.error(error.message ?? "Failed to start account deletion");
      else toast.success("Check your email to confirm account deletion.");
    } catch {
      toast.error("Failed to start account deletion. Please try again.");
    } finally {
      setDeletingAccount(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>Account Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your profile and security settings.</p>
      </div>

      <section className="mb-6 rounded-xl border border-border bg-card p-6">
        <div className="mb-5 flex items-center gap-3"><User className="h-5 w-5 text-primary" /><h2 className="font-semibold text-foreground">Profile</h2></div>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
            <input type="email" value={user?.email ?? ""} disabled className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm text-muted-foreground" />
            <p className="mt-1 text-xs text-muted-foreground">Email cannot be changed.</p>
          </div>
          <button type="submit" disabled={savingProfile} className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">
            {savingProfile && <Loader2 className="h-4 w-4 animate-spin" />} Save Changes
          </button>
        </form>
      </section>

      <section className="mb-6 rounded-xl border border-border bg-card p-6">
        <div className="mb-5 flex items-center gap-3"><Lock className="h-5 w-5 text-primary" /><h2 className="font-semibold text-foreground">Change Password</h2></div>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Current Password</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">New Password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <button type="submit" disabled={savingPassword} className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">
            {savingPassword && <Loader2 className="h-4 w-4 animate-spin" />} Update Password
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
        <div className="mb-4 flex items-center gap-3"><Trash2 className="h-5 w-5 text-destructive" /><h2 className="font-semibold text-destructive">Danger Zone</h2></div>
        <p className="mb-4 text-sm text-muted-foreground">Permanently delete your account and all associated data. We'll email you a confirmation link before anything is deleted.</p>
        <button onClick={handleDeleteAccount} disabled={deletingAccount} className="flex items-center gap-2 rounded-xl border border-destructive px-5 py-2.5 text-sm font-semibold text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground disabled:opacity-60">
          {deletingAccount && <Loader2 className="h-4 w-4 animate-spin" />} Delete Account
        </button>
      </section>
    </div>
  );
}
