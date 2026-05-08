import React, { useEffect, useMemo, useState } from "react";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "123456";
const API_URL = "https://ustahizli-backend.onrender.com";

const IZMIR_DISTRICTS = [
  "Aliağa",
  "Balçova",
  "Bayındır",
  "Bayraklı",
  "Bergama",
  "Beydağ",
  "Bornova",
  "Buca",
  "Çeşme",
  "Çiğli",
  "Dikili",
  "Foça",
  "Gaziemir",
  "Güzelbahçe",
  "Karabağlar",
  "Karaburun",
  "Karşıyaka",
  "Kemalpaşa",
  "Kınık",
  "Kiraz",
  "Konak",
  "Menderes",
  "Menemen",
  "Narlıdere",
  "Ödemiş",
  "Seferihisar",
  "Selçuk",
  "Tire",
  "Torbalı",
  "Urla",
];

const DISTRICT_POSITIONS = [
  ["Dikili", 12, 16],
  ["Bergama", 34, 10],
  ["Kınık", 72, 12],
  ["Foça", 8, 36],
  ["Aliağa", 24, 30],
  ["Menemen", 42, 28],
  ["Karşıyaka", 38, 40],
  ["Bornova", 51, 42],
  ["Kemalpaşa", 70, 42],
  ["Bayındır", 88, 50],
  ["Karaburun", 5, 47],
  ["Çeşme", 7, 62],
  ["Urla", 22, 58],
  ["Güzelbahçe", 24, 70],
  ["Narlıdere", 33, 62],
  ["Balçova", 37, 55],
  ["Konak", 43, 54],
  ["Karabağlar", 40, 62],
  ["Buca", 55, 56],
  ["Gaziemir", 45, 70],
  ["Menderes", 58, 74],
  ["Torbalı", 68, 65],
  ["Seferihisar", 31, 82],
  ["Selçuk", 50, 90],
  ["Tire", 73, 87],
  ["Ödemiş", 85, 72],
  ["Kiraz", 95, 86],
];

