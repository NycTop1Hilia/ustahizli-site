import React, { useEffect, useMemo, useState } from "react";
import izmirMap from "./assets/izmir-map.svg";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "123456";
const API_URL = "https://ustahizli-backend.onrender.com";
const PARTICIPATION_FEE = 15;
const STORAGE_KEY = "ustahizli-demo-state-v9";

const loadSavedState = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    return {};
  }
};


const MASTER_ACCOUNTS = [
  {
    id: 1,
    name: "Mehmet Usta",
    phone: "0555 000 00 00",
    district: "Karşıyaka",
    balance: 150,
    completedCount: 0,
    cancelledCount: 0,
  },
  {
    id: 2,
    name: "Can Usta",
    phone: "0532 111 22 33",
    district: "Bornova",
    balance: 120,
    completedCount: 0,
    cancelledCount: 0,
  },
];

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
  ["Dikili", 31, 26],
  ["Bergama", 40, 22],
  ["Kınık", 50, 30],
  ["Aliağa", 36, 42],
  ["Foça", 27, 48],
  ["Menemen", 38, 52],
  ["Karaburun", 13, 58],
  ["Çeşme", 8, 72],
  ["Urla", 17, 72],
  ["Güzelbahçe", 30, 69],
  ["Narlıdere", 35, 66],
  ["Balçova", 37, 64],
  ["Karşıyaka", 39, 59],
  ["Çiğli", 34, 60],
  ["Bayraklı", 42, 61],
  ["Bornova", 45, 59],
  ["Konak", 39, 66],
  ["Karabağlar", 42, 67],
  ["Buca", 46, 68],
  ["Gaziemir", 41, 70],
  ["Kemalpaşa", 55, 65],
  ["Bayındır", 62, 74],
  ["Torbalı", 50, 77],
  ["Menderes", 39, 77],
  ["Seferihisar", 29, 77],
  ["Selçuk", 49, 89],
  ["Tire", 64, 85],
  ["Ödemiş", 76, 76],
  ["Beydağ", 87, 83],
  ["Kiraz", 92, 77],
];

const DEMO_AUCTIONS = [];


