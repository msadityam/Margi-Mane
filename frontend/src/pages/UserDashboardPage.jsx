import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

export default function UserDashboardPage() {
  const { user, setUser } = useAuth();
  const [amount, setAmount] = useState("");
  const [upiRefId, setUpiRefId] = useState("");
  const [payments, setPayments] = useState([]);
  const [history, setHistory] = useState([]);

  const load = () => {
    api.get("/payments/my").then((res) => setPayments(res.data));
    api.get("/points/me").then((res) => {
      setHistory(res.data.history);
      setUser((prev) => ({ ...prev, pointsBalance: res.data.pointsBalance }));
    });
  };

  useEffect(() => { load(); }, []);

  const submitPayment = async (e) => {
    e.preventDefault();
    await api.post("/payments", { amount: Number(amount), upiRefId });
    setAmount("");
    setUpiRefId("");
    load();
  };

  return (
    <Layout>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-xl bg-white p-4 shadow">
          <h2 className="text-lg font-semibold text-gray-900">My Points</h2>
          <p className="mt-2 text-3xl font-bold text-amber-700">{user?.pointsBalance || 0}</p>
        </section>
        <section className="rounded-xl bg-white p-4 shadow">
          <h2 className="mb-2 text-lg font-semibold text-gray-900">Submit Payment</h2>
          <form onSubmit={submitPayment}>
            <input className="mb-2 w-full rounded border border-gray-300 p-2 text-gray-900" type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            <input className="mb-2 w-full rounded border border-gray-300 p-2 text-gray-900" placeholder="UPI Ref (optional)" value={upiRefId} onChange={(e) => setUpiRefId(e.target.value)} />
            <button className="w-full rounded bg-amber-700 p-2 text-white font-semibold hover:bg-amber-800">Submit</button>
          </form>
        </section>
      </div>
      <section className="mt-4 rounded-xl bg-white p-4 shadow">
        <h2 className="mb-2 text-lg font-semibold text-gray-900">Payment History</h2>
        {payments.map((p) => (
          <div key={p.id} className="flex justify-between border-b border-gray-200 py-1 text-sm text-gray-700">
            <span className="font-medium">Rs {p.amount}</span><span className="text-amber-700 font-semibold">{p.status}</span>
          </div>
        ))}
      </section>
      <section className="mt-4 rounded-xl bg-white p-4 shadow">
        <h2 className="mb-2 text-lg font-semibold text-gray-900">Points Transactions</h2>
        {history.map((h) => (
          <div key={h.id} className="flex justify-between border-b border-gray-200 py-1 text-sm text-gray-700">
            <span className="font-medium">{h.note}</span><span className="text-amber-700 font-semibold">{h.points}</span>
          </div>
        ))}
      </section>
    </Layout>
  );
}
