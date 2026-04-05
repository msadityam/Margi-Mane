import { useEffect, useState } from "react";
import api from "../lib/api";
import Layout from "../components/Layout";

export default function HomePage() {
  const [menu, setMenu] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [info, setInfo] = useState({ hotelName: "Margi Mane", phone: "9886025999", mapsUrl: "https://maps.app.goo.gl/b8LTGr4MbHqsaasTA" });

  useEffect(() => {
    api.get("/menu").then((res) => setMenu(res.data));
    api.get("/announcements").then((res) => setAnnouncements(res.data));
    api.get("/public/business-info").then((res) => setInfo(res.data));
  }, []);

  return (
    <Layout>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-xl bg-white p-4 shadow">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">Menu</h2>
          <div className="space-y-2">
            {menu.map((m) => (
              <div key={m.id} className="flex justify-between border-b border-gray-200 pb-1 text-sm text-gray-700">
                <span className="font-medium">{m.name}</span>
                <span className="text-amber-700 font-semibold">Rs {m.price}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-xl bg-white p-4 shadow">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">Announcements</h2>
          <div className="space-y-2 text-sm">
            {announcements.map((a) => (
              <div key={a.id} className="rounded bg-amber-50 p-2 border border-amber-200">
                {a.title && <p className="font-semibold text-gray-900">{a.title}</p>}
                <p className="text-gray-700">{a.message}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded bg-white border border-gray-200 p-3 text-sm">
            <p className="font-semibold text-gray-900">{info.hotelName}</p>
            <a href={`tel:${info.phone}`} className="block text-amber-700 font-medium hover:text-amber-800">{info.phone}</a>
            <a href={info.mapsUrl} target="_blank" rel="noreferrer" className="text-amber-600 hover:text-amber-700 font-medium">View on Google Maps</a>
          </div>
        </section>
      </div>
    </Layout>
  );
}