export default function App() {
  const savedState = useMemo(() => loadSavedState(), []);
  const [page, setPage] = useState("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Tümü");
  const [auctionPage, setAuctionPage] = useState(1);
  const [requestPage, setRequestPage] = useState(1);
  const [requestPageSize, setRequestPageSize] = useState(10);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [selectedRequestIds, setSelectedRequestIds] = useState([]);
  const [deletedRequestIds, setDeletedRequestIds] = useState(Array.isArray(savedState.deletedRequestIds) ? savedState.deletedRequestIds : []);
  const [adminCancelDetailJob, setAdminCancelDetailJob] = useState(null);
  const [form, setForm] = useState({
    service: "Avize Montajı",
    district: "Bornova",
    phone: "",
  });

  const [now, setNow] = useState(Date.now());
  const [isMasterLoggedIn, setIsMasterLoggedIn] = useState(false);
  const [masterLoginPhone, setMasterLoginPhone] = useState("0555 000 00 00");
  const [masterLoginName, setMasterLoginName] = useState("Mehmet Usta");
  const [masterLoginError, setMasterLoginError] = useState("");
  const [masterAuthMode, setMasterAuthMode] = useState("login");

  const [masterTab, setMasterTab] = useState("auctions");
  const [jobFilter, setJobFilter] = useState("Tümü");
  const [bidAmounts, setBidAmounts] = useState({});
  const [cancelModalJob, setCancelModalJob] = useState(null);
  const [cancelReason, setCancelReason] = useState("Müşteri cevap vermedi");
  const [cancelNote, setCancelNote] = useState("");
  const [currentMaster, setCurrentMaster] = useState(savedState.currentMaster || MASTER_ACCOUNTS[0]);
  const [auctionRequests, setAuctionRequests] = useState(Array.isArray(savedState.auctionRequests) ? savedState.auctionRequests : DEMO_AUCTIONS);
  const [offers, setOffers] = useState(Array.isArray(savedState.offers) ? savedState.offers : []);

  const fetchRequests = async () => {
    try {
      setLoadingRequests(true);
      const response = await fetch(`${API_URL}/requests`);
      const data = await response.json();
      const incomingRequests = Array.isArray(data) ? data : [];
      const deletedSet = new Set((loadSavedState().deletedRequestIds || deletedRequestIds).map(String));
      setRequests(incomingRequests.filter((item) => !deletedSet.has(String(item.id))));
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

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          auctionRequests,
          offers,
          currentMaster,
          deletedRequestIds,
        })
      );
    } catch (error) {
      console.error("Demo kayıt verisi saklanamadı:", error);
    }
  }, [auctionRequests, offers, currentMaster, deletedRequestIds]);

  useEffect(() => {
    const syncSavedState = () => {
      const freshState = loadSavedState();

      if (Array.isArray(freshState.auctionRequests)) {
        setAuctionRequests(freshState.auctionRequests);
      }

      if (Array.isArray(freshState.offers)) {
        setOffers(freshState.offers);
      }

      if (freshState.currentMaster && isMasterLoggedIn) {
        setCurrentMaster(freshState.currentMaster);
      }

      if (Array.isArray(freshState.deletedRequestIds)) {
        setDeletedRequestIds(freshState.deletedRequestIds);
      }
    };

    const handleStorage = (event) => {
      if (event.key === STORAGE_KEY) {
        syncSavedState();
      }
    };

    const handleVisibility = () => {
      if (!document.hidden) {
        syncSavedState();
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", syncSavedState);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", syncSavedState);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isMasterLoggedIn]);

  const getService = (item) => item.service || item.serviceType || "Belirtilmedi";

  const getDate = (item) => {
    if (item.date) return item.date;
    if (!item.createdAt) return "";
    return new Date(item.createdAt).toLocaleString("tr-TR");
  };

  const getStatusClass = (status) => {
    const value = status || "İhalede";

    if (value === "İhalede") return "bg-blue-600 text-white";
    if (value === "Ustaya Yönlendirildi") return "bg-yellow-600 text-white";
    if (value === "Tamamlandı") return "bg-green-600 text-white";
    if (value === "İş İptal Oldu") return "bg-black text-white";
    if (value === "İhale Başarısız Oldu" || value === "İhale Sonuçlandırılamadı") return "bg-red-700 text-white";

    return "bg-slate-700 text-white";
  };

  const getAuctionForRequest = (item) => {
    const itemId = String(item.id);
    return auctionRequests.find((auction) => String(auction.requestSourceId) === itemId || auction.id === `request-${item.id}`);
  };

  const getAuctionStatusLabel = (request) => {
    if (!request) return "İhalede";
    if (request.status === "auction") return "İhalede";
    if (request.status === "unresolved") return "İhale Başarısız Oldu";
    if (request.status === "won") {
      if (request.jobStatus === "Tamamlandı") return "İş tamamlandı";
      if (request.jobStatus === "İptal Edildi") return "İş iptal oldu";
      return "Ustaya Yönlendirildi";
    }
    return "İhalede";
  };

  const getAuctionStatusClass = (request) => {
    if (!request || request.status === "auction") return "bg-blue-700 text-white px-3 py-1 rounded-lg text-xs font-black";
    if (request.status === "unresolved") return "bg-red-700 text-white px-3 py-1 rounded-lg text-xs font-black";
    if (request.jobStatus === "Tamamlandı") return "bg-green-700 text-white px-3 py-1 rounded-lg text-xs font-black";
    if (request.jobStatus === "İptal Edildi") return "bg-black text-white px-3 py-1 rounded-lg text-xs font-black";
    return "bg-emerald-700 text-white px-3 py-1 rounded-lg text-xs font-black";
  };

  const getUnifiedRequestStatus = (item) => {
    const auction = getAuctionForRequest(item);
    if (!auction) return item.status || "İhalede";
    if (auction.status === "auction") return "İhalede";
    if (auction.status === "won") {
      if (auction.jobStatus === "Tamamlandı") return "Tamamlandı";
      if (auction.jobStatus === "İptal Edildi") return "İş İptal Oldu";
      return "Ustaya Yönlendirildi";
    }
    if (auction.status === "unresolved") return "İhale Sonuçlandırılamadı";
    return item.status || "İhalede";
  };

  const instagramCount = requests.filter((item) => item.source === "Instagram DM").length;
  const siteCount = requests.filter((item) => item.source !== "Instagram DM").length;
  const newCount = auctionRequests.filter((item) => item.status === "auction" && item.endsAt > now && !deletedRequestIds.map(String).includes(String(item.requestSourceId)) && (requests.length === 0 || item.requestSourceId === undefined || requests.some((req) => String(req.id) === String(item.requestSourceId)))).length;

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
  }, [requests, deletedRequestIds]);

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
      const itemStatus = getUnifiedRequestStatus(item);
      const matchesFilter = filter === "Tümü" || itemStatus === filter;

      return matchesSearch && matchesFilter;
    });
  }, [requests, search, filter, auctionRequests, deletedRequestIds]);

  const liveRequestIdSet = useMemo(() => new Set(requests.map((item) => String(item.id))), [requests]);

  const visibleAuctionRequests = useMemo(() => {
    const deletedSet = new Set(deletedRequestIds.map(String));
    return auctionRequests.filter((request) => {
      const sourceId = request.requestSourceId;
      if (sourceId !== undefined && sourceId !== null && deletedSet.has(String(sourceId))) return false;
      if (requests.length > 0 && sourceId !== undefined && sourceId !== null && !liveRequestIdSet.has(String(sourceId))) return false;
      return true;
    });
  }, [auctionRequests, deletedRequestIds, requests.length, liveRequestIdSet]);

  const auctionPageSize = 10;
  const auctionTotalPages = Math.max(1, Math.ceil(visibleAuctionRequests.length / auctionPageSize));
  const safeAuctionPage = Math.min(auctionPage, auctionTotalPages);
  const paginatedAuctionRequests = visibleAuctionRequests.slice(
    (safeAuctionPage - 1) * auctionPageSize,
    safeAuctionPage * auctionPageSize
  );

  const requestTotalPages = Math.max(1, Math.ceil(filteredRequests.length / requestPageSize));
  const safeRequestPage = Math.min(requestPage, requestTotalPages);
  const paginatedFilteredRequests = filteredRequests.slice(
    (safeRequestPage - 1) * requestPageSize,
    safeRequestPage * requestPageSize
  );

  useEffect(() => {
    if (auctionPage > auctionTotalPages) setAuctionPage(auctionTotalPages);
  }, [auctionPage, auctionTotalPages]);

  useEffect(() => {
    setRequestPage(1);
  }, [search, filter, requestPageSize]);

  useEffect(() => {
    if (requestPage > requestTotalPages) setRequestPage(requestTotalPages);
  }, [requestPage, requestTotalPages]);


  const buildAuctionFromRequest = (item) => {
    const createdTime = item.createdAt ? new Date(item.createdAt).getTime() : NaN;
    const startTime = Number.isFinite(createdTime) ? createdTime : Date.now();

    return {
      id: `request-${item.id}`,
      requestSourceId: item.id,
      title: getService(item),
      district: item.district || "Belirtilmedi",
      description: item.description || `${getService(item)} hizmet talebi`,
      customerName: item.name || "Müşteri",
      customerPhone: item.phone || "",
      source: item.source || "Site Formu",
      status: item.status === "Tamamlandı" ? "won" : "auction",
      winnerMasterId: null,
      winnerMasterName: null,
      winningOfferAmount: null,
      createdAt: item.createdAt || new Date().toISOString(),
      endsAt: startTime + 15 * 60 * 1000,
      auctionFingerprint: [
        item.id || "",
        item.phone || "",
        getService(item),
        item.district || "",
        item.createdAt || "",
      ].join("|"),
    };
  };

  useEffect(() => {
    if (!requests.length) return;

    const deletedSet = new Set(deletedRequestIds.map(String));
    setAuctionRequests((prev) => {
      const existingIds = new Set(prev.map((auction) => auction.requestSourceId || auction.id));
      const existingFingerprints = new Set(prev.map((auction) => getAuctionFingerprint(auction)));
      const newAuctions = requests
        .filter((item) => item.id !== undefined && item.id !== null)
        .filter((item) => !deletedSet.has(String(item.id)))
        .filter((item) => !["Tamamlandı", "İş İptal Oldu", "İhale Başarısız Oldu"].includes(getUnifiedRequestStatus(item)))
        .map(buildAuctionFromRequest)
        .filter((auction) => !existingIds.has(auction.requestSourceId) && !existingFingerprints.has(getAuctionFingerprint(auction)));

      if (newAuctions.length === 0) return prev;
      return [...newAuctions, ...prev];
    });
  }, [requests, deletedRequestIds]);

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
        const createdRequest = data.request || data.data || {
          id: `local-${Date.now()}`,
          name: "Müşteri",
          phone: form.phone,
          district: form.district,
          serviceType: form.service,
          description: form.service + " hizmet talebi",
          source: "Site Formu",
          createdAt: new Date().toISOString(),
        };

        setAuctionRequests((prev) => [buildAuctionFromRequest(createdRequest), ...prev]);
        alert("Talep başarıyla oluşturuldu. İhale takibinde 15 dakikalık sayaç başladı.");
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

  const masterLogin = (e) => {
    e.preventDefault();
    const cleanPhone = masterLoginPhone.replace(/\s/g, "");
    const foundMaster = MASTER_ACCOUNTS.find((master) => master.phone.replace(/\s/g, "") === cleanPhone);

    if (!foundMaster) {
      setMasterLoginError("Bu telefon numarası ile kayıtlı usta bulunamadı.");
      return;
    }

    setCurrentMaster((prev) => (prev?.id === foundMaster.id ? prev : foundMaster));
    setIsMasterLoggedIn(true);
    setMasterLoginError("");
    setMasterTab("auctions");
  };

  const masterRegister = (e) => {
    e.preventDefault();

    if (!masterLoginName.trim() || !masterLoginPhone.trim()) {
      setMasterLoginError("Lütfen ad soyad ve telefon bilgisi gir.");
      return;
    }

    const newMaster = {
      id: Date.now(),
      name: masterLoginName.trim(),
      phone: masterLoginPhone.trim(),
      district: "İzmir",
      balance: 100,
      completedCount: 0,
      cancelledCount: 0,
    };

    setCurrentMaster(newMaster);
    setIsMasterLoggedIn(true);
    setMasterLoginError("");
    setMasterTab("auctions");
  };

  const masterLogout = () => {
    setIsMasterLoggedIn(false);
    setMasterTab("auctions");
    setPage("home");
  };

  const updateStatus = (id, status) => {
    setRequests((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));

    setAuctionRequests((prev) =>
      prev.map((auction) => {
        if (String(auction.requestSourceId) !== String(id) && auction.id !== `request-${id}`) return auction;

        if (status === "İhalede") {
          return { ...auction, status: "auction", jobStatus: undefined, unresolvedAt: undefined, adminResultNote: undefined };
        }

        if (status === "Ustaya Yönlendirildi") {
          return { ...auction, status: "won", jobStatus: "Ustaya Yönlendirildi" };
        }

        if (status === "İhale Başarısız Oldu" || status === "İhale Sonuçlandırılamadı") {
          return { ...auction, status: "unresolved", adminResultNote: "İhale sonuçlandırılamadı", unresolvedAt: new Date().toISOString() };
        }

        if (status === "Tamamlandı") {
          return { ...auction, status: "won", jobStatus: "Tamamlandı", completedAt: new Date().toISOString() };
        }

        if (status === "İş İptal Oldu") {
          return { ...auction, status: "won", jobStatus: "İptal Edildi", cancelledAt: new Date().toISOString() };
        }

        return auction;
      })
    );
  };

  const toggleSelectedRequest = (id) => {
    const value = String(id);
    setSelectedRequestIds((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const deleteSelectedRequests = () => {
    if (selectedRequestIds.length === 0) return;

    const confirmDelete = confirm(`${selectedRequestIds.length} seçili işi silmek istediğine emin misin?`);
    if (!confirmDelete) return;

    const selectedSet = new Set(selectedRequestIds.map(String));
    setDeletedRequestIds((prev) => Array.from(new Set([...prev.map(String), ...selectedSet])));
    setRequests((prev) => prev.filter((item) => !selectedSet.has(String(item.id))));
    setAuctionRequests((prev) =>
      prev.filter((auction) => !selectedSet.has(String(auction.requestSourceId)) && !selectedSet.has(String(auction.id).replace("request-", "")))
    );
    setOffers((prev) =>
      prev.filter((offer) => !selectedSet.has(String(offer.requestSourceId)) && !selectedSet.has(String(offer.requestId).replace("request-", "")))
    );
    setSelectedRequestIds([]);
  };

  const handleRequestDeleteButton = () => {
    if (selectedRequestIds.length > 0) {
      deleteSelectedRequests();
      return;
    }
    clearRequests();
  };

  const clearRequests = async () => {
    const confirmDelete = confirm("Tüm talepleri temizlemek istediğine emin misin?");
    if (!confirmDelete) return;

    try {
      await fetch(`${API_URL}/requests`, {
        method: "DELETE",
      });

      setRequests([]);
      setAuctionRequests([]);
      setOffers([]);
      setSelectedRequestIds([]);
      setDeletedRequestIds([]);
      await fetchRequests();
    } catch (error) {
      console.error(error);
      alert("Talepler temizlenemedi.");
    }
  };


  const refreshAll = async () => {
    const freshState = loadSavedState();
    if (Array.isArray(freshState.auctionRequests)) setAuctionRequests(freshState.auctionRequests);
    if (Array.isArray(freshState.offers)) setOffers(freshState.offers);
    if (Array.isArray(freshState.deletedRequestIds)) setDeletedRequestIds(freshState.deletedRequestIds);
    if (freshState.currentMaster && isMasterLoggedIn) setCurrentMaster(freshState.currentMaster);
    await fetchRequests();
  };

  const getWhatsappLink = (item) => {
    const cleanPhone = (item.phone || "").replace(/[^0-9]/g, "").replace(/^0/, "");
    const message = encodeURIComponent(
      "Merhaba, " + getService(item) + " talebiniz için size teklif vermek istiyoruz."
    );

    return "https://wa.me/90" + cleanPhone + "?text=" + message;
  };

  const getAuctionFingerprint = (item) => {
    return [
      item.requestSourceId || item.id || "",
      item.customerPhone || item.phone || "",
      item.title || getService(item),
      item.district || "",
      item.createdAt || "",
    ].join("|");
  };

  const getAuctionOffers = (requestId) => offers.filter((offer) => offer.requestId === requestId);

  const getAuctionOffersForRequest = (request) => {
    const fingerprint = getAuctionFingerprint(request);
    return offers.filter((offer) => {
      return (
        String(offer.requestId) === String(request.id) ||
        String(offer.requestSourceId) === String(request.requestSourceId) ||
        String(offer.requestId).replace("request-", "") === String(request.requestSourceId) ||
        offer.auctionFingerprint === fingerprint
      );
    });
  };

  const getLowestOffer = (requestId) => {
    const requestOffers = getAuctionOffers(requestId).filter((offer) => offer.status !== "cancelled");
    if (requestOffers.length === 0) return null;
    return Math.min(...requestOffers.map((offer) => offer.amount));
  };

  const getLowestOfferForRequest = (request) => {
    const requestOffers = getAuctionOffersForRequest(request).filter((offer) => offer.status !== "cancelled");
    if (requestOffers.length === 0) return null;
    return Math.min(...requestOffers.map((offer) => offer.amount));
  };


  const getBaseMasterBalance = (master = currentMaster) => {
    const account = MASTER_ACCOUNTS.find((item) => item.id === master?.id);
    return Number(account?.balance ?? master?.initialBalance ?? master?.balance ?? 0);
  };

  const getAuctionChargeKey = (offer) => {
    return String(offer.auctionFingerprint || offer.requestId || offer.requestSourceId || "");
  };

  const getChargedAuctionCountForMaster = (masterId = currentMaster.id) => {
    const chargedKeys = new Set();
    offers.forEach((offer) => {
      if (offer.masterId !== masterId) return;
      if (Number(offer.participationFee || 0) <= 0) return;
      if (offer.status === "lost_refunded") return;
      chargedKeys.add(getAuctionChargeKey(offer));
    });
    return chargedKeys.size;
  };

  const getEffectiveMasterBalance = (master = currentMaster) => {
    const baseBalance = getBaseMasterBalance(master);
    const topUpTotal = Number(master?.topUpTotal || 0);
    const chargedTotal = getChargedAuctionCountForMaster(master?.id) * PARTICIPATION_FEE;
    return baseBalance + topUpTotal - chargedTotal;
  };

  const addMasterBalance = (amount) => {
    setCurrentMaster((prev) => ({
      ...prev,
      topUpTotal: Number(prev.topUpTotal || 0) + amount,
      balance: getEffectiveMasterBalance(prev) + amount,
    }));
  };

  const formatTimeLeft = (endsAt) => {
    const diff = Math.max(0, endsAt - now);
    const minutes = Math.floor(diff / 1000 / 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const placeOffer = (requestId) => {
    const amount = Number(bidAmounts[requestId]);
    const request = auctionRequests.find((item) => item.id === requestId);

    if (!request || request.status !== "auction") {
      alert("Bu ihale artık kapalı.");
      return;
    }

    if (!amount || amount <= 0) {
      alert("Lütfen geçerli bir teklif tutarı gir.");
      return;
    }

    const lowestOffer = getLowestOfferForRequest(request);

    if (lowestOffer !== null && amount >= lowestOffer) {
      alert(`Teklifin mevcut en düşük tekliften düşük olmalı. Mevcut en düşük teklif: ${lowestOffer} TL`);
      return;
    }

    const currentAuctionOffers = getAuctionOffersForRequest(request);
    const masterAlreadyPaidForAuction = currentAuctionOffers.some(
      (offer) => offer.masterId === currentMaster.id && Number(offer.participationFee || 0) > 0
    );

    if (!masterAlreadyPaidForAuction && getEffectiveMasterBalance() < PARTICIPATION_FEE) {
      alert("Yetersiz bakiye.");
      return;
    }

    const newOffer = {
      id: Date.now().toString(),
      requestId,
      requestSourceId: request.requestSourceId,
      auctionFingerprint: getAuctionFingerprint(request),
      masterId: currentMaster.id,
      masterName: currentMaster.name,
      amount,
      participationFee: masterAlreadyPaidForAuction ? 0 : PARTICIPATION_FEE,
      status: "auction",
      createdAt: new Date().toISOString(),
    };

    setOffers((prev) => [...prev, newOffer]);

    if (!masterAlreadyPaidForAuction) {
      setCurrentMaster((prev) => ({
        ...prev,
        balance: Math.max(0, getEffectiveMasterBalance(prev) - PARTICIPATION_FEE),
      }));
    }

    setBidAmounts((prev) => ({ ...prev, [requestId]: "" }));
    alert("Teklif başarıyla verildi.");
  };

  const finishAuction = (requestId) => {
    const currentAuction = auctionRequests.find((request) => request.id === requestId);
    const requestOffers = currentAuction
      ? getAuctionOffersForRequest(currentAuction).filter((offer) => offer.status === "auction")
      : getAuctionOffers(requestId).filter((offer) => offer.status === "auction");

    if (requestOffers.length === 0) {
      setAuctionRequests((prev) =>
        prev.map((request) =>
          request.id === requestId
            ? {
                ...request,
                status: "unresolved",
                unresolvedAt: new Date().toISOString(),
                adminResultNote: "İhale sonuçlandırılamadı",
              }
            : request
        )
      );
      return;
    }

    const winningOffer = requestOffers.reduce((lowest, offer) =>
      offer.amount < lowest.amount ? offer : lowest
    );

    const currentMasterOffersInAuction = requestOffers.filter((offer) => offer.masterId === currentMaster.id);
    const currentMasterWon = winningOffer.masterId === currentMaster.id;
    const refundAmountForCurrentMaster = currentMasterWon
      ? 0
      : Math.max(0, ...currentMasterOffersInAuction.map((offer) => Number(offer.participationFee || 0)));

    if (refundAmountForCurrentMaster > 0) {
      setCurrentMaster((prev) => ({ ...prev, balance: getEffectiveMasterBalance(prev) + refundAmountForCurrentMaster }));
    }

    setOffers((prev) =>
      prev.map((offer) => {
        const belongsToAuction = currentAuction
          ? offer.requestId === requestId || offer.requestSourceId === currentAuction.requestSourceId || offer.auctionFingerprint === getAuctionFingerprint(currentAuction)
          : offer.requestId === requestId;
        if (!belongsToAuction) return offer;
        if (offer.masterId === winningOffer.masterId) return { ...offer, status: "won" };
        return { ...offer, status: "lost_refunded" };
      })
    );

    setAuctionRequests((prev) =>
      prev.map((request) =>
        request.id === requestId
          ? {
              ...request,
              status: "won",
              winnerMasterId: winningOffer.masterId,
              winnerMasterName: winningOffer.masterName,
              winningOfferAmount: winningOffer.amount,
              jobStatus: "Ustaya Yönlendirildi",
              wonAt: new Date().toISOString(),
            }
          : request
      )
    );
  };

  useEffect(() => {
    auctionRequests
      .filter((request) => request.status === "auction" && request.endsAt <= now)
      .forEach((request) => finishAuction(request.id));
  }, [now, auctionRequests, offers]);

  const markJobCompleted = (jobId) => {
    setAuctionRequests((prev) =>
      prev.map((job) =>
        job.id === jobId
          ? {
              ...job,
              jobStatus: "Tamamlandı",
              completedAt: new Date().toISOString(),
            }
          : job
      )
    );

    setCurrentMaster((prev) => ({
      ...prev,
      completedCount: prev.completedCount + 1,
    }));
  };

  const confirmCancelJob = () => {
    if (!cancelModalJob) return;
    if (!cancelNote.trim()) {
      alert("Lütfen işin neden iptal olduğunu açıklama alanına yaz.");
      return;
    }

    setAuctionRequests((prev) =>
      prev.map((job) =>
        job.id === cancelModalJob.id
          ? {
              ...job,
              jobStatus: "İptal Edildi",
              cancelReason,
              cancelNote,
              cancelledAt: new Date().toISOString(),
            }
          : job
      )
    );

    setCurrentMaster((prev) => ({
      ...prev,
      cancelledCount: prev.cancelledCount + 1,
    }));

    setCancelModalJob(null);
    setCancelReason("Müşteri cevap vermedi");
    setCancelNote("");
  };

  const masterOffers = offers.filter((offer) => offer.masterId === currentMaster.id);
  const openAuctions = visibleAuctionRequests.filter((request) => request.status === "auction" && request.endsAt > now);
  const myJobs = visibleAuctionRequests.filter(
    (request) => request.status === "won" && request.winnerMasterId === currentMaster.id
  );
  const filteredMyJobs = myJobs.filter((job) => {
    if (jobFilter === "Tümü") return true;
    if (jobFilter === "Devam Eden") return !["Tamamlandı", "İptal Edildi"].includes(job.jobStatus);
    if (jobFilter === "Tamamlanan") return job.jobStatus === "Tamamlandı";
    if (jobFilter === "İptal Olan") return job.jobStatus === "İptal Edildi";
    return true;
  });
  const completedJobs = myJobs.filter((job) => job.jobStatus === "Tamamlandı").length;
  const cancelledJobs = myJobs.filter((job) => job.jobStatus === "İptal Edildi").length;
  const activeJobs = myJobs.filter((job) => !["Tamamlandı", "İptal Edildi"].includes(job.jobStatus)).length;

  if (page === "master" && !isMasterLoggedIn) {
    return (
      <div className="min-h-screen bg-[#020718] flex items-center justify-center px-5 text-slate-950">
        <div className="bg-white w-full max-w-md rounded-[28px] shadow-2xl p-8">
          <button onClick={() => setPage("home")} className="text-sm font-bold text-blue-900 mb-6">
            ← Ana sayfaya dön
          </button>

          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center text-5xl mb-4">👷</div>
            <h1 className="text-3xl font-black text-slate-950">Usta Girişi</h1>
            <p className="text-slate-500 mt-2">İhalelere teklif vermek ve kazandığın işleri görmek için giriş yap.</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <button onClick={() => setMasterAuthMode("login")} className={`rounded-xl py-3 font-black ${masterAuthMode === "login" ? "bg-blue-900 text-white" : "bg-slate-100"}`}>Giriş Yap</button>
            <button onClick={() => setMasterAuthMode("register")} className={`rounded-xl py-3 font-black ${masterAuthMode === "register" ? "bg-blue-900 text-white" : "bg-slate-100"}`}>Üye Ol</button>
          </div>

          <form onSubmit={masterAuthMode === "login" ? masterLogin : masterRegister} className="space-y-4">
            {masterAuthMode === "register" && (
              <div>
                <label className="text-sm font-bold text-slate-700">Ad Soyad</label>
                <input value={masterLoginName} onChange={(e) => setMasterLoginName(e.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-4 outline-none focus:ring-2 focus:ring-blue-900" placeholder="Örn: Mehmet Usta" />
              </div>
            )}

            <div>
              <label className="text-sm font-bold text-slate-700">Telefon numarası</label>
              <input value={masterLoginPhone} onChange={(e) => setMasterLoginPhone(e.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-4 outline-none focus:ring-2 focus:ring-blue-900" placeholder="0555 000 00 00" />
            </div>

            {masterLoginError && <div className="rounded-2xl bg-red-50 text-red-600 p-3 text-sm">{masterLoginError}</div>}

            <button className="w-full rounded-2xl bg-blue-900 text-white py-4 font-black hover:bg-blue-950 transition">
              {masterAuthMode === "login" ? "Usta Paneline Gir" : "Üyeliği Oluştur"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">Demo usta girişi: <b>0555 000 00 00</b></p>
        </div>
      </div>
    );
  }

  if (page === "master") {
    return (
      <div className="min-h-screen bg-[#f4f7fb] text-slate-950">
        <div className="flex">
          <aside className="hidden lg:flex w-[250px] min-h-screen bg-[#061b34] text-white fixed left-0 top-0 flex-col justify-between shadow-2xl">
            <div>
              <div className="p-7 border-b border-white/10">
                <button onClick={() => setPage("home")} className="flex items-center gap-2 text-2xl font-black">
                  <span className="text-yellow-400">⚡</span> UstaHızlı
                </button>
                <p className="text-xs text-slate-300 mt-1">Usta Paneli</p>
              </div>

              <div className="p-6 text-center border-b border-white/10">
                <div className="w-20 h-20 mx-auto rounded-full bg-yellow-100 flex items-center justify-center text-5xl mb-3">👷</div>
                <h2 className="font-black text-xl">{currentMaster.name}</h2>
                <p className="text-sm text-slate-300">{currentMaster.district} / İzmir</p>

                <div className="mt-5 rounded-2xl bg-white/5 border border-white/10 p-4">
                  <p className="text-sm text-slate-300">Bakiyem</p>
                  <p className="text-2xl font-black text-green-400">{getEffectiveMasterBalance()},00 TL</p>
                  <button
                    onClick={() => addMasterBalance(100)}
                    className="mt-3 w-full border border-green-400 text-green-400 rounded-xl py-2 font-black hover:bg-green-400 hover:text-slate-950 transition"
                  >
                    Bakiye Yükle
                  </button>
                </div>
              </div>

              <nav className="p-4 space-y-2">
                <MasterNavButton active={masterTab === "auctions"} onClick={() => setMasterTab("auctions")} icon="📋" label="Açık İhaleler" />
                <MasterNavButton active={masterTab === "offers"} onClick={() => setMasterTab("offers")} icon="🧾" label="Tekliflerim" />
                <MasterNavButton active={masterTab === "jobs"} onClick={() => setMasterTab("jobs")} icon="💼" label="İşlerim" />
                <MasterNavButton active={masterTab === "balance"} onClick={() => setMasterTab("balance")} icon="💳" label="Bakiye" />
                <MasterNavButton active={masterTab === "profile"} onClick={() => setMasterTab("profile")} icon="👤" label="Profilim" />
              </nav>
            </div>

            <button onClick={masterLogout} className="m-6 text-left text-slate-300 font-bold hover:text-white">
              ↪ Çıkış Yap
            </button>
          </aside>

          <main className="lg:ml-[250px] w-full min-h-screen p-5 lg:p-8">
            {masterTab === "auctions" && (
              <section>
                <div className="flex flex-col xl:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <div>
                        <h1 className="text-3xl font-black">Usta Paneli - Açık İhaleler</h1>
                        <p className="text-slate-500 mt-1">En düşük teklifin altına teklif vererek ihaleye katıl.</p>
                      </div>
                      <button onClick={() => setPage("home")} className="lg:hidden bg-[#061b34] text-white rounded-xl px-4 py-3 font-black">
                        Ana Sayfa
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
                      <MasterStat icon="📄" title="Açık İhale" value={openAuctions.length} />
                      <MasterStat icon="🧾" title="Tekliflerim" value={masterOffers.length} />
                      <MasterStat icon="💼" title="Kazanılan İş" value={myJobs.length} />
                      <MasterStat icon="💳" title="Bakiye" value={`${getEffectiveMasterBalance()},00 TL`} green />
                    </div>

                    <div className="space-y-4">
                      {openAuctions.map((request) => {
                        const lowestOffer = getLowestOfferForRequest(request);
                        return (
                          <div key={request.id} className="bg-white rounded-2xl shadow-md border border-slate-200 p-4 grid grid-cols-1 xl:grid-cols-[1.1fr_0.5fr_0.8fr] gap-5 items-center">
                            <div className="flex gap-4">
                              <div className="hidden md:flex w-36 h-36 rounded-xl bg-slate-100 items-center justify-center text-6xl shrink-0">
                                {request.title.includes("Avize") ? "💡" : request.title.includes("Priz") ? "🔌" : "🚰"}
                              </div>
                              <div>
                                <h2 className="text-2xl font-black">{request.title}</h2>
                                <p className="text-sm text-slate-500 mt-1">📍 {request.district} / İzmir</p>
                                <p className="mt-3 text-sm">{request.description}</p>
                                <p className="mt-4 text-sm font-bold text-red-600">⏱️ İhale Bitiş Süresi <span className="text-xl ml-2">{formatTimeLeft(request.endsAt)}</span></p>
                              </div>
                            </div>

                            <div className="xl:border-l xl:border-slate-200 xl:pl-6">
                              <p className="text-sm text-slate-500">Mevcut En Düşük Teklif</p>
                              <p className="text-3xl font-black text-green-700 mt-1">{lowestOffer ? `${lowestOffer} TL` : "Yok"}</p>
                              <p className="text-sm text-slate-500 mt-5">Katılım Ücreti</p>
                              <p className="font-black">{PARTICIPATION_FEE} TL</p>
                            </div>

                            <div className="xl:border-l xl:border-slate-200 xl:pl-6">
                              <p className="font-black mb-2">Teklif Ver</p>
                              <input
                                type="number"
                                value={bidAmounts[request.id] || ""}
                                onChange={(e) => setBidAmounts((prev) => ({ ...prev, [request.id]: e.target.value }))}
                                placeholder="Teklif tutarınız (TL)"
                                className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-600"
                              />
                              <p className="text-xs text-slate-500 mt-2">En düşük teklifin altına teklif vermelisiniz.</p>
                              <button onClick={() => placeOffer(request.id)} className="mt-3 w-full bg-blue-600 text-white rounded-xl py-3 font-black hover:bg-blue-700 transition">
                                15 TL Bakiye ile Teklif Ver
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="xl:w-[420px] space-y-5">
                    <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-5">
                      <h2 className="text-2xl font-black mb-4">Teklif Verme Kuralları</h2>
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm leading-7">
                        <p className="font-black text-blue-800 mb-2">ℹ️ Teklif Verme Kuralları</p>
                        <p>• Her yeni teklif, mevcut en düşük tekliften düşük olmalıdır.</p>
                        <p>• İhaleye katılım ücreti {PARTICIPATION_FEE} TL’dir.</p>
                        <p>• İhaleyi kazanamazsanız {PARTICIPATION_FEE} TL bakiyenize iade edilir.</p>
                        <p>• Sadece kazanan usta müşteri bilgilerini görebilir.</p>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-5">
                      <h2 className="text-xl font-black mb-4">Sistemin Çalışma Mantığı</h2>
                      <div className="space-y-3 text-sm text-slate-700">
                        <p>1. Yeni iş talebi açılır.</p>
                        <p>2. 15 dakikalık ihale süresi başlar.</p>
                        <p>3. Ustalar fiyat teklifi verir.</p>
                        <p>4. En düşük teklifi veren usta kazanır.</p>
                        <p>5. Kaybeden ustaların katılım ücreti iade edilir.</p>
                        <p>6. Kazanan usta müşteriyi arar ve işe başlar.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {masterTab === "offers" && (
              <section>
                <h1 className="text-3xl font-black mb-6">Tekliflerim</h1>
                <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="p-4">İş Başlığı</th>
                        <th className="p-4">İlçe</th>
                        <th className="p-4">Teklifim</th>
                        <th className="p-4">Durum</th>
                        <th className="p-4">Katılım Ücreti</th>
                      </tr>
                    </thead>
                    <tbody>
                      {masterOffers.length === 0 ? (
                        <tr><td colSpan="5" className="p-10 text-center text-slate-500">Henüz teklif vermedin.</td></tr>
                      ) : (
                        masterOffers.map((offer) => {
                          const request = auctionRequests.find((item) => item.id === offer.requestId || item.requestSourceId === offer.requestSourceId || item.auctionFingerprint === offer.auctionFingerprint);
                          return (
                            <tr key={offer.id} className="border-t">
                              <td className="p-4 font-bold">{request?.title}</td>
                              <td className="p-4">{request?.district}</td>
                              <td className="p-4 font-black">{offer.amount} TL</td>
                              <td className="p-4"><OfferBadge status={offer.status} /></td>
                              <td className="p-4">{offer.participationFee} TL {offer.status === "lost_refunded" && <span className="text-green-600 font-bold">(iade edildi)</span>}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="mt-5 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl p-4 text-sm font-bold">
                  Kaybettiğiniz ihalelerin 15 TL katılım ücreti bakiyenize iade edilir.
                </div>
              </section>
            )}

            {masterTab === "jobs" && (
              <section>
                <div className="flex flex-col xl:flex-row gap-6">
                  <div className="flex-1">
                    <h1 className="text-3xl font-black">İşlerim</h1>
                    <p className="text-slate-500 mt-1 mb-6">Kazanmış olduğunuz tüm işleri bu sayfada görebilirsiniz.</p>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <MasterStat icon="📄" title="Toplam İş" value={myJobs.length} />
                      <MasterStat icon="✅" title="Tamamlanan" value={completedJobs} green />
                      <MasterStat icon="❌" title="İptal Olan" value={cancelledJobs} />
                      <MasterStat icon="🕒" title="Devam Eden" value={activeJobs} />
                    </div>

                    <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-4 mb-4 flex gap-6 text-sm font-bold overflow-x-auto">
                      {["Tümü", "Devam Eden", "Tamamlanan", "İptal Olan"].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setJobFilter(tab)}
                          className={jobFilter === tab ? "text-blue-600 border-b-2 border-blue-600 pb-2" : "pb-2 text-slate-950 hover:text-blue-600"}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-4">
                      {filteredMyJobs.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-10 text-center text-slate-500">
                          {jobFilter === "Tümü" && "Henüz kazandığınız ihale bulunmamaktadır."}
                          {jobFilter === "Devam Eden" && "Henüz devam eden işiniz bulunmamaktadır."}
                          {jobFilter === "Tamamlanan" && "Henüz tamamladığınız iş bulunmamaktadır."}
                          {jobFilter === "İptal Olan" && "Henüz iptal edilen işiniz bulunmamaktadır."}
                        </div>
                      ) : (
                        filteredMyJobs.map((job) => (
                          <div key={job.id} className="bg-white rounded-2xl shadow-md border border-slate-200 p-4 grid grid-cols-1 xl:grid-cols-[1.1fr_0.7fr_0.6fr] gap-5 items-center">
                            <div className="flex gap-4">
                              <div className="hidden md:flex w-36 h-36 rounded-xl bg-slate-100 items-center justify-center text-6xl shrink-0">
                                {job.title.includes("Avize") ? "💡" : job.title.includes("Priz") ? "🔌" : "🚰"}
                              </div>
                              <div>
                                <span className="inline-block bg-green-700 text-white text-xs rounded-lg px-3 py-1 font-black mb-3">🏆 KAZANILDI</span>
                                <h2 className="text-2xl font-black">{job.title}</h2>
                                <p className="text-sm text-slate-500 mt-1">📍 {job.district} / İzmir</p>
                                <p className="mt-3 text-sm">{job.description}</p>
                                <p className="text-sm text-slate-500 mt-5">Kazandığınız Teklif</p>
                                <p className="text-3xl font-black text-green-700">{job.winningOfferAmount} TL</p>
                              </div>
                            </div>

                            <div className="xl:border-l xl:border-slate-200 xl:pl-6">
                              <p className="font-black mb-3">Müşteri Bilgileri</p>
                              <p>👤 <b>{job.customerName}</b></p>
                              <p className="mt-2">📞 <b>{job.customerPhone}</b></p>
                              <p className="text-sm text-slate-500 mt-5">Kazandığı Tarih</p>
                              <p className="font-bold">{job.wonAt ? new Date(job.wonAt).toLocaleString("tr-TR") : "-"}</p>
                            </div>

                            <div>
                              <div className={job.jobStatus === "İptal Edildi" ? "bg-red-50 text-red-700 rounded-xl p-4 mb-4" : "bg-green-50 text-green-700 rounded-xl p-4 mb-4"}>
                                <p className="text-sm text-slate-600">Durum</p>
                                <p className="font-black">{job.jobStatus || "Devam Ediyor"}</p>
                                {job.cancelReason && <p className="text-sm mt-3"><b>İptal Sebebi:</b> {job.cancelReason}</p>}
                              </div>

                              <div className="grid grid-cols-1 gap-2">
                                <a href={`tel:${job.customerPhone}`} className="text-center border border-green-300 bg-green-50 text-green-700 rounded-xl py-3 font-black hover:bg-green-100 transition">
                                  📞 Telefonu Ara
                                </a>
                                <button
                                  disabled={job.jobStatus === "Tamamlandı" || job.jobStatus === "İptal Edildi"}
                                  onClick={() => markJobCompleted(job.id)}
                                  className="border border-blue-300 text-blue-700 rounded-xl py-3 font-black disabled:opacity-40 hover:bg-blue-50 transition"
                                >
                                  ✅ Tamamlandı Olarak İşaretle
                                </button>
                                <button
                                  disabled={job.jobStatus === "Tamamlandı" || job.jobStatus === "İptal Edildi"}
                                  onClick={() => setCancelModalJob(job)}
                                  className="border border-red-300 text-red-700 rounded-xl py-3 font-black disabled:opacity-40 hover:bg-red-50 transition"
                                >
                                  ❌ İş İptal Oldu
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="xl:w-[420px] space-y-5">
                    <div className="bg-white rounded-2xl shadow-md border border-blue-200 p-5">
                      <h2 className="text-xl font-black mb-4">İş Durumları Hakkında</h2>
                      <div className="space-y-3 text-sm">
                        <p><b className="text-green-700">Ustaya Yönlendirildi:</b> Müşteri bilgileri ustaya verildi, iş devam ediyor.</p>
                        <p><b className="text-green-700">Tamamlandı:</b> İş başarıyla tamamlandı.</p>
                        <p><b className="text-red-700">İptal Edildi:</b> İş iptal edildi.</p>
                      </div>
                      <p className="text-sm text-slate-500 mt-5">Çok fazla iptal, ileride usta puanınızı düşürebilir.</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-5">
                      <h2 className="text-xl font-black mb-4">Performansınız</h2>
                      <div className="flex justify-between border-b py-3">
                        <span>🏆 Tamamlanan İş Oranı</span>
                        <b className="text-green-700">%{myJobs.length ? Math.round((completedJobs / myJobs.length) * 100) : 0}</b>
                      </div>
                      <div className="flex justify-between py-3">
                        <span>🚨 İptal Oranı</span>
                        <b className="text-red-700">%{myJobs.length ? Math.round((cancelledJobs / myJobs.length) * 100) : 0}</b>
                      </div>
                    </div>
                  </div>
                </div>

                {cancelModalJob && (
                  <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                      <div className="flex justify-between items-center border-b pb-4 mb-4">
                        <h2 className="text-2xl font-black">İşi İptal Et</h2>
                        <button onClick={() => setCancelModalJob(null)} className="text-2xl">×</button>
                      </div>

                      <p className="font-bold mb-3">İptal sebebini seçiniz:</p>
                      <div className="space-y-3 mb-5">
                        {["Müşteri cevap vermedi", "Müşteri vazgeçti", "Fiyat anlaşmazlığı", "Adres yanlış", "Diğer"].map((reason) => (
                          <label key={reason} className="flex items-center gap-3">
                            <input type="radio" checked={cancelReason === reason} onChange={() => setCancelReason(reason)} />
                            {reason}
                          </label>
                        ))}
                      </div>

                      <label className="font-bold text-sm">Açıklama (isteğe bağlı)</label>
                      <textarea
                        value={cancelNote}
                        onChange={(e) => setCancelNote(e.target.value)}
                        placeholder="Açıklama yazabilirsiniz..."
                        className="mt-2 w-full min-h-[100px] rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-600"
                      />

                      <div className="grid grid-cols-2 gap-3 mt-5">
                        <button onClick={() => setCancelModalJob(null)} className="rounded-xl border py-3 font-black">Vazgeç</button>
                        <button onClick={confirmCancelJob} className="rounded-xl bg-red-600 text-white py-3 font-black">İşi İptal Et</button>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            )}

            {masterTab === "balance" && (
              <section>
                <h1 className="text-3xl font-black mb-6">Bakiye</h1>
                <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 mb-5 flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <p className="text-slate-500">Mevcut Bakiye</p>
                    <h2 className="text-4xl font-black text-green-700">{getEffectiveMasterBalance()},00 TL</h2>
                  </div>
                  <button onClick={() => addMasterBalance(100)} className="bg-blue-600 text-white rounded-xl px-8 py-3 font-black">
                    Bakiye Yükle
                  </button>
                </div>

                <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
                  <h2 className="text-xl font-black mb-4">İşlem Geçmişi</h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between border-b pb-3"><span>Bakiye Yükleme</span><b className="text-green-700">+100,00 TL</b></div>
                    {masterOffers.map((offer) => {
                      const request = auctionRequests.find((item) => item.id === offer.requestId || item.requestSourceId === offer.requestSourceId || item.auctionFingerprint === offer.auctionFingerprint);
                      return <div key={offer.id} className="flex justify-between border-b pb-3"><span>{request?.title} - Katılım Ücreti</span><b className="text-red-600">-15,00 TL</b></div>;
                    })}
                  </div>
                </div>
              </section>
            )}

            {masterTab === "profile" && (
              <section>
                <h1 className="text-3xl font-black mb-6">Profilim</h1>
                <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 max-w-xl">
                  <div className="w-24 h-24 rounded-full bg-yellow-100 flex items-center justify-center text-6xl mb-5">👷</div>
                  <p className="mb-3"><b>Ad:</b> {currentMaster.name}</p>
                  <p className="mb-3"><b>Telefon:</b> {currentMaster.phone}</p>
                  <p className="mb-3"><b>İlçe:</b> {currentMaster.district}</p>
                  <p className="mb-3"><b>Hizmetler:</b> Avize Montajı, Priz Değişimi, Elektrik Arızası</p>
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    );
  }

  if (page === "admin" && !isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#020718] flex items-center justify-center px-5">
        <div className="bg-white w-full max-w-md rounded-[28px] shadow-2xl p-8">
          <button onClick={() => setPage("home")} className="text-sm font-bold text-blue-900 mb-6">
            ← Ana sayfaya dön
          </button>

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
      <div className="min-h-screen bg-[#03142b] text-white">
        <div className="flex">
          <aside className="hidden lg:flex w-[260px] min-h-screen bg-[#021026] border-r border-blue-500/20 flex-col justify-between fixed left-0 top-0">
            <div>
              <div className="p-7 border-b border-blue-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-2xl shadow-lg">🔧</div>
                  <div>
                    <h2 className="text-xl font-black">USTA HIZLI</h2>
                    <p className="text-xs text-slate-400">Hizmet Burada</p>
                  </div>
                </div>
              </div>

              <nav className="p-5 space-y-6">
                <div>
                  <p className="text-xs text-slate-500 font-bold mb-3">ANA MENÜ</p>
                  <button className="w-full bg-blue-900/60 text-left px-4 py-3 rounded-xl font-bold">🏠 Dashboard</button>
                </div>

                <div>
                  <p className="text-xs text-slate-500 font-bold mb-3">TALEPLER</p>
                  <div className="space-y-2">
                    <button className="w-full flex justify-between px-4 py-3 rounded-xl hover:bg-white/5"><span>📋 Tüm Talepler</span><b className="bg-blue-600 px-2 rounded-lg">{requests.length}</b></button>
                    <button className="w-full flex justify-between px-4 py-3 rounded-xl hover:bg-white/5"><span>🔔 Yeni Talepler</span><b className="bg-red-600 px-2 rounded-lg">{newCount}</b></button>
                    <button className="w-full flex justify-between px-4 py-3 rounded-xl hover:bg-white/5"><span>📸 Instagram DM</span><b className="bg-pink-600 px-2 rounded-lg">{instagramCount}</b></button>
                    <button className="w-full flex justify-between px-4 py-3 rounded-xl hover:bg-white/5"><span>🌐 Site Formları</span><b className="bg-blue-600 px-2 rounded-lg">{siteCount}</b></button>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-500 font-bold mb-3">SİSTEM</p>
                  <div className="space-y-2">
                    <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5">📍 İlçe Haritası</button>
                    <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5">⚙️ Ayarlar</button>
                  </div>
                </div>
              </nav>
            </div>

            <button onClick={logout} className="m-5 text-left text-red-400 font-black">↪ Çıkış Yap</button>
          </aside>

          <main className="lg:ml-[260px] w-full min-h-screen bg-gradient-to-br from-[#03142b] via-[#062147] to-[#020718]">
            <header className="border-b border-blue-500/20 px-6 lg:px-8 py-6 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-black">Yönetim Paneli <span className="text-blue-400">●</span></h1>
                <p className="text-xs text-slate-400 mt-1">{loadingRequests ? "Talepler güncelleniyor..." : "Canlı bağlantı aktif"}</p>
              </div>

              <div className="flex items-center gap-4">
                <button onClick={() => setPage("master")} className="hidden md:block bg-blue-600 text-white rounded-2xl px-5 py-3 font-black">Usta Paneli</button>
                <button
                  onClick={() => {
                    setFilter("İhalede");
                    setTimeout(() => document.getElementById("talep-listesi")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
                  }}
                  className="relative w-12 h-12 rounded-2xl bg-[#082851] flex items-center justify-center hover:bg-[#0b3266] transition"
                  title="Yeni talepleri göster"
                >
                  🔔
                  {newCount > 0 && <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-black">{newCount}</span>}
                </button>
                <button onClick={logout} className="bg-white text-slate-950 rounded-2xl px-5 py-3 font-black lg:hidden">Çıkış yap</button>
              </div>
            </header>

            <section className="p-6 lg:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
                <AdminStat title="Toplam Talep" value={requests.length} subtitle="Tüm zamanlar" />
                <AdminStat title="Instagram DM" value={instagramCount} subtitle="Mesajdan gelen talepler" pink />
                <AdminStat title="Site Formları" value={siteCount} subtitle="Formdan gelen talepler" />
                <AdminStat title="Yeni Talepler" value={newCount} subtitle="Aksiyon bekliyor" red />
              </div>

              <div className="rounded-2xl bg-[#041b38]/90 border border-blue-400/20 overflow-hidden shadow-2xl mb-6">
                <div className="p-5 border-b border-blue-400/20">
                  <h2 className="text-2xl font-black">İhale Takibi</h2>
                  <p className="text-xs text-slate-400 mt-1">Admin panelinden canlı ihale sayaçlarını ve kazanan ustayı takip et.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#021026] text-slate-400">
                      <tr>
                        <th className="p-4">İş</th>
                        <th className="p-4">İlçe</th>
                        <th className="p-4">Açıklama</th>
                        <th className="p-4">Sayaç</th>
                        <th className="p-4">En Düşük Teklif</th>
                        <th className="p-4">Kazanan Usta</th>
                        <th className="p-4">Durum</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedAuctionRequests.map((request) => {
                        const lowestOffer = getLowestOfferForRequest(request);
                        return (
                          <tr key={request.id} className="border-t border-blue-400/10 align-top">
                            <td className="p-4 font-bold">{request.title}</td>
                            <td className="p-4">{request.district}</td>
                            <td className="p-4 max-w-[320px] text-slate-300">
                              {request.description}
                              {request.winnerMasterName && (
                                <div className="mt-2 text-green-400 font-black">
                                  Kazanan: {request.winnerMasterName} / {request.winningOfferAmount} TL
                                </div>
                              )}
                              {request.status === "unresolved" && (
                                <div className="mt-2 text-red-400 font-black">
                                  İhale başarısız oldu: teklif gelmedi.
                                </div>
                              )}
                            </td>
                            <td className="p-4 font-black text-yellow-300 whitespace-nowrap">{request.status === "auction" ? formatTimeLeft(request.endsAt) : "00:00"}</td>
                            <td className="p-4 font-black text-green-400">{lowestOffer ? `${lowestOffer} TL` : "Yok"}</td>
                            <td className="p-4">{request.winnerMasterName || "Henüz yok"}</td>
                            <td className="p-4">
                              <span className={getAuctionStatusClass(request)}>
                                {getAuctionStatusLabel(request)}
                              </span>
                              {request.jobStatus === "İptal Edildi" && (
                                <button
                                  onClick={() => setAdminCancelDetailJob(request)}
                                  className="ml-2 bg-white/10 border border-white/20 text-white px-3 py-1 rounded-lg text-xs font-black hover:bg-white/20"
                                >
                                  Açıklama
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  currentPage={safeAuctionPage}
                  totalPages={auctionTotalPages}
                  onPageChange={setAuctionPage}
                />
              </div>

              <div className="grid grid-cols-1 2xl:grid-cols-[1.35fr_0.85fr] gap-6">
                <div id="talep-listesi" className="rounded-2xl bg-[#041b38]/90 border border-blue-400/20 overflow-hidden shadow-2xl">
                  <div className="p-5 border-b border-blue-400/20 flex flex-col lg:flex-row gap-4 justify-between">
                    <div>
                      <h2 className="text-2xl font-black">Talep Listesi</h2>
                      <p className="text-xs text-slate-400 mt-1">Instagram DM ve site formları</p>
                    </div>
                    <button onClick={refreshAll} className="bg-blue-600 px-5 py-3 rounded-xl font-black">Yenile</button>
                  </div>

                  <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Hizmet, ilçe, açıklama ara" className="rounded-xl bg-[#021026] border border-blue-400/20 px-4 py-3 text-white outline-none" />
                    <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-xl bg-[#021026] border border-blue-400/20 px-4 py-3 text-white outline-none">
                      <option>Tümü</option>
                      <option>İhalede</option>
                      <option>Ustaya Yönlendirildi</option>
                      <option>Tamamlandı</option>
                      <option>İş İptal Oldu</option>
                      <option>İhale Sonuçlandırılamadı</option>
                    </select>
                    <select
                      value={requestPageSize}
                      onChange={(e) => setRequestPageSize(Number(e.target.value))}
                      className="rounded-xl bg-[#021026] border border-blue-400/20 px-4 py-3 text-white outline-none"
                    >
                      <option value={10}>10 iş göster</option>
                      <option value={20}>20 iş göster</option>
                      <option value={50}>50 iş göster</option>
                    </select>
                    <button onClick={handleRequestDeleteButton} className="rounded-xl bg-red-700 px-4 py-3 font-black text-white">{selectedRequestIds.length > 0 ? "Seçili işleri sil" : "Tüm talepleri temizle"}</button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-[#021026] text-slate-400">
                        <tr>
                          <th className="p-4 w-10"></th>
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
                          <tr><td colSpan="10" className="p-10 text-center text-slate-400">Henüz gösterilecek talep yok.</td></tr>
                        ) : (
                          paginatedFilteredRequests.map((item, index) => (
                            <tr key={item.id} className="border-t border-blue-400/10 hover:bg-white/5 align-top">
                              <td className="p-4">
                                <input
                                  type="checkbox"
                                  checked={selectedRequestIds.includes(String(item.id))}
                                  onChange={() => toggleSelectedRequest(item.id)}
                                  className="w-4 h-4 accent-red-600"
                                />
                              </td>
                              <td className="p-4 text-slate-400">#{filteredRequests.length - ((safeRequestPage - 1) * requestPageSize + index)}</td>
                              <td className="p-4"><span className={item.source === "Instagram DM" ? "bg-pink-700 text-white px-3 py-1 rounded-lg text-xs font-black" : "bg-blue-700 text-white px-3 py-1 rounded-lg text-xs font-black"}>{item.source || "Site Formu"}</span></td>
                              <td className="p-4 font-bold">{getService(item)}</td>
                              <td className="p-4">{item.district || "Belirtilmedi"}</td>
                              <td className="p-4">{item.phone || "-"}</td>
                              <td className="p-4 max-w-[280px] text-slate-300">{item.description || "-"}</td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <select value={getUnifiedRequestStatus(item)} onChange={(e) => updateStatus(item.id, e.target.value)} className={`${getStatusClass(getUnifiedRequestStatus(item))} rounded-lg px-3 py-2 outline-none font-bold`}>
                                    <option>İhalede</option>
                                    <option>Ustaya Yönlendirildi</option>
                                    <option>Tamamlandı</option>
                                    <option>İş İptal Oldu</option>
                                    <option>İhale Sonuçlandırılamadı</option>
                                  </select>
                                  {getAuctionForRequest(item)?.jobStatus === "İptal Edildi" && (
                                    <button
                                      onClick={() => setAdminCancelDetailJob(getAuctionForRequest(item))}
                                      className="bg-white/10 border border-white/20 text-white px-3 py-2 rounded-lg text-xs font-black hover:bg-white/20 whitespace-nowrap"
                                    >
                                      Açıklama
                                    </button>
                                  )}
                                </div>
                              </td>
                              <td className="p-4 whitespace-nowrap text-slate-300">{getDate(item)}</td>
                              <td className="p-4">{item.phone ? <a href={getWhatsappLink(item)} target="_blank" rel="noreferrer" className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold inline-block">WhatsApp</a> : <span className="text-slate-500 text-sm">Telefon yok</span>}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <Pagination
                    currentPage={safeRequestPage}
                    totalPages={requestTotalPages}
                    onPageChange={setRequestPage}
                  />
                </div>

                <div className="rounded-2xl bg-[#041b38]/90 border border-blue-400/20 overflow-hidden shadow-2xl">
                  <div className="p-5 border-b border-blue-400/20 flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-black">İzmir İlçe Haritası</h2>
                      <p className="text-xs text-slate-400 mt-1">Haritadaki sayılar aktif talepleri gösterir.</p>
                    </div>
                  </div>

                  <div className="relative bg-[#e9eef5] p-4 overflow-visible">
                    <img src={izmirMap} alt="İzmir Haritası" className="w-[150%] max-w-none h-auto select-none ml-[-24%]" />
                    {DISTRICT_POSITIONS.map(([district, left, top]) => {
                      const count = districtCounts[district] || 0;
                      let bgColor = "bg-red-500";
                      if (count >= 15) bgColor = "bg-red-900";
                      else if (count >= 10) bgColor = "bg-red-700";
                      else if (count >= 5) bgColor = "bg-red-600";
                      else if (count >= 1) bgColor = "bg-red-500";
                      else bgColor = "bg-slate-500";

                      return (
                        <div key={district} title={district} className="absolute -translate-x-1/2 -translate-y-1/2 group" style={{ left: `${left}%`, top: `${top}%` }}>
                          <div className={`${bgColor} text-white w-6 h-6 rounded-full flex items-center justify-center font-black shadow-xl border-2 border-white hover:scale-125 transition cursor-pointer text-sm`}>{count}</div>
                          <div className="hidden group-hover:block absolute left-1/2 -translate-x-1/2 -top-9 bg-black text-white text-xs font-bold px-3 py-1 rounded-lg whitespace-nowrap z-20">{district}</div>
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
                          <b className={districtCounts[district] > 0 ? "text-red-400" : "text-slate-500"}>{districtCounts[district] || 0}</b>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {adminCancelDetailJob && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                  <div className="bg-white text-slate-950 rounded-2xl shadow-2xl max-w-md w-full p-6">
                    <div className="flex justify-between items-center border-b pb-4 mb-4">
                      <h2 className="text-2xl font-black">İptal Açıklaması</h2>
                      <button onClick={() => setAdminCancelDetailJob(null)} className="text-2xl">×</button>
                    </div>
                    <p className="font-black mb-2">{adminCancelDetailJob.title}</p>
                    <p className="text-sm mb-3"><b>Usta:</b> {adminCancelDetailJob.winnerMasterName || "-"}</p>
                    <p className="text-sm mb-3"><b>İptal sebebi:</b> {adminCancelDetailJob.cancelReason || "Sebep belirtilmedi"}</p>
                    <div className="bg-slate-100 rounded-xl p-4 text-sm whitespace-pre-wrap">
                      {adminCancelDetailJob.cancelNote || "Ek açıklama yazılmadı."}
                    </div>
                    <button onClick={() => setAdminCancelDetailJob(null)} className="mt-5 w-full rounded-xl bg-blue-600 text-white py-3 font-black">Kapat</button>
                  </div>
                </div>
              )}

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
            <span className="bg-blue-900 w-10 h-10 rounded-full flex items-center justify-center shadow-lg">🔧</span>
            UstaHızlı
          </button>

          <div className="flex gap-3">
            <button onClick={() => setPage("master")} className="bg-green-600 px-6 py-3 rounded-2xl font-black hover:bg-green-700 transition">Usta Paneli</button>
            <button onClick={() => setPage("admin")} className="bg-blue-900 px-6 py-3 rounded-2xl font-black hover:bg-blue-950 transition">Admin</button>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 border border-white/40 rounded-full px-4 py-2 mb-8 bg-white/10">
              <span>⏱️</span>
              <span>15 dakika içinde en uygun usta teklifini al</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black leading-tight mb-8">
              Güvenilir ustayı
              <br />
              hızlıca bul.
            </h1>

            <p className="text-xl leading-9 max-w-2xl mb-10">
              Elektrik, montaj ve küçük tadilat işleriniz için talep oluşturun. Ustalar 15 dakika içinde teklif versin, en uygun teklif size yönlendirilsin.
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              <a href="#teklif" className="bg-blue-900 px-7 py-4 rounded-2xl font-black hover:bg-blue-950 transition">Hemen Talep Oluştur →</a>
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
            <select value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} className="w-full rounded-2xl px-5 py-4 mb-6 text-slate-950 outline-none">
              <option>Avize Montajı</option>
              <option>Priz Değişimi</option>
              <option>Küçük Tadilat</option>
              <option>Elektrik Arızası</option>
              <option>Batarya Değişimi</option>
            </select>

            <label className="block text-sm font-bold mb-2">İlçe</label>
            <select value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} className="w-full rounded-2xl px-5 py-4 mb-6 text-slate-950 outline-none">
              {IZMIR_DISTRICTS.map((district) => <option key={district}>{district}</option>)}
            </select>

            <label className="block text-sm font-bold mb-2">Telefon numarası</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-2xl px-5 py-4 mb-6 text-slate-950 outline-none" placeholder="05xx xxx xx xx" />

            <button className="w-full bg-blue-900 rounded-2xl py-4 font-black hover:bg-blue-950 transition">Teklif Talebi Oluştur</button>
          </form>
        </div>
      </section>

      <footer className="bg-[#020718] text-white py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between gap-6">
          <div>
            <h3 className="text-xl font-black">UstaHızlı</h3>
            <p className="mt-2">Demo site — hızlı usta bulma, admin panel ve usta ihale sistemi.</p>
          </div>
          <div className="font-bold">📞 0850 000 00 00</div>
        </div>
      </footer>
    </div>
  );
}

function MasterNavButton({ active, icon, label, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${active ? "bg-blue-600 text-white" : "hover:bg-white/10 text-slate-200"}`}>
      <span>{icon}</span>
      {label}
    </button>
  );
}

function MasterStat({ icon, title, value, green }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl">{icon}</div>
      <div>
        <p className="text-sm text-slate-500 font-bold">{title}</p>
        <p className={`text-2xl font-black ${green ? "text-green-700" : "text-slate-950"}`}>{value}</p>
      </div>
    </div>
  );
}

function OfferBadge({ status }) {
  if (status === "auction") return <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg font-black text-xs">İhalede</span>;
  if (status === "won") return <span className="bg-green-50 text-green-700 px-3 py-1 rounded-lg font-black text-xs">Kazandınız</span>;
  if (status === "lost_refunded") return <span className="bg-red-50 text-red-700 px-3 py-1 rounded-lg font-black text-xs">Kaybettiniz</span>;
  return <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg font-black text-xs">{status}</span>;
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pageNumbers = [];
  for (let page = 1; page <= totalPages; page += 1) {
    const shouldShow =
      page === 1 ||
      page === totalPages ||
      Math.abs(page - currentPage) <= 1;

    if (shouldShow) {
      pageNumbers.push(page);
    } else if (pageNumbers[pageNumbers.length - 1] !== "...") {
      pageNumbers.push("...");
    }
  }

  return (
    <div className="flex items-center justify-center gap-2 p-4 border-t border-blue-400/10 bg-[#021026]/40">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="px-4 py-2 rounded-lg bg-white/10 text-white font-black disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/20 transition"
      >
        Geri
      </button>

      {pageNumbers.map((page, index) =>
        page === "..." ? (
          <span key={`dots-${index}`} className="px-3 py-2 text-slate-400 font-black">...</span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`min-w-10 px-3 py-2 rounded-lg font-black transition ${
              currentPage === page
                ? "bg-blue-600 text-white"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="px-4 py-2 rounded-lg bg-white/10 text-white font-black disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/20 transition"
      >
        İleri
      </button>
    </div>
  );
}

function AdminStat({ title, value, subtitle, pink, red }) {
  const colorClass = pink
    ? "bg-pink-950/50 border-pink-400/30"
    : red
    ? "bg-red-950/50 border-red-400/30"
    : "bg-blue-950/70 border-blue-400/20";

  return (
    <div className={`rounded-2xl ${colorClass} border p-6 shadow-xl`}>
      <p className="font-bold text-slate-300">{title}</p>
      <h2 className="text-4xl font-black mt-2">{value}</h2>
      <p className="text-sm text-slate-400 mt-2">{subtitle}</p>
    </div>
  );
}