export default function App() {
  const [page, setPage] = useState("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Tümü");
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [form, setForm] = useState({
    service: "Avize Montajı",
    district: "Bornova",
    phone: "",
  });

  const fetchRequests = async () => {
    try {
      setLoadingRequests(true);
      const response = await fetch(`${API_URL}/requests`);
      const data = await response.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Talepler alınamadı:", error);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 3000);
    return () => clearInterval(interval);
  }, []);

  const getService = (item) => item.service || item.serviceType || "Belirtilmedi";

  const getDate = (item) => {
    if (item.date) return item.date;
    if (!item.createdAt) return "";
    return new Date(item.createdAt).toLocaleString("tr-TR");
  };

  const getStatusClass = (status) => {
    const value = status || "Yeni";

    if (value === "Yeni") return "bg-red-600 text-white";
    if (value === "Devam Ediyor") return "bg-yellow-600 text-white";
    if (value === "Teklif Bekliyor") return "bg-blue-600 text-white";
    if (value === "Tamamlandı") return "bg-green-600 text-white";
    if (value === "Tamamlanmadı") return "bg-black text-white";
    if (value === "İptal Edildi") return "bg-black text-white";
    if (value === "İptal") return "bg-black text-white";

    return "bg-slate-700 text-white";
  };

  const instagramCount = requests.filter((item) => item.source === "Instagram DM").length;
  const siteCount = requests.filter((item) => item.source !== "Instagram DM").length;
  const newCount = requests.filter((item) => (item.status || "Yeni") === "Yeni").length;

  const districtCounts = useMemo(() => {
    const counts = {};

    IZMIR_DISTRICTS.forEach((district) => {
      counts[district] = 0;
    });

    requests.forEach((item) => {
      const district = item.district || "Belirtilmedi";
      if (counts[district] !== undefined) {
        counts[district] += 1;
      }
    });

    return counts;
  }, [requests]);

  const filteredRequests = useMemo(() => {
    return requests.filter((item) => {
      const text = (
        getService(item) +
        " " +
        (item.district || "") +
        " " +
        (item.phone || "") +
        " " +
        (item.description || "") +
        " " +
        (item.source || "")
      ).toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());
      const matchesFilter = filter === "Tümü" || item.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [requests, search, filter]);

  const createRequest = async (e) => {
    e.preventDefault();

    if (!form.phone.trim()) {
      alert("Lütfen telefon numarası gir.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Müşteri",
          phone: form.phone,
          district: form.district,
          serviceType: form.service,
          description: form.service + " hizmet talebi",
          source: "Site Formu",
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Talep başarıyla oluşturuldu.");
        setForm({ ...form, phone: "" });
        await fetchRequests();
        setPage("home");
      }
    } catch (error) {
      console.error(error);
      alert("Sunucu bağlantı hatası.");
    }
  };

  const login = async (e) => {
    e.preventDefault();

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      setLoginError("");
      setUsername("");
      setPassword("");
      await fetchRequests();
    } else {
      setLoginError("Kullanıcı adı veya şifre hatalı.");
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setPage("home");
  };

  const updateStatus = (id, status) => {
    setRequests(requests.map((item) => (item.id === id ? { ...item, status } : item)));
  };

  const clearRequests = async () => {
    const confirmDelete = confirm("Tüm talepleri temizlemek istediğine emin misin?");
    if (!confirmDelete) return;

    try {
      await fetch(`${API_URL}/requests`, {
        method: "DELETE",
      });

      await fetchRequests();
    } catch (error) {
      console.error(error);
      alert("Talepler temizlenemedi.");
    }
  };

  const getWhatsappLink = (item) => {
    const cleanPhone = (item.phone || "").replace(/[^0-9]/g, "").replace(/^0/, "");
    const message = encodeURIComponent(
      "Merhaba, " + getService(item) + " talebiniz için size teklif vermek istiyoruz."
    );

    return "https://wa.me/90" + cleanPhone + "?text=" + message;
  };

  if (page === "admin" && !isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#020718] flex items-center justify-center px-5">
        <div className="bg-white w-full max-w-md rounded-[28px] shadow-2xl p-8">
          <button onClick={() => setPage("home")} className="text-sm font-bold text-blue-900 mb-6">
            ← Ana sayfaya dön
          </button>

          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-3xl mb-4">
              🔒
            </div>
            <h1 className="text-3xl font-black text-slate-950">Admin Girişi</h1>
            <p className="text-slate-500 mt-2">
              Admin paneline erişmek için giriş yap. Oluşturulan talepler burada görünecek.
            </p>
          </div>

          <form onSubmit={login} className="space-y-4">
            <div>
              <label className="text-sm font-bold text-slate-700">Kullanıcı adı</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-2 w-full rounded-2xl border px-4 py-4 outline-none focus:ring-2 focus:ring-blue-900"
                placeholder="admin"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">Şifre</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-2xl border px-4 py-4 outline-none focus:ring-2 focus:ring-blue-900"
                placeholder="123456"
              />
            </div>

            {loginError && (
              <div className="rounded-2xl bg-red-50 text-red-600 p-3 text-sm">
                {loginError}
              </div>
            )}

            <button className="w-full rounded-2xl bg-blue-900 text-white py-4 font-black hover:bg-blue-950 transition">
              Giriş Yap
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Demo giriş: <b>admin</b> / <b>123456</b>
          </p>
        </div>
      </div>
    );
  }

  if (page === "admin" && isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#03142b] text-white">
        <div className="flex">
          <aside className="hidden lg:flex w-[260px] min-h-screen bg-[#021026] border-r border-blue-500/20 flex-col justify-between fixed left-0 top-0">
            <div>
              <div className="p-7 border-b border-blue-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-2xl shadow-lg">
                    🔧
                  </div>
                  <div>
                    <h2 className="text-xl font-black">USTA HIZLI</h2>
                    <p className="text-xs text-slate-400">Hizmet Burada</p>
                  </div>
                </div>
              </div>

              <nav className="p-5 space-y-6">
                <div>
                  <p className="text-xs text-slate-500 font-bold mb-3">ANA MENÜ</p>
                  <button className="w-full bg-blue-900/60 text-left px-4 py-3 rounded-xl font-bold">
                    🏠 Dashboard
                  </button>
                </div>

                <div>
                  <p className="text-xs text-slate-500 font-bold mb-3">TALEPLER</p>
                  <div className="space-y-2">
                    <button className="w-full flex justify-between px-4 py-3 rounded-xl hover:bg-white/5">
                      <span>📋 Tüm Talepler</span>
                      <b className="bg-blue-600 px-2 rounded-lg">{requests.length}</b>
                    </button>
                    <button className="w-full flex justify-between px-4 py-3 rounded-xl hover:bg-white/5">
                      <span>🔔 Yeni Talepler</span>
                      <b className="bg-red-600 px-2 rounded-lg">{newCount}</b>
                    </button>
                    <button className="w-full flex justify-between px-4 py-3 rounded-xl hover:bg-white/5">
                      <span>📸 Instagram DM</span>
                      <b className="bg-pink-600 px-2 rounded-lg">{instagramCount}</b>
                    </button>
                    <button className="w-full flex justify-between px-4 py-3 rounded-xl hover:bg-white/5">
                      <span>🌐 Site Formları</span>
                      <b className="bg-blue-600 px-2 rounded-lg">{siteCount}</b>
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-500 font-bold mb-3">SİSTEM</p>
                  <div className="space-y-2">
                    <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5">
                      📍 İlçe Haritası
                    </button>
                    <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5">
                      ⚙️ Ayarlar
                    </button>
                  </div>
                </div>
              </nav>
            </div>

            <button onClick={logout} className="m-5 text-left text-red-400 font-black">
              ↪ Çıkış Yap
            </button>
          </aside>

          <main className="lg:ml-[260px] w-full min-h-screen bg-gradient-to-br from-[#03142b] via-[#062147] to-[#020718]">
            <header className="border-b border-blue-500/20 px-6 lg:px-8 py-6 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-black">Yönetim Paneli <span className="text-blue-400">●</span></h1>
                <p className="text-xs text-slate-400 mt-1">
                  {loadingRequests ? "Talepler güncelleniyor..." : "Canlı bağlantı aktif"}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-2xl bg-[#082851] flex items-center justify-center">
                  🔔
                  {newCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-black">
                      {newCount}
                    </span>
                  )}
                </div>
                <button onClick={logout} className="bg-white text-slate-950 rounded-2xl px-5 py-3 font-black lg:hidden">
                  Çıkış yap
                </button>
              </div>
            </header>

            <section className="p-6 lg:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
                <div className="rounded-2xl bg-blue-950/70 border border-blue-400/20 p-6 shadow-xl">
                  <p className="font-bold text-slate-300">Toplam Talep</p>
                  <h2 className="text-4xl font-black mt-2">{requests.length}</h2>
                  <p className="text-sm text-slate-400 mt-2">Tüm zamanlar</p>
                </div>

                <div className="rounded-2xl bg-pink-950/50 border border-pink-400/30 p-6 shadow-xl">
                  <p className="font-bold text-slate-300">Instagram DM</p>
                  <h2 className="text-4xl font-black mt-2">{instagramCount}</h2>
                  <p className="text-sm text-slate-400 mt-2">Mesajdan gelen talepler</p>
                </div>

                <div className="rounded-2xl bg-blue-950/70 border border-blue-400/20 p-6 shadow-xl">
                  <p className="font-bold text-slate-300">Site Formları</p>
                  <h2 className="text-4xl font-black mt-2">{siteCount}</h2>
                  <p className="text-sm text-slate-400 mt-2">Formdan gelen talepler</p>
                </div>

                <div className="rounded-2xl bg-red-950/50 border border-red-400/30 p-6 shadow-xl">
                  <p className="font-bold text-slate-300">Yeni Talepler</p>
                  <h2 className="text-4xl font-black mt-2">{newCount}</h2>
                  <p className="text-sm text-slate-400 mt-2">Aksiyon bekliyor</p>
                </div>
              </div>

              <div className="grid grid-cols-1 2xl:grid-cols-[1.15fr_1fr] gap-6">
                <div className="rounded-2xl bg-[#041b38]/90 border border-blue-400/20 overflow-hidden shadow-2xl">
                  <div className="p-5 border-b border-blue-400/20 flex flex-col lg:flex-row gap-4 justify-between">
                    <div>
                      <h2 className="text-2xl font-black">Talep Listesi</h2>
                      <p className="text-xs text-slate-400 mt-1">Instagram DM ve site formları</p>
                    </div>

                    <button onClick={fetchRequests} className="bg-blue-600 px-5 py-3 rounded-xl font-black">
                      Yenile
                    </button>
                  </div>

                  <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Hizmet, ilçe, açıklama ara"
                      className="rounded-xl bg-[#021026] border border-blue-400/20 px-4 py-3 text-white outline-none"
                    />

                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="rounded-xl bg-[#021026] border border-blue-400/20 px-4 py-3 text-white outline-none"
                    >
                      <option>Tümü</option>
                      <option>Yeni</option>
                      <option>Devam Ediyor</option>
                      <option>Teklif Bekliyor</option>
                      <option>Tamamlandı</option>
                      <option>Tamamlanmadı</option>
                      <option>İptal Edildi</option>
                    </select>

                    <button onClick={clearRequests} className="rounded-xl bg-red-700 px-4 py-3 font-black text-white">
                      Tüm talepleri temizle
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-[#021026] text-slate-400">
                        <tr>
                          <th className="p-4">ID</th>
                          <th className="p-4">Kaynak</th>
                          <th className="p-4">Hizmet</th>
                          <th className="p-4">İlçe</th>
                          <th className="p-4">Telefon</th>
                          <th className="p-4">Açıklama</th>
                          <th className="p-4">Durum</th>
                          <th className="p-4">Tarih</th>
                          <th className="p-4">İşlem</th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredRequests.length === 0 ? (
                          <tr>
                            <td colSpan="9" className="p-10 text-center text-slate-400">
                              Henüz gösterilecek talep yok.
                            </td>
                          </tr>
                        ) : (
                          filteredRequests.map((item, index) => (
                            <tr key={item.id} className="border-t border-blue-400/10 hover:bg-white/5 align-top">
                              <td className="p-4 text-slate-400">#{requests.length - index}</td>

                              <td className="p-4">
                                <span
                                  className={
                                    item.source === "Instagram DM"
                                      ? "bg-pink-700 text-white px-3 py-1 rounded-lg text-xs font-black"
                                      : "bg-blue-700 text-white px-3 py-1 rounded-lg text-xs font-black"
                                  }
                                >
                                  {item.source || "Site Formu"}
                                </span>
                              </td>

                              <td className="p-4 font-bold">{getService(item)}</td>
                              <td className="p-4">{item.district || "Belirtilmedi"}</td>
                              <td className="p-4">{item.phone || "-"}</td>
                              <td className="p-4 max-w-[280px] text-slate-300">{item.description || "-"}</td>

                              <td className="p-4">
                                <select
                                  value={item.status || "Yeni"}
                                  onChange={(e) => updateStatus(item.id, e.target.value)}
                                  className={`${getStatusClass(item.status)} rounded-lg px-3 py-2 outline-none font-bold`}
                                >
                                  <option>Yeni</option>
                                  <option>Devam Ediyor</option>
                                  <option>Teklif Bekliyor</option>
                                  <option>Tamamlandı</option>
                                  <option>Tamamlanmadı</option>
                                  <option>İptal Edildi</option>
                                </select>
                              </td>

                              <td className="p-4 whitespace-nowrap text-slate-300">{getDate(item)}</td>

                              <td className="p-4">
                                {item.phone ? (
                                  <a
                                    href={getWhatsappLink(item)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold inline-block"
                                  >
                                    WhatsApp
                                  </a>
                                ) : (
                                  <span className="text-slate-500 text-sm">Telefon yok</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-4 border-t border-blue-400/20 flex flex-wrap gap-3 text-xs">
                    <span className="bg-red-600 px-3 py-2 rounded-lg font-bold">Yeni</span>
                    <span className="bg-yellow-600 px-3 py-2 rounded-lg font-bold">Devam Ediyor</span>
                    <span className="bg-blue-600 px-3 py-2 rounded-lg font-bold">Teklif Bekliyor</span>
                    <span className="bg-green-600 px-3 py-2 rounded-lg font-bold">Tamamlandı</span>
                    <span className="bg-black px-3 py-2 rounded-lg font-bold">Tamamlanmadı</span>
                    <span className="bg-black px-3 py-2 rounded-lg font-bold">İptal Edildi</span>
                  </div>
                </div>

                <div className="rounded-2xl bg-[#041b38]/90 border border-blue-400/20 overflow-hidden shadow-2xl">
                  <div className="p-5 border-b border-blue-400/20 flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-black">İzmir İlçe Haritası</h2>
                      <p className="text-xs text-slate-400 mt-1">Haritadaki sayılar aktif talepleri gösterir.</p>
                    </div>
                  </div>

                  <div className="relative h-[460px] bg-gradient-to-br from-[#0b376d] via-[#062147] to-[#021026] overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,#60a5fa_1px,transparent_1px)] [background-size:22px_22px]" />

                    {DISTRICT_POSITIONS.map(([district, left, top], index) => {
                      const count = districtCounts[district] || 0;

                      return (
                        <div
                          key={district}
                          className="absolute -translate-x-1/2 -translate-y-1/2 text-center"
                          style={{ left: `${left}%`, top: `${top}%` }}
                        >
                          <div
                            className={`px-3 py-2 rounded-2xl border shadow-lg ${
                              count > 0
                                ? "bg-blue-600/70 border-blue-300/40"
                                : "bg-slate-800/70 border-slate-500/30"
                            }`}
                          >
                            <p className="text-[10px] font-bold leading-none">{district}</p>
                            <p className={`mt-1 text-lg font-black ${count > 0 ? "text-white" : "text-slate-400"}`}>
                              {count}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-5 border-t border-blue-400/20">
                    <h3 className="font-black mb-4">İlçelere Göre Aktif Talep Sayıları</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {IZMIR_DISTRICTS.map((district) => (
                        <div key={district} className="bg-[#021026] border border-blue-400/10 rounded-xl px-3 py-2 flex justify-between">
                          <span className="text-sm">{district}</span>
                          <b className={districtCounts[district] > 0 ? "text-red-400" : "text-slate-500"}>
                            {districtCounts[district] || 0}
                          </b>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 border-t border-blue-400/20">
                    <div className="p-5 border-r border-blue-400/20">
                      <p className="text-slate-400 text-sm">Toplam İlçe</p>
                      <p className="text-2xl font-black">30</p>
                    </div>
                    <div className="p-5 border-r border-blue-400/20">
                      <p className="text-slate-400 text-sm">Kapsam Alanı</p>
                      <p className="text-xl font-black">İzmir Geneli</p>
                    </div>
                    <div className="p-5">
                      <p className="text-slate-400 text-sm">Hizmet Durumu</p>
                      <p className="text-xl font-black text-green-400">● Aktif</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <section className="bg-[#020718] text-white min-h-[760px]">
        <header className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
          <button onClick={() => setPage("home")} className="flex items-center gap-3 font-black">
            <span className="bg-blue-900 w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
              🔧
            </span>
            UstaHızlı
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => setPage("admin")}
              className="bg-blue-900 px-6 py-3 rounded-2xl font-black hover:bg-blue-950 transition"
            >
              Admin
            </button>
            <a href="#teklif" className="bg-white text-slate-950 px-6 py-3 rounded-2xl font-black">
              Teklif Al
            </a>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 border border-white/40 rounded-full px-4 py-2 mb-8 bg-white/10">
              <span>⏱️</span>
              <span>5 dakika içinde teklif al</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black leading-tight mb-8">
              Güvenilir ustayı
              <br />
              hızlıca bul.
            </h1>

            <p className="text-xl leading-9 max-w-2xl mb-10">
              Elektrik, montaj ve küçük tadilat işleriniz için talep oluşturun. Tüm talepler admin paneline düşer.
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              <a href="#teklif" className="bg-blue-900 px-7 py-4 rounded-2xl font-black hover:bg-blue-950 transition">
                Hemen Talep Oluştur →
              </a>
              <a href="#nasil" className="border border-white/40 px-7 py-4 rounded-2xl font-black hover:bg-white/10 transition">
                Nasıl Çalışır?
              </a>
            </div>

            <div className="flex flex-wrap gap-8 text-sm">
              <span>🛡️ Doğrulanmış ustalar</span>
              <span>⭐ Puanlı hizmet</span>
              <span>📍 İzmir geneli</span>
            </div>
          </div>

          <form id="teklif" onSubmit={createRequest} className="bg-white/15 border border-white/20 rounded-[28px] p-8 shadow-xl backdrop-blur">
            <h2 className="text-3xl font-black mb-3">Ücretsiz teklif al</h2>
            <p className="mb-8 font-semibold">Bilgilerini bırak, talebin admin paneline kaydedilsin.</p>

            <label className="block text-sm font-bold mb-2">Hizmet türü</label>
            <select
              value={form.service}
              onChange={(e) => setForm({ ...form, service: e.target.value })}
              className="w-full rounded-2xl px-5 py-4 mb-6 text-slate-950 outline-none"
            >
              <option>Avize Montajı</option>
              <option>Priz Değişimi</option>
              <option>Küçük Tadilat</option>
              <option>Elektrik Arızası</option>
              <option>Peltek</option>
            </select>

            <label className="block text-sm font-bold mb-2">İlçe</label>
            <select
              value={form.district}
              onChange={(e) => setForm({ ...form, district: e.target.value })}
              className="w-full rounded-2xl px-5 py-4 mb-6 text-slate-950 outline-none"
            >
              {IZMIR_DISTRICTS.map((district) => (
                <option key={district}>{district}</option>
              ))}
            </select>

            <label className="block text-sm font-bold mb-2">Telefon numarası</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-2xl px-5 py-4 mb-6 text-slate-950 outline-none"
              placeholder="05xx xxx xx xx"
            />

            <button className="w-full bg-blue-900 rounded-2xl py-4 font-black hover:bg-blue-950 transition">
              Teklif Talebi Oluştur
            </button>
          </form>
        </div>
      </section>

      <footer className="bg-[#020718] text-white py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between gap-6">
          <div>
            <h3 className="text-xl font-black">UstaHızlı</h3>
            <p className="mt-2">Demo site — hızlı usta bulma ve admin panel sistemi.</p>
          </div>
          <div className="font-bold">📞 0850 000 00 00</div>
        </div>
      </footer>
    </div>
  );
}