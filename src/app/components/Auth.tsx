import React, { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { X } from "lucide-react";

const foodIcons = [
  "🥚", "🍞", "🥖", "🥐", "🥯", "🧇", "🥞", "🧈", "🍖", "🍗", "🥩", "🥓",
  "🌭", "🍔", "🍟", "🍕", "🌮", "🌯", "🥙", "🥗", "🥘", "🍝", "🍜", "🍲",
  "🍛", "🍣", "🍱", "🥟", "🍤", "🍙", "🍚", "🍥", "🥮", "🍢", "🍡", "🍧",
  "🍨", "🍦", "🥧", "🧁", "🍰", "🎂", "🍮", "🍭", "🍬", "🍫", "🍿", "🍩",
  "🍪", "🌰", "🥜", "🍯", "🥛", "🍼", "☕", "🍵", "🧃", "🥤", "🍶", "🍺",
  "🍻", "🥂", "🍷", "🥃", "🍸", "🍹", "🧉", "🍾", "🧊", "🥄", "🍴", "🍽️",
  "🥣", "🥡", "🥢", "🧂", "🥝", "🍇", "🍈", "🍉", "🍊", "🍋", "🍌", "🍍",
  "🥭", "🍎", "🍏", "🍐", "🍑", "🍒", "🍓", "🫐", "🥑", "🍅", "🥥", "🥦",
  "🥬", "🥒", "🌶️", "🫑", "🌽", "🥕", "🥗", "🧄", "🧅", "🥔", "🍠", "🥐"
];

export const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    displayName: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white relative overflow-hidden">
      {/* Food Icon Pattern Background */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="grid grid-cols-12 gap-4 p-8">
          {foodIcons.map((icon, i) => (
            <div
              key={i}
              className="text-2xl text-gray-600 animate-pulse"
              style={{
                animationDelay: `${i * 0.1}s`,
                animationDuration: "3s",
              }}
            >
              {icon}
            </div>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8 relative z-10"
      >
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-serif text-gray-900" style={{ fontFamily: 'var(--font-serif)' }}>
            Bounty Biter
          </h1>
          {!isLogin && (
            <p className="text-gray-700 text-lg italic">Ready to join the grocery odyssey?</p>
          )}
        </div>

        <div className="bg-white rounded-3xl border-2 border-gray-200 p-8 space-y-6">
          {isLogin ? (
            <>
              <h2 className="text-xl text-gray-900">Have an existing account?</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <label className="text-sm text-gray-600 mb-1 block">Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-3 bg-green-100 rounded-lg border-2 border-transparent focus:border-green-300 outline-none transition-all"
                    placeholder="Input"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, username: "" })}
                    className="absolute right-3 top-9 p-1 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                <div className="relative">
                  <label className="text-sm text-gray-600 mb-1 block">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 bg-green-100 rounded-lg border-2 border-transparent focus:border-green-300 outline-none transition-all"
                    placeholder="Input"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, password: "" })}
                    className="absolute right-3 top-9 p-1 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all shadow-md"
                >
                  Log In
                </button>
              </form>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Don't have an existing account?{" "}
                  <button
                    onClick={() => setIsLogin(false)}
                    className="text-green-600 font-medium hover:underline"
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            </>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <label className="text-sm text-gray-600 mb-1 block">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-green-100 rounded-lg border-2 border-transparent focus:border-green-300 outline-none transition-all"
                    placeholder="input@email.com"
                    required
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
                  <label className="text-sm text-gray-600 mb-1 block">Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-3 bg-green-100 rounded-lg border-2 border-transparent focus:border-green-300 outline-none transition-all"
                    placeholder="@input"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, username: "" })}
                    className="absolute right-3 top-9 p-1 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                <div className="relative">
                  <label className="text-sm text-gray-600 mb-1 block">Display Name</label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full px-4 py-3 bg-green-100 rounded-lg border-2 border-transparent focus:border-green-300 outline-none transition-all"
                    placeholder="Input"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, displayName: "" })}
                    className="absolute right-3 top-9 p-1 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                  <p className="text-xs text-gray-500 mt-1">You can change this later</p>
                </div>

                <div className="relative">
                  <label className="text-sm text-gray-600 mb-1 block">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 bg-green-100 rounded-lg border-2 border-transparent focus:border-green-300 outline-none transition-all"
                    placeholder="Input"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, password: "" })}
                    className="absolute right-3 top-9 p-1 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                  <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all shadow-md"
                >
                  Join!
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};
