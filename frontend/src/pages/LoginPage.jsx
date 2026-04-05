import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [needsAdminPassword, setNeedsAdminPassword] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(name, mobile, adminPassword);
      navigate("/dashboard");
    } catch (err) {
      const code = err?.response?.data?.code;
      if (code === "ADMIN_PASSWORD_REQUIRED") {
        setNeedsAdminPassword(true);
        setError("Admin mobile detected. Please enter admin password.");
        return;
      }
      setError(err?.response?.data?.error || "Login failed");
    }
  };

  return (
    <Layout>
      <form onSubmit={submit} className="mx-auto max-w-md rounded-xl bg-white p-4 shadow">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Login</h2>
        <input className="mb-2 w-full rounded border border-gray-300 p-2 text-gray-900 placeholder-gray-500" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input className="mb-2 w-full rounded border border-gray-300 p-2 text-gray-900 placeholder-gray-500" placeholder="Mobile (10 digits)" value={mobile} onChange={(e) => setMobile(e.target.value)} required />
        {needsAdminPassword && (
          <input
            className="mb-2 w-full rounded border border-gray-300 p-2 text-gray-900 placeholder-gray-500"
            type="password"
            placeholder="Admin password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            required
          />
        )}
        {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
        <button className="w-full rounded bg-amber-700 p-2 text-white font-semibold hover:bg-amber-800">Continue</button>
      </form>
    </Layout>
  );
}
