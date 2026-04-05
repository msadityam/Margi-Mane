import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import api from "../lib/api";
import FormInput from "../components/FormInput";
import Table from "../components/Table";
import Modal from "../components/Modal";

export default function AdminPanelPage() {
  const [dashboard, setDashboard] = useState({});
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [userPage, setUserPage] = useState(0);
  const [userTotalPages, setUserTotalPages] = useState(0);
  const [userTotal, setUserTotal] = useState(0);
  const [payments, setPayments] = useState([]);
  const [menu, setMenu] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [reward, setReward] = useState({ rupeesPerUnit: 100, pointsPerUnit: 10 });
  const [menuForm, setMenuForm] = useState({ name: "", price: "", category: "TEA" });
  const [announcementForm, setAnnouncementForm] = useState({ title: "", message: "", active: true });
  const [editingMenu, setEditingMenu] = useState(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [pointEdits, setPointEdits] = useState({});
  const [rejectNotes, setRejectNotes] = useState({});

  const load = () => {
    api.get("/admin/dashboard").then((res) => setDashboard(res.data));
    loadUsers();
    api.get("/admin/payments?status=PENDING").then((res) => setPayments(res.data));
    api.get("/admin/menu").then((res) => setMenu(res.data));
    api.get("/admin/announcements").then((res) => setAnnouncements(res.data));
    api.get("/admin/reward-config").then((res) => setReward(res.data));
  };

  const loadUsers = () => {
    const params = new URLSearchParams();
    if (userSearch) params.append("query", userSearch);
    params.append("page", userPage);
    api.get(`/admin/users/search?${params}`).then((res) => {
      setUsers(res.data.users);
      setUserTotalPages(res.data.totalPages);
      setUserTotal(res.data.total);
    });
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { loadUsers(); }, [userSearch, userPage]);

  const decide = async (id, action) => {
    await api.patch(`/admin/payments/${id}/${action}`, { note: rejectNotes[id] || "" });
    setRejectNotes((prev) => ({ ...prev, [id]: "" }));
    load();
  };
  const changeRole = async (id, role) => { await api.patch(`/admin/users/${id}/role`, { role }); load(); };
  const saveReward = async () => { await api.put("/admin/reward-config", { rupeesPerUnit: Number(reward.rupeesPerUnit), pointsPerUnit: Number(reward.pointsPerUnit) }); };
  const savePoints = async (id) => {
    const pointsDelta = Number(pointEdits[id] || 0);
    if (!pointsDelta) return;
    await api.patch(`/admin/users/${id}/points`, { pointsDelta, note: "Admin points update" });
    setPointEdits((prev) => ({ ...prev, [id]: "" }));
    load();
  };

  const addMenu = async (e) => {
    e.preventDefault();
    await api.post("/admin/menu", { ...menuForm, price: Number(menuForm.price), active: true });
    setMenuForm({ name: "", price: "", category: "TEA" });
    load();
  };
  const updateMenu = async () => {
    await api.put(`/admin/menu/${editingMenu.id}`, { ...editingMenu, price: Number(editingMenu.price) });
    setEditingMenu(null);
    load();
  };
  const deleteMenu = async (id) => {
    if (!window.confirm("Delete this menu item?")) return;
    await api.delete(`/admin/menu/${id}`);
    load();
  };

  const addAnnouncement = async (e) => {
    e.preventDefault();
    await api.post("/admin/announcements", announcementForm);
    setAnnouncementForm({ title: "", message: "", active: true });
    load();
  };
  const updateAnnouncement = async () => {
    await api.patch(`/admin/announcements/${editingAnnouncement.id}`, editingAnnouncement);
    setEditingAnnouncement(null);
    load();
  };
  const deleteAnnouncement = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    await api.delete(`/admin/announcements/${id}`);
    load();
  };

  const categoryOptions = useMemo(
    () => [
      { value: "TEA", label: "Tea" },
      { value: "DOSA", label: "Dosa" },
      { value: "BATH", label: "Bath" },
      { value: "MEALS", label: "Meals" },
    ],
    []
  );

  return (
    <Layout>
      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-3 shadow"><p className="text-xs text-gray-600">Total Users</p><p className="text-lg font-semibold text-gray-900">{dashboard.totalUsers || 0}</p></div>
        <div className="rounded-xl bg-white p-3 shadow"><p className="text-xs text-gray-600">Points Issued</p><p className="text-lg font-semibold text-gray-900">{dashboard.totalPointsIssued || 0}</p></div>
        <div className="rounded-xl bg-white p-3 shadow"><p className="text-xs text-gray-600">Transactions</p><p className="text-lg font-semibold text-gray-900">{dashboard.totalTransactions || 0}</p></div>
      </section>

      <section className="mt-4 rounded-xl bg-white p-4 shadow">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Pending Payments</h2>
        {payments.map((p) => (
          <div key={p.id} className="mb-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
            <p className="font-semibold text-gray-900">{p.userName} ({p.mobileNumber})</p>
            <p className="text-gray-700">Amount: Rs {p.amount}</p>
            <p className="text-gray-700">Time: {new Date(p.createdAt).toLocaleString()}</p>
            <p className="text-gray-700">UPI Ref: {p.upiRefId || "-"}</p>
            <FormInput
              className="mt-2"
              label="Reject reason (optional)"
              value={rejectNotes[p.id] || ""}
              onChange={(e) => setRejectNotes((prev) => ({ ...prev, [p.id]: e.target.value }))}
              placeholder="Reason..."
            />
            <div className="mt-2 flex gap-2">
              <button onClick={() => decide(p.id, "approve")} className="rounded bg-green-600 px-3 py-1 text-white hover:bg-green-700">Approve</button>
              <button onClick={() => decide(p.id, "reject")} className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700">Reject</button>
            </div>
          </div>
        ))}
      </section>

      <section className="mt-4 rounded-xl bg-white p-4 shadow">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Users ({userTotal})</h2>
        <input
          type="text"
          placeholder="Search by name or mobile..."
          className="mb-3 w-full rounded border border-gray-300 p-2 text-gray-900 placeholder-gray-500"
          value={userSearch}
          onChange={(e) => {
            setUserSearch(e.target.value);
            setUserPage(0);
          }}
        />
        {users.map((u) => (
          <div key={u.id} className="mb-2 rounded bg-gray-50 border border-gray-200 p-3 text-sm">
            <p className="font-semibold text-gray-900">{u.name}</p>
            <p className="text-gray-700">{u.mobileNumber}</p>
            <p className="text-gray-700">Points: {u.pointsBalance}</p>
            <p className="text-gray-700">Role: {u.role}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <input
                type="number"
                placeholder="Points +/-"
                className="rounded border border-gray-300 px-2 py-1 text-gray-900"
                value={pointEdits[u.id] || ""}
                onChange={(e) => setPointEdits((prev) => ({ ...prev, [u.id]: e.target.value }))}
              />
              <button onClick={() => savePoints(u.id)} className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700">Save Points</button>
              <button onClick={() => changeRole(u.id, u.role === "ADMIN" ? "USER" : "ADMIN")} className="rounded bg-amber-700 px-3 py-1 text-white hover:bg-amber-800">
                Set {u.role === "ADMIN" ? "USER" : "ADMIN"}
              </button>
            </div>
          </div>
        ))}
        {users.length === 0 && <p className="text-sm text-gray-600">No users found</p>}
        
        {userTotalPages > 1 && (
          <div className="mt-4 flex items-center justify-between gap-2">
            <button
              onClick={() => setUserPage(Math.max(0, userPage - 1))}
              disabled={userPage === 0}
              className="rounded bg-blue-600 px-3 py-1 text-white disabled:opacity-50 hover:bg-blue-700"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700 font-medium">
              Page {userPage + 1} of {userTotalPages}
            </span>
            <button
              onClick={() => setUserPage(Math.min(userTotalPages - 1, userPage + 1))}
              disabled={userPage === userTotalPages - 1}
              className="rounded bg-blue-600 px-3 py-1 text-white disabled:opacity-50 hover:bg-blue-700"
            >
              Next
            </button>
          </div>
        )}
      </section>

      <section className="mt-4 rounded-xl bg-white p-4 shadow">
        <h2 className="mb-2 font-semibold text-gray-900">Reward Rule</h2>
        <div className="flex gap-2">
          <input className="w-full rounded border border-gray-300 p-2 text-gray-900" type="number" value={reward.rupeesPerUnit} onChange={(e) => setReward({ ...reward, rupeesPerUnit: e.target.value })} />
          <input className="w-full rounded border border-gray-300 p-2 text-gray-900" type="number" value={reward.pointsPerUnit} onChange={(e) => setReward({ ...reward, pointsPerUnit: e.target.value })} />
        </div>
        <button onClick={saveReward} className="mt-2 rounded bg-amber-700 px-3 py-1 text-white hover:bg-amber-800">Save</button>
      </section>

      <section className="mt-4 rounded-xl bg-white p-4 shadow">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Menu Management</h2>
        <form onSubmit={addMenu} className="mb-4 grid gap-2 sm:grid-cols-3">
          <FormInput label="Name" value={menuForm.name} onChange={(e) => setMenuForm((p) => ({ ...p, name: e.target.value }))} required />
          <FormInput label="Price" type="number" value={menuForm.price} onChange={(e) => setMenuForm((p) => ({ ...p, price: e.target.value }))} required />
          <FormInput label="Category" options={categoryOptions} value={menuForm.category} onChange={(e) => setMenuForm((p) => ({ ...p, category: e.target.value }))} />
          <button className="sm:col-span-3 rounded bg-amber-700 px-3 py-2 text-white hover:bg-amber-800 font-semibold">Add Item</button>
        </form>
        <div className="overflow-x-auto">
          <Table
            columns={[
              { key: "name", label: "Name" },
              { key: "price", label: "Price", render: (r) => `Rs ${r.price}` },
              { key: "category", label: "Category" },
              {
                key: "actions",
                label: "Actions",
                render: (r) => (
                  <div className="flex gap-2">
                    <button onClick={() => setEditingMenu(r)} className="rounded bg-blue-600 px-2 py-1 text-white hover:bg-blue-700">Edit</button>
                    <button onClick={() => deleteMenu(r.id)} className="rounded bg-red-600 px-2 py-1 text-white hover:bg-red-700">Delete</button>
                  </div>
                ),
              },
            ]}
            rows={menu}
          />
        </div>
      </section>

      <section className="mt-4 rounded-xl bg-white p-4 shadow">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Announcements Management</h2>
        <form onSubmit={addAnnouncement} className="mb-4 grid gap-2 sm:grid-cols-2">
          <FormInput label="Title" value={announcementForm.title} onChange={(e) => setAnnouncementForm((p) => ({ ...p, title: e.target.value }))} />
          <label className="mt-6 inline-flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={announcementForm.active} onChange={(e) => setAnnouncementForm((p) => ({ ...p, active: e.target.checked }))} />
            Active
          </label>
          <FormInput label="Message" textarea value={announcementForm.message} onChange={(e) => setAnnouncementForm((p) => ({ ...p, message: e.target.value }))} required className="sm:col-span-2" />
          <button className="rounded bg-amber-700 px-3 py-2 text-white sm:col-span-2 hover:bg-amber-800 font-semibold">Post Announcement</button>
        </form>
        <Table
          columns={[
            { key: "title", label: "Title" },
            { key: "message", label: "Message" },
            { key: "active", label: "Status", render: (r) => (r.active ? "Active" : "Inactive") },
            {
              key: "actions",
              label: "Actions",
              render: (r) => (
                <div className="flex gap-2">
                  <button onClick={() => setEditingAnnouncement(r)} className="rounded bg-blue-600 px-2 py-1 text-white hover:bg-blue-700">Edit</button>
                  <button onClick={() => deleteAnnouncement(r.id)} className="rounded bg-red-600 px-2 py-1 text-white hover:bg-red-700">Delete</button>
                </div>
              ),
            },
          ]}
          rows={announcements}
        />
      </section>

      <Modal open={!!editingMenu} title="Edit Menu Item" onClose={() => setEditingMenu(null)}>
        {editingMenu && (
          <div className="space-y-2">
            <FormInput label="Name" value={editingMenu.name} onChange={(e) => setEditingMenu((p) => ({ ...p, name: e.target.value }))} />
            <FormInput label="Price" type="number" value={editingMenu.price} onChange={(e) => setEditingMenu((p) => ({ ...p, price: e.target.value }))} />
            <FormInput label="Category" options={categoryOptions} value={editingMenu.category} onChange={(e) => setEditingMenu((p) => ({ ...p, category: e.target.value }))} />
            <button onClick={updateMenu} className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700 font-semibold">Save</button>
          </div>
        )}
      </Modal>

      <Modal open={!!editingAnnouncement} title="Edit Announcement" onClose={() => setEditingAnnouncement(null)}>
        {editingAnnouncement && (
          <div className="space-y-2">
            <FormInput label="Title" value={editingAnnouncement.title || ""} onChange={(e) => setEditingAnnouncement((p) => ({ ...p, title: e.target.value }))} />
            <FormInput label="Message" textarea value={editingAnnouncement.message} onChange={(e) => setEditingAnnouncement((p) => ({ ...p, message: e.target.value }))} />
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={editingAnnouncement.active} onChange={(e) => setEditingAnnouncement((p) => ({ ...p, active: e.target.checked }))} />
              Active
            </label>
            <button onClick={updateAnnouncement} className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700 font-semibold">Save</button>
          </div>
        )}
      </Modal>
    </Layout>
  );
}
