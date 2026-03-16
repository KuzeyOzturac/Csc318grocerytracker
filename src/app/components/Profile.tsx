import React, { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, X, Lock } from "lucide-react";
import { motion } from "motion/react";
import { useApp } from "../context/AppContext";
import { toast } from "sonner";

export const Profile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useApp();
  const [formData, setFormData] = useState({
    displayName: user.name,
    email: "jacob@gmail.com",
    password: "",
    confirmPassword: "",
  });

  const handleSignOut = () => {
    toast.success("Signed out successfully");
    navigate("/auth");
  };

  const handleDeleteAccount = () => {
    if (
      confirm(
        "Are you sure you want to delete your account? This action is irreversible!",
      )
    ) {
      toast.success("Account deleted");
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            <div className="p-2 border border-gray-300 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="font-medium">Back</span>
          </button>
          <h1
            className="text-3xl text-gray-900"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Bounty Biter
          </h1>
          <div className="w-12 h-12"></div>
        </div>
      </div>

      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl border-2 border-gray-200 p-8 mb-6">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-orange-400 flex items-center justify-center text-white font-bold text-3xl shadow-lg">
              {user.initials}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {user.name} <Lock className="inline w-5 h-5 text-gray-600" />
              </h2>
              <p className="text-gray-600">{user.username}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <label className="text-sm text-gray-600 mb-1 block">
                Display Name
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) =>
                  setFormData({ ...formData, displayName: e.target.value })
                }
                className="w-full px-4 py-3 bg-green-100 rounded-lg border-2 border-transparent focus:border-green-300 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setFormData({ ...formData, displayName: "" })}
                className="absolute right-3 top-9 p-1 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="relative">
              <label className="text-sm text-gray-600 mb-1 block">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 bg-green-100 rounded-lg border-2 border-transparent focus:border-green-300 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setFormData({ ...formData, email: "" })}
                className="absolute right-3 top-9 p-1 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="relative">
              <label className="text-sm text-gray-600 mb-1 block">
                Change Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-3 bg-green-100 rounded-lg border-2 border-transparent focus:border-green-300 outline-none transition-all"
                placeholder="New password"
              />
              <button
                type="button"
                onClick={() => setFormData({ ...formData, password: "" })}
                className="absolute right-3 top-9 p-1 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="relative">
              <label className="text-sm text-gray-600 mb-1 block">
                Confirm New Password
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className="w-full px-4 py-3 bg-green-100 rounded-lg border-2 border-transparent focus:border-green-300 outline-none transition-all"
                placeholder="Confirm password"
              />
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, confirmPassword: "" })
                }
                className="absolute right-3 top-9 p-1 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={handleSignOut}
              className="flex-1 py-3 border-2 border-red-300 text-red-600 rounded-full font-medium hover:bg-red-50 transition-colors"
            >
              Sign Out
            </button>
            <button
              onClick={handleDeleteAccount}
              className="flex-1 py-3 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 transition-colors"
            >
              Delete Account
            </button>
          </div>

          <p className="text-sm text-gray-600 text-center mt-4">
            <strong>WARNING:</strong> This action is irreversible!
          </p>
        </div>
      </div>
    </div>
  );
};
