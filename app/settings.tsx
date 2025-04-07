// pages/settings.tsx

import { useState } from "react";

export default function Settings() {
  const [darkMode, setDarkMode] = useState(false);
  const [username, setUsername] = useState("JohnDoe");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const saveSettings = () => {
    alert("Settings saved!");
    // Optionally send to backend
  };

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    // TODO: Send to backend API
    alert("Password changed!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className={min-h-screen p-6 ${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"}}>
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div className="space-y-6">
        {/* Profile Section */}
        <div>
          <label className="block text-sm font-medium">Username</label>
          <input
            type="text"
            className="mt-1 p-2 border rounded w-full"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        {/* Theme Toggle */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Dark Mode</label>
          <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} />
        </div>

        {/* Save Settings */}
        <button
          onClick={saveSettings}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Save Settings
        </button>

        {/* Password Change Section */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-2">Change Password</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Current Password</label>
              <input
                type="password"
                className="mt-1 p-2 border rounded w-full"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">New Password</label>
              <input
                type="password"
                className="mt-1 p-2 border rounded w-full"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Confirm New Password</label>
              <input
                type="password"
                className="mt-1 p-2 border rounded w-full"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              onClick={handlePasswordChange}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Update Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}