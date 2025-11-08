"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function InvitePage({ params }: { params: { token: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invite, setInvite] = useState<any>(null);
  const [username, setUsername] = useState("");
  const [tempPass, setTempPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [stage, setStage] = useState<"verify" | "reset">("verify");

  // 1. Decode token and check expiry
  useEffect(() => {
    try {
      const decoded: any = JSON.parse(atob(params.token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp < now) throw new Error("Invite link has expired.");
      setInvite(decoded);
      setLoading(false);
    } catch (err: any) {
      setError("This invite link is invalid or has expired.");
      setLoading(false);
    }
  }, [params.token]);

  // 2. Handle initial login with temp credentials
  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const res = await fetch("/api/verify-invitation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: params.token,
        username,
        temp_password: tempPass,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setStage("reset");
    } else {
      setError(data.error || "Login failed. Check your credentials.");
    }
  }

  // 3. Force password reset
  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const res = await fetch("/api/complete-invitation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: params.token,
        username,
        new_password: newPass,
      }),
    });
    const data = await res.json();
    if (data.success) {
      router.push(data.redirect || `/${invite.role}`);
    } else {
      setError(data.error || "Could not update password.");
    }
  }

  if (loading)
    return <p className="p-8 text-center text-gray-600">Validating invite...</p>;
  if (error)
    return <p className="p-8 text-center text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-indigo-700">
          Mason Vector {invite.role.charAt(0).toUpperCase() + invite.role.slice(1)} Portal
        </h1>

        {stage === "verify" && (
          <form onSubmit={handleVerify}>
            <p className="text-sm text-gray-600 mb-4">
              Enter your username and temporary password.
            </p>
            <label className="block text-sm mb-1">Username</label>
            <input
              className="w-full border rounded-lg px-3 py-2 mb-3"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <label className="block text-sm mb-1">Temporary Password</label>
            <input
              type="password"
              className="w-full border rounded-lg px-3 py-2 mb-4"
              value={tempPass}
              onChange={(e) => setTempPass(e.target.value)}
              required
            />
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <button
              type="submit"
              className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg w-full"
            >
              Verify and Continue
            </button>
          </form>
        )}

        {stage === "reset" && (
          <form onSubmit={handleReset}>
            <p className="text-sm text-gray-600 mb-4">
              Choose a new password for your account.
            </p>
            <label className="block text-sm mb-1">New Password</label>
            <input
              type="password"
              className="w-full border rounded-lg px-3 py-2 mb-4"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              required
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg w-full"
            >
              Save and Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}