"use client";

import { useState } from "react";
import { User, Lock, Camera, Loader2, Save } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { userApi, authApi, fileToBase64, getErrorMessage } from "@/services/api";
import toast from "react-hot-toast";

export default function InstructorSettingsPage() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [title, setTitle] = useState(user?.title || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await userApi.updateProfile({ name, bio, title });
      updateUser(res.data.data.user);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setAvatarUploading(true);
    try {
      const base64File = await fileToBase64(file);
      const res = await userApi.updateAvatar({
        buffer: base64File.buffer,
        mimetype: base64File.mimetype,
        originalname: base64File.originalname,
      });
      const updatedUser = { ...user!, avatar: res.data.data.avatar };
      updateUser(updatedUser);
      toast.success("Avatar updated");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPassword(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      toast.success("Password changed");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage your instructor profile and account.</p>
      </div>

      <div className="card p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
          <User size={20} /> Profile
        </h2>
        <div className="mb-6 flex items-center gap-4">
          <div className="relative">
            {user?.avatar?.url ? (
              <img src={user.avatar.url} alt={user.name} className="h-20 w-20 rounded-full object-cover" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-600 text-2xl font-semibold text-white">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-brand-600 text-white shadow-lg hover:bg-brand-700">
              {avatarUploading ? <Loader2 className="animate-spin" size={14} /> : <Camera size={14} />}
            </label>
            <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-100">{user?.name}</p>
            <p className="text-sm text-slate-500">Click the camera icon to change your photo</p>
          </div>
        </div>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label-field">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="label-field">Professional Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Senior Full-Stack Developer" className="input-field" />
            </div>
          </div>
          <div>
            <label className="label-field">Bio</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="Tell students about your expertise..." className="input-field resize-y" />
          </div>
          <button type="submit" disabled={savingProfile} className="btn-primary">
            {savingProfile ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Save Changes
          </button>
        </form>
      </div>

      <div className="card p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
          <Lock size={20} /> Change Password
        </h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="label-field">Current Password</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="input-field" required />
          </div>
          <div>
            <label className="label-field">New Password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input-field" required minLength={6} />
          </div>
          <button type="submit" disabled={savingPassword} className="btn-primary">
            {savingPassword ? <Loader2 className="animate-spin" size={16} /> : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
