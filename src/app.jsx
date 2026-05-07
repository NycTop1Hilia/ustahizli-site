import React, { useEffect, useMemo, useState } from "react";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "123456";
const API_URL = "https://ustahizli-backend.onrender.com";

export default function App() {
  const [page, setPage] = useState("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [requests, setRequests] = useState(() => {
    const savedRequests = localStorage.getItem("ustaHizliRequests");
    return savedRequests ? JSON.parse(savedRequests) : [];
  });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Tümü");
  const [form, setForm] = useState({ service: "Avize Montajı", district: "Bornova", phone: "" });

  useEffect(() => {
    localStorage.setItem("ustaHizliRequests", JSON.stringify(requests));
  }, [requests]);

  const filteredRequests = useMemo(() => {
    return requests.filter((item) => {
      const text = (item.service + " " + item.district + " " + item.phone).toLowerCase();
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
      }),
    });

    const data = await response.json();

    if (data.success) {
      alert("Talep başarıyla oluşturuldu.");

      setForm({
        ...form,
        phone: "",
      });

    const updated = await fetch(`${API_URL}/requests`);
      const requestsData = await updated.json();

      setRequests(requestsData);

      setPage("home");
    }
  } catch (error) {
    console.error(error);
    alert("Sunucu bağlantı hatası.");
  }
};

  const login = (e) => {
    e.preventDefault();
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      setLoginError("");
      setUsername("");
      setPassword("");
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

  const getWhatsappLink = (item) => {
    const cleanPhone = item.phone.replace(/[^0-9]/g, "").replace(/^0/, "");
    const message = encodeURIComponent("Merhaba, " + item.service + " talebiniz için size teklif vermek istiyoruz.");
    return "https://wa.me/90" + cleanPhone + "?text=" + message;
  };

  if (page === "admin" && !isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#020718] flex items-center justify-center px-5">
        <div className="bg-white w-full max-w-md rounded-[28px] shadow-2xl p-8">
          <button onClick={() => setPage("home")} className="text-sm font-bold text-blue-900 mb-6">← Ana sayfaya dön</button>
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-3xl mb-4">🔒</div>
            <h1 className="text-3xl font-black text-slate-950">Admin Girişi</h1>
            <p className="text-slate-500 mt-2">Admin paneline erişmek için giriş yap. Oluşturulan talepler burada görünecek.</p>
          </div>
          <form onSubmit={login} className="space-y-4">
            <div>
              <label className="text-sm font-bold text-slate-700">Kullanıcı adı</label>
              <input value={username} onChange={(e) => setUsername(e.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-4 outline-none focus:ring-2 focus:ring-blue-900" placeholder="admin" />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-700">Şifre</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-4 outline-none focus:ring-2 focus:ring-blue-900" placeholder="123456" />
            </div>
            {loginError && <div className="rounded-2xl bg-red-50 text-red-600 p-3 text-sm">{loginError}</div>}
            <button className="w-full rounded-2xl bg-blue-900 text-white py-4 font-black hover:bg-blue-950 transition">Giriş Yap</button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-6">Demo giriş: <b>admin</b> / <b>123456</b></p>
        </div>
      </div>
    );
  }

  if (page === "admin" && isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#020718] text-white">
        <header className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
          <button onClick={() => setPage("home")} className="flex items-center gap-3 font-black"><span className="bg-blue-900 w-10 h-10 rounded-full flex items-center justify-center">🔧</span>UstaHızlı</button>
          <button onClick={logout} className="bg-white text-slate-950 rounded-2xl px-5 py-3 font-black">Çıkış yap</button>
        </header>
        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
            <div>
              <p className="text-blue-300 font-black mb-2">Admin Panel</p>
              <h1 className="text-4xl md:text-5xl font-black">Müşteri talepleri</h1>
              <p className="text-slate-300 mt-3 max-w-3xl">Bu panelde gelen tüm talepleri görebilir, durum değiştirebilir ve müşteriye WhatsApp’tan teklif gönderebilirsin.</p>
            </div>
            <div className="bg-white/10 rounded-3xl p-7 text-center min-w-[140px]"><p className="text-4xl font-black">{requests.length}</p><p className="text-sm text-slate-200">Toplam talep</p></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Hizmet, ilçe veya telefon ara" className="rounded-2xl px-5 py-4 text-slate-950 outline-none" />
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-2xl px-5 py-4 text-slate-950 outline-none"><option>Tümü</option><option>Bekliyor</option><option>Usta Atandı</option><option>Tamamlandı</option><option>İptal</option></select>
            <button onClick={() => setRequests([])} className="rounded-2xl bg-red-800 px-5 py-4 font-black text-white">Tüm talepleri temizle</button>
          </div>
          <div className="bg-white text-slate-900 rounded-[28px] overflow-hidden">
            {filteredRequests.length === 0 ? <div className="p-10 text-center text-slate-500">Henüz gösterilecek talep yok.</div> : (
              <div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-slate-100 text-slate-600 text-sm"><tr><th className="p-4">Hizmet</th><th className="p-4">İlçe</th><th className="p-4">Telefon</th><th className="p-4">Tarih</th><th className="p-4">Durum</th><th className="p-4">İşlem</th></tr></thead><tbody>
                {filteredRequests.map((item) => <tr key={item.id} className="border-t"><td className="p-4 font-bold">{item.service}</td><td className="p-4">{item.district}</td><td className="p-4">{item.phone}</td><td className="p-4">{item.date}</td><td className="p-4"><select value={item.status} onChange={(e) => updateStatus(item.id, e.target.value)} className="border rounded-xl px-3 py-2"><option>Bekliyor</option><option>Usta Atandı</option><option>Tamamlandı</option><option>İptal</option></select></td><td className="p-4"><a href={getWhatsappLink(item)} target="_blank" rel="noreferrer" className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold inline-block">WhatsApp</a></td></tr>)}
              </tbody></table></div>
            )}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <section className="bg-[#020718] text-white min-h-[760px]">
        <header className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
          <button onClick={() => setPage("home")} className="flex items-center gap-3 font-black"><span className="bg-blue-900 w-10 h-10 rounded-full flex items-center justify-center shadow-lg">🔧</span>UstaHızlı</button>
          <div className="flex gap-3"><button onClick={() => setPage("admin")} className="bg-blue-900 px-6 py-3 rounded-2xl font-black hover:bg-blue-950 transition">Admin</button><a href="#teklif" className="bg-white text-slate-950 px-6 py-3 rounded-2xl font-black">Teklif Al</a></div>
        </header>
        <div className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 border border-white/40 rounded-full px-4 py-2 mb-8 bg-white/10"><span>⏱️</span><span>5 dakika içinde teklif al</span></div>
            <h1 className="text-5xl md:text-7xl font-black leading-tight mb-8">Güvenilir ustayı<br />hızlıca bul.</h1>
            <p className="text-xl leading-9 max-w-2xl mb-10">Elektrik, montaj ve küçük tadilat işleriniz için talep oluşturun. Tüm talepler admin paneline düşer.</p>
            <div className="flex flex-wrap gap-4 mb-10"><a href="#teklif" className="bg-blue-900 px-7 py-4 rounded-2xl font-black hover:bg-blue-950 transition">Hemen Talep Oluştur →</a><a href="#nasil" className="border border-white/40 px-7 py-4 rounded-2xl font-black hover:bg-white/10 transition">Nasıl Çalışır?</a></div>
            <div className="flex flex-wrap gap-8 text-sm"><span>🛡️ Doğrulanmış ustalar</span><span>⭐ Puanlı hizmet</span><span>📍 İzmir geneli</span></div>
          </div>
          <form id="teklif" onSubmit={createRequest} className="bg-white/15 border border-white/20 rounded-[28px] p-8 shadow-xl backdrop-blur">
            <h2 className="text-3xl font-black mb-3">Ücretsiz teklif al</h2><p className="mb-8 font-semibold">Bilgilerini bırak, talebin admin paneline kaydedilsin.</p>
            <label className="block text-sm font-bold mb-2">Hizmet türü</label><select value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} className="w-full rounded-2xl px-5 py-4 mb-6 text-slate-950 outline-none"><option>Avize Montajı</option><option>Priz Değişimi</option><option>Küçük Tadilat</option><option>Elektrik Arızası</option><option>Peltek</option></select>
            <label className="block text-sm font-bold mb-2">İlçe</label><select value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} className="w-full rounded-2xl px-5 py-4 mb-6 text-slate-950 outline-none"><option>Bornova</option><option>Karşıyaka</option><option>Konak</option><option>Buca</option><option>Bayraklı</option><option>Çiğli</option><option>Gaziemir</option></select>
            <label className="block text-sm font-bold mb-2">Telefon numarası</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-2xl px-5 py-4 mb-6 text-slate-950 outline-none" placeholder="05xx xxx xx xx" />
            <button className="w-full bg-blue-900 rounded-2xl py-4 font-black hover:bg-blue-950 transition">Teklif Talebi Oluştur</button>
          </form>
        </div>
      </section>
      <section id="nasil" className="py-20 bg-white"><div className="max-w-7xl mx-auto px-6 text-center"><h2 className="text-4xl font-black mb-4">Nasıl çalışır?</h2><p className="text-slate-600 mb-12">Talep oluştur, admin panelinde değerlendirilir, müşteriye WhatsApp’tan teklif gönder.</p><div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left"><div className="border rounded-[24px] p-8 shadow-sm"><div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl mb-8">🔎</div><h3 className="text-2xl font-black mb-4">Talep oluştur</h3><p className="text-slate-600 leading-7">Hizmet türünü, ilçeni ve iletişim bilgini gir.</p></div><div className="border rounded-[24px] p-8 shadow-sm"><div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl mb-8">⏱️</div><h3 className="text-2xl font-black mb-4">Teklifleri al</h3><p className="text-slate-600 leading-7">Uygun ustalar kısa sürede fiyat ve saat bilgisi paylaşır.</p></div><div className="border rounded-[24px] p-8 shadow-sm"><div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl mb-8">🛡️</div><h3 className="text-2xl font-black mb-4">Ustanı seç</h3><p className="text-slate-600 leading-7">Puan, fiyat ve uygunluğa göre karar ver.</p></div></div></div></section>
      <section className="bg-slate-100 py-20"><div className="max-w-7xl mx-auto px-6"><div className="flex justify-between items-center mb-10"><div><h2 className="text-4xl font-black mb-3">Popüler hizmetler</h2><p className="text-slate-600">En çok talep alan hızlı servis kategorileri.</p></div><a href="#teklif" className="hidden md:inline-block bg-blue-900 text-white rounded-2xl px-7 py-4 font-black">Tüm hizmetler</a></div><div className="grid grid-cols-1 md:grid-cols-3 gap-6">{[["⚡", "Avize Montajı", "Aynı gün güvenilir elektrik ustası."], ["🔧", "Priz Değişimi", "Arızalı priz ve anahtar değişimi."], ["🔨", "Küçük Tadilat", "Ev içi küçük tamirat işleri."], ["🧩", "Peltek", "Özel kategori (demo amaçlı)."]].map(([icon, title, desc]) => <div key={title} className="bg-white rounded-[24px] p-8 shadow-sm border min-h-[230px]"><div className="w-16 h-16 rounded-full bg-blue-900 flex items-center justify-center text-3xl mb-8">{icon}</div><h3 className="text-2xl font-black mb-4">{title}</h3><p className="text-slate-600 mb-8">{desc}</p><a href="#teklif" className="text-blue-900 font-black">Teklif al →</a></div>)}</div></div></section>
      <footer className="bg-[#020718] text-white py-10"><div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between gap-6"><div><h3 className="text-xl font-black">UstaHızlı</h3><p className="mt-2">Demo site — hızlı usta bulma ve admin panel sistemi.</p></div><div className="font-bold">📞 0850 000 00 00</div></div></footer>
    </div>
  );
}
