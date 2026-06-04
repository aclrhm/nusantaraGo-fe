import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  StatusBar,
  useWindowDimensions,
  ActivityIndicator,
  Platform,
  Image,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";

const API_BASE_URL = "http://localhost:8081/api";

const DEFAULT_FORM_DATA = {
  id: "",
  name: "",
  category: "Alam",
  cost: 0,
  distance: 0,
  location: "",
  description: "",
  facilities: "",
  rides: "",
  imageUrl: "",
};

export default function App() {
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 768;
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("semua");
  const [sortBy, setSortBy] = useState("distance_asc");
  const [isSortPickerOpen, setIsSortPickerOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [toasts, setToasts] = useState([]);
  const [algoTab, setAlgoTab] = useState(null); // 'sequential' | 'binary' | 'selection' | 'insertion'
  const [algoInput, setAlgoInput] = useState("");
  const [algoResult, setAlgoResult] = useState(null);
  const [algoLoading, setAlgoLoading] = useState(false);
  const [sortedList, setSortedList] = useState([]);

  // Fungsi Helper Toast Notifikasi
  const showToast = (message, type = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Fetch Data dari Go Backend API
  const fetchDestinations = async () => {
    setLoading(true);
    try {
      const url = `${API_BASE_URL}/destinations?search=${encodeURIComponent(searchQuery)}&category=${encodeURIComponent(selectedCategory)}&sort=${sortBy}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Gagal memuat data dari server");
      }
      const data = await response.json();
      setDestinations(data);
      setApiError(false);
    } catch (error) {
      console.error("API Error:", error);
      setApiError(true);
      showToast(
        "Gagal terhubung ke backend Golang. Menampilkan data lokal (fallback).",
        "error",
      );
      loadFallbackData();
    } finally {
      setLoading(false);
    }
  };

  // Memuat data statis lokal jika server mati (User-friendly fallback)
  const loadFallbackData = () => {
    const localData = [
      {
        id: "dest-1",
        name: "Candi Borobudur (Lokal)",
        category: "Budaya",
        cost: 50000,
        distance: 40.2,
        location: "Magelang, Jawa Tengah",
        description:
          "Candi Buddha terbesar di dunia yang megah, diakui sebagai warisan budaya dunia oleh UNESCO. Menyajikan pemandangan matahari terbit yang sangat memukau di atas stupa kuno.",
        facilities: [
          "Area Parkir Luas",
          "Toilet Bersih",
          "Mushola",
          "Pemandu Wisata",
          "Toko Souvenir",
        ],
        rides: ["Museum Borobudur", "Kereta Wisata Keliling", "Sewa Sepeda"],
        imageUrl:
          "https://images.unsplash.com/photo-1584810359583-96fc3448beaa?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "dest-2",
        name: "Pantai Kuta Bali (Lokal)",
        category: "Alam",
        cost: 15000,
        distance: 12.5,
        location: "Badung, Bali",
        description:
          "Pantai pasir putih legendaris yang terkenal di seluruh dunia. Merupakan pusat selancar, bersantai menikmati matahari terbenam yang romantis, dan memiliki garis pantai yang sangat panjang.",
        facilities: [
          "Shower Umum",
          "Penyewaan Payung Pantai",
          "Toilet",
          "Life Guard",
        ],
        rides: ["Pusat Surfing (Selancar)", "Banana Boat", "Sewa Jet Ski"],
        imageUrl:
          "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "dest-3",
        name: "Gunung Bromo (Lokal)",
        category: "Petualangan",
        cost: 35000,
        distance: 110.0,
        location: "Probolinggo, Jawa Timur",
        description:
          "Gunung berapi aktif yang menawarkan pemandangan magis lautan pasir luas, kawah aktif yang menakjubkan, dan spot sunrise legendaris dari puncak Penanjakan.",
        facilities: [
          "Toilet Umum",
          "Mushola Penanjakan",
          "Penyewaan Jaket Hangat",
          "Area Parkir Jeep",
        ],
        rides: [
          "Wisata Jeep 4x4",
          "Berkuda di Pasir Berbisik",
          "Pendakian Kawah Bromo",
        ],
        imageUrl:
          "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?auto=format&fit=crop&w=800&q=80",
      },
    ];

    let filtered = localData.filter((d) => {
      const matchCat =
        selectedCategory === "semua" ||
        d.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchSearch =
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });

    if (sortBy === "distance_asc")
      filtered.sort((a, b) => a.distance - b.distance);
    else if (sortBy === "cost_asc") filtered.sort((a, b) => a.cost - b.cost);
    else if (sortBy === "cost_desc") filtered.sort((a, b) => b.cost - a.cost);
    else if (sortBy === "facilities_desc")
      filtered.sort((a, b) => b.facilities.length - a.facilities.length);

    setDestinations(filtered);
  };

  useEffect(() => {
    fetchDestinations();
  }, [searchQuery, selectedCategory, sortBy]);

  // Aksi CRUD (Admin)
  const handleAddSubmit = async () => {
    if (!formData.name || !formData.location || !formData.imageUrl) {
      showToast("Harap isi field wajib: Nama, Lokasi, dan Link Foto!", "error");
      return;
    }

    const newDest = {
      name: formData.name,
      category: formData.category,
      cost: Number(formData.cost),
      distance: Number(formData.distance),
      location: formData.location,
      description:
        formData.description ||
        "Destinasi wisata menarik untuk dikunjungi bersama keluarga.",
      facilities: formData.facilities
        ? formData.facilities
            .split(",")
            .map((f) => f.trim())
            .filter((f) => f !== "")
        : [],
      rides: formData.rides
        ? formData.rides
            .split(",")
            .map((r) => r.trim())
            .filter((r) => r !== "")
        : [],
      imageUrl: formData.imageUrl,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/destinations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDest),
      });

      if (!response.ok) throw new Error("Gagal menambahkan destinasi");

      showToast(`Destinasi "${newDest.name}" berhasil ditambahkan!`);
      setIsAddModalOpen(false);
      setFormData(DEFAULT_FORM_DATA);
      fetchDestinations();
    } catch (error) {
      console.error(error);
      showToast("Gagal mengirim data ke server.", "error");
    }
  };

  const openEditModal = (dest) => {
    setEditingId(dest.id);
    setFormData({
      id: dest.id,
      name: dest.name,
      category: dest.category,
      cost: dest.cost,
      distance: dest.distance,
      location: dest.location,
      description: dest.description,
      facilities: dest.facilities.join(", "),
      rides: dest.rides.join(", "),
      imageUrl: dest.imageUrl,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!formData.name || !formData.location || !formData.imageUrl) {
      showToast("Harap isi field wajib!", "error");
      return;
    }

    const updatedDest = {
      id: editingId,
      name: formData.name,
      category: formData.category,
      cost: Number(formData.cost),
      distance: Number(formData.distance),
      location: formData.location,
      description: formData.description,
      facilities: formData.facilities
        ? formData.facilities
            .split(",")
            .map((f) => f.trim())
            .filter((f) => f !== "")
        : [],
      rides: formData.rides
        ? formData.rides
            .split(",")
            .map((r) => r.trim())
            .filter((r) => r !== "")
        : [],
      imageUrl: formData.imageUrl,
    };

    try {
      const response = await fetch(
        `${API_BASE_URL}/destinations/${editingId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedDest),
        },
      );

      if (!response.ok) throw new Error("Gagal mengubah destinasi");

      showToast(`Destinasi "${updatedDest.name}" berhasil diperbarui!`);
      setIsEditModalOpen(false);
      setFormData(DEFAULT_FORM_DATA);
      fetchDestinations();
    } catch (error) {
      console.error(error);
      showToast("Gagal memperbarui data di server.", "error");
    }
  };

  const handleDelete = async (id, name) => {
    const confirmed =
      Platform.OS === "web"
        ? window.confirm(
            `Apakah Anda yakin ingin menghapus destinasi "${name}"?`,
          )
        : true;

    if (!confirmed) return;

    try {
      const response = await fetch(`${API_BASE_URL}/destinations/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Gagal menghapus destinasi");

      showToast(`Destinasi "${name}" berhasil dihapus!`);
      fetchDestinations();
    } catch (error) {
      console.error(error);
      showToast("Gagal menghapus data dari server.", "error");
    }
  };

  const formatRupiah = (value) => {
    if (value === 0) return "Gratis";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getSortLabel = (val) => {
    switch (val) {
      case "distance_asc":
        return "📍 Jarak Terdekat";
      case "distance_desc":
        return "🗺️ Jarak Terjauh";
      case "cost_asc":
        return "💵 Tiket Termurah";
      case "cost_desc":
        return "💎 Tiket Termahal";
      case "facilities_desc":
        return "✨ Fasilitas Terlengkap";
      default:
        return "📍 Jarak Terdekat";
    }
  };

  //FUNGSI SORTING
  const runSequentialSearch = async () => {
    if (!algoInput) return;
    setAlgoLoading(true);
    setAlgoResult(null);
    try {
      const r = await fetch(
        `${API_BASE_URL}/destinations/sequential-search?id=${encodeURIComponent(algoInput)}`,
      );
      setAlgoResult(
        r.ok ? { data: await r.json(), found: true } : { found: false },
      );
    } catch {
      setAlgoResult({ error: true });
    } finally {
      setAlgoLoading(false);
    }
  };

  const runBinarySearch = async () => {
    if (!algoInput) return;
    setAlgoLoading(true);
    setAlgoResult(null);
    try {
      const r = await fetch(
        `${API_BASE_URL}/destinations/binary-search?id=${encodeURIComponent(algoInput)}`,
      );
      setAlgoResult(
        r.ok ? { data: await r.json(), found: true } : { found: false },
      );
    } catch {
      setAlgoResult({ error: true });
    } finally {
      setAlgoLoading(false);
    }
  };

  const runSelectionSort = async () => {
    setAlgoLoading(true);
    setSortedList([]);
    try {
      const r = await fetch(`${API_BASE_URL}/destinations/selection-sort-cost`);
      if (r.ok) setSortedList(await r.json());
    } catch {
      showToast("Gagal menghubungi server", "error");
    } finally {
      setAlgoLoading(false);
    }
  };

  const runInsertionSort = async () => {
    setAlgoLoading(true);
    setSortedList([]);
    try {
      const r = await fetch(
        `${API_BASE_URL}/destinations/insertion-sort-distance`,
      );
      if (r.ok) setSortedList(await r.json());
    } catch {
      showToast("Gagal menghubungi server", "error");
    } finally {
      setAlgoLoading(false);
    }
  };

  return (
    <View style={styles.appContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#070a13" />

      {/* 1. TOP HEADER BAR */}
      <View style={styles.header}>
        <View style={styles.brand}>
          <Feather
            name="compass"
            size={24}
            color="#06b6d4"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.brandName}>
            Nusantara<Text style={{ color: "#fff" }}>Go</Text>
          </Text>
        </View>

        <View style={styles.headerActions}>
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: apiError ? "#ef4444" : "#10b981" },
            ]}
          />

          <TouchableOpacity
            style={[
              styles.roleButton,
              isAdminMode ? styles.roleAdmin : styles.roleUser,
            ]}
            onPress={() => {
              setIsAdminMode(!isAdminMode);
              showToast(
                `Berhasil beralih ke mode ${!isAdminMode ? "Admin" : "Pengguna biasa"}`,
                "success",
              );
            }}
          >
            <Feather
              name="user"
              size={14}
              color={isAdminMode ? "#f87171" : "#06b6d4"}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.roleText,
                { color: isAdminMode ? "#f87171" : "#06b6d4" },
              ]}
            >
              {isAdminMode ? "Admin" : "Pengguna"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Offline Alert Banner */}
        {apiError && (
          <View style={styles.offlineBanner}>
            <Feather
              name="alert-triangle"
              size={20}
              color="#f59e0b"
              style={{ marginRight: 12 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.offlineTitle}>Mode Demo Offline Aktif</Text>
              <Text style={styles.offlineText}>
                Backend Golang tidak terdeteksi aktif. Menggunakan database
                simulasi lokal agar Anda bisa langsung mencoba fitur.
              </Text>
            </View>
          </View>
        )}

        {/* 2. MODE USER LAYOUT */}
        {!isAdminMode ? (
          <View>
            {/* HERO HERO SECTION */}
            <View style={styles.heroCard}>
              <Text style={styles.heroTitle}>
                Jelajahi Surga Pariwisata Nusantara
              </Text>
              <Text style={styles.heroSubtitle}>
                Temukan liburan impian terbaik dengan fasilitas terlengkap dan
                biaya terjangkau di seluruh Indonesia.
              </Text>

              {/* SEARCH CONTAINER */}
              <View style={styles.searchBox}>
                <Feather
                  name="search"
                  size={18}
                  color="#9ca3af"
                  style={{ marginRight: 10 }}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Cari tempat pariwisata, wahana, atau fasilitas..."
                  placeholderTextColor="#4b5563"
                  value={searchQuery}
                  onChangeText={(text) => setSearchQuery(text)}
                />
              </View>

              {/* CATEGORIES BUTTON TABS */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryTabs}
              >
                {["semua", "alam", "budaya", "petualangan", "rekreasi"].map(
                  (cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryTabBtn,
                        selectedCategory === cat && styles.categoryTabBtnActive,
                      ]}
                      onPress={() => setSelectedCategory(cat)}
                    >
                      <Text
                        style={[
                          styles.categoryTabText,
                          selectedCategory === cat &&
                            styles.categoryTabTextActive,
                        ]}
                      >
                        {cat.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ),
                )}
              </ScrollView>

              {/* SORT CONTROLLER */}
              <View style={styles.sortContainer}>
                <Text style={styles.sortLabel}>Urutkan: </Text>
                <TouchableOpacity
                  style={styles.sortPickerButton}
                  onPress={() => setIsSortPickerOpen(true)}
                >
                  <Text style={styles.sortPickerText}>
                    {getSortLabel(sortBy)}
                  </Text>
                  <Feather
                    name="chevron-down"
                    size={14}
                    color="#06b6d4"
                    style={{ marginLeft: 6 }}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* ALGORITMA VIEW */}
            {/* ALGORITHM DEMO SECTION */}
            <View style={styles.heroCard}>
              <Text style={styles.modalDescTitle}>
                🔬 Demo Algoritma Pencarian & Pengurutan
              </Text>

              {/* Tab buttons */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 12 }}
              >
                {[
                  { key: "sequential", label: "Sequential Search" },
                  { key: "binary", label: "Binary Search" },
                  { key: "selection", label: "Selection Sort" },
                  { key: "insertion", label: "Insertion Sort" },
                ].map((tab) => (
                  <TouchableOpacity
                    key={tab.key}
                    style={[
                      styles.categoryTabBtn,
                      algoTab === tab.key && styles.categoryTabBtnActive,
                      { marginRight: 8 },
                    ]}
                    onPress={() => {
                      setAlgoTab(tab.key);
                      setAlgoResult(null);
                      setSortedList([]);
                    }}
                  >
                    <Text
                      style={[
                        styles.categoryTabText,
                        algoTab === tab.key && styles.categoryTabTextActive,
                      ]}
                    >
                      {tab.label.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Panel konten per tab */}
              {algoTab === "sequential" && (
                <View>
                  <Text style={styles.cardDesc}>
                    Mencari destinasi satu per satu dari awal.
                  </Text>
                  <View style={styles.searchBox}>
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Masukkan ID, contoh: dest-1"
                      placeholderTextColor="#4b5563"
                      value={algoInput}
                      onChangeText={setAlgoInput}
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.btnSave}
                    onPress={runSequentialSearch}
                  >
                    <Text style={styles.btnSaveText}>🔍 Cari (Sequential)</Text>
                  </TouchableOpacity>
                </View>
              )}

              {algoTab === "binary" && (
                <View>
                  <Text style={styles.cardDesc}>
                    Pencarian biner pada data terurut.
                  </Text>
                  <View style={styles.searchBox}>
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Masukkan ID, contoh: dest-2"
                      placeholderTextColor="#4b5563"
                      value={algoInput}
                      onChangeText={setAlgoInput}
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.btnSave}
                    onPress={runBinarySearch}
                  >
                    <Text style={styles.btnSaveText}>🔍 Cari (Binary)</Text>
                  </TouchableOpacity>
                </View>
              )}

              {algoTab === "selection" && (
                <View>
                  <Text style={styles.cardDesc}>
                    Urutkan semua destinasi dari biaya termurah.
                  </Text>
                  <TouchableOpacity
                    style={styles.btnSave}
                    onPress={runSelectionSort}
                  >
                    <Text style={styles.btnSaveText}>
                      ⚙️ Jalankan Selection Sort
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {algoTab === "insertion" && (
                <View>
                  <Text style={styles.cardDesc}>
                    Urutkan semua destinasi dari jarak terdekat.
                  </Text>
                  <TouchableOpacity
                    style={styles.btnSave}
                    onPress={runInsertionSort}
                  >
                    <Text style={styles.btnSaveText}>
                      ⚙️ Jalankan Insertion Sort
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Loading */}
              {algoLoading && (
                <ActivityIndicator
                  size="small"
                  color="#06b6d4"
                  style={{ marginTop: 12 }}
                />
              )}

              {/* Hasil pencarian */}
              {algoResult && (
                <View style={[styles.adminRow, { marginTop: 12 }]}>
                  {algoResult.error ? (
                    <Text style={{ color: "#ef4444", fontSize: 12 }}>
                      ❌ Tidak dapat terhubung ke server.
                    </Text>
                  ) : algoResult.found ? (
                    <View style={styles.adminRowInfo}>
                      <Text style={styles.adminDestName}>
                        ✅ {algoResult.data.name}
                      </Text>
                      <Text style={styles.adminDestLoc}>
                        {algoResult.data.location} · {algoResult.data.category}
                      </Text>
                      <View style={{ flexDirection: "row", marginTop: 4 }}>
                        <Text style={styles.adminStatBadge}>
                          💵 {formatRupiah(algoResult.data.cost)}
                        </Text>
                        <Text
                          style={[styles.adminStatBadge, { marginLeft: 8 }]}
                        >
                          📍 {algoResult.data.distance} km
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <Text style={{ color: "#f59e0b", fontSize: 12 }}>
                      ⚠️ Destinasi tidak ditemukan.
                    </Text>
                  )}
                </View>
              )}

              {/* Hasil sort */}
              {sortedList.length > 0 && (
                <View style={{ marginTop: 12 }}>
                  <Text style={styles.cardDesc}>
                    Hasil ({sortedList.length} destinasi):
                  </Text>
                  {sortedList.map((d, i) => (
                    <View
                      key={d.id}
                      style={[styles.adminRow, { marginBottom: 6 }]}
                    >
                      <Text
                        style={[styles.adminStatBadge, { marginRight: 10 }]}
                      >
                        #{i + 1}
                      </Text>
                      <View style={styles.adminRowInfo}>
                        <Text style={styles.adminDestName}>{d.name}</Text>
                        <View style={{ flexDirection: "row", marginTop: 2 }}>
                          <Text style={styles.adminStatBadge}>
                            💵 {formatRupiah(d.cost)}
                          </Text>
                          <Text
                            style={[styles.adminStatBadge, { marginLeft: 6 }]}
                          >
                            📍 {d.distance} km
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* LIST TITLE */}
            <View style={styles.sectionHeader}>
              <Feather
                name="grid"
                size={16}
                color="#06b6d4"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.sectionTitle}>
                Destinasi Pilihan ({destinations.length})
              </Text>
            </View>

            {/* LOADER */}
            {loading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color="#06b6d4" />
                <Text style={styles.loadingText}>
                  Memuat keindahan pariwisata...
                </Text>
              </View>
            ) : destinations.length === 0 ? (
              <View style={styles.emptyBox}>
                <Feather
                  name="compass"
                  size={40}
                  color="#4b5563"
                  style={{ marginBottom: 12 }}
                />
                <Text style={styles.emptyTitle}>Destinasi Tidak Ditemukan</Text>
                <Text style={styles.emptyText}>
                  Tidak ada pariwisata yang cocok dengan pencarian Anda.
                </Text>
              </View>
            ) : (
              /* RESPONSIVE GRID / CARDS */
              <View
                style={[
                  styles.gridContainer,
                  isLargeScreen && styles.gridLarge,
                ]}
              >
                {destinations.map((dest) => (
                  <TouchableOpacity
                    key={dest.id}
                    style={[styles.card, isLargeScreen && styles.cardLarge]}
                    onPress={() => setSelectedDestination(dest)}
                  >
                    <View style={styles.cardImageWrapper}>
                      <View style={styles.cardBadge}>
                        <Text style={styles.cardBadgeText}>
                          {dest.category}
                        </Text>
                      </View>
                      {dest.imageUrl ? (
                        <Image
                          source={{ uri: dest.imageUrl }}
                          style={styles.cardImg}
                          resizeMode="cover"
                        />
                      ) : (
                        <View
                          style={[
                            styles.cardImgFallback,
                            { backgroundColor: "#1e293b" },
                          ]}
                        >
                          <Feather name="image" size={32} color="#4b5563" />
                        </View>
                      )}
                    </View>

                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle} numberOfLines={1}>
                        {dest.name}
                      </Text>
                      <View style={styles.cardLocRow}>
                        <Feather
                          name="map-pin"
                          size={12}
                          color="#06b6d4"
                          style={{ marginRight: 4 }}
                        />
                        <Text style={styles.cardLocText} numberOfLines={1}>
                          {dest.location}
                        </Text>
                      </View>

                      <Text style={styles.cardDesc} numberOfLines={3}>
                        {dest.description}
                      </Text>

                      <View style={styles.cardFooter}>
                        <View>
                          <Text style={styles.cardFootLabel}>Harga Tiket</Text>
                          <Text style={styles.cardPrice}>
                            {formatRupiah(dest.cost)}
                          </Text>
                        </View>
                        <View style={{ alignItems: "flex-end" }}>
                          <Text style={styles.cardFootLabel}>Jarak</Text>
                          <Text style={styles.cardDistance}>
                            📍 {dest.distance} km
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ) : (
          /* 3. MODE ADMIN LAYOUT (CRUD) */
          <View style={styles.adminPanel}>
            <View style={styles.adminHeader}>
              <View>
                <Text style={styles.adminTitle}>Dashboard Admin</Text>
                <Text style={styles.adminSubtitle}>
                  Kelola destinasi pariwisata Nusantara
                </Text>
              </View>

              <TouchableOpacity
                style={styles.btnAdd}
                onPress={() => {
                  setFormData(DEFAULT_FORM_DATA);
                  setIsAddModalOpen(true);
                }}
              >
                <Feather
                  name="plus"
                  size={16}
                  color="#070a13"
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.btnAddText}>Tambah Destinasi</Text>
              </TouchableOpacity>
            </View>

            {/* ADMIN TABLE / LIST */}
            {destinations.map((dest) => (
              <View key={dest.id} style={styles.adminRow}>
                <View style={styles.adminRowInfo}>
                  <Text style={styles.adminDestName}>{dest.name}</Text>
                  <Text style={styles.adminDestLoc}>
                    {dest.location} ({dest.category})
                  </Text>
                  <View style={{ flexDirection: "row", marginTop: 4 }}>
                    <Text style={styles.adminStatBadge}>
                      💵 {formatRupiah(dest.cost)}
                    </Text>
                    <Text style={[styles.adminStatBadge, { marginLeft: 8 }]}>
                      📍 {dest.distance} km
                    </Text>
                  </View>
                </View>

                <View style={styles.adminRowActions}>
                  <TouchableOpacity
                    style={styles.btnEdit}
                    onPress={() => openEditModal(dest)}
                  >
                    <Feather name="edit-3" size={14} color="#06b6d4" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.btnDelete}
                    onPress={() => handleDelete(dest.id, dest.name)}
                  >
                    <Feather name="trash-2" size={14} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* 4. MODAL DETAIL DESTINASI */}
      {selectedDestination && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={!!selectedDestination}
          onRequestClose={() => setSelectedDestination(null)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalContent,
                isLargeScreen && styles.modalContentLarge,
              ]}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {selectedDestination.name}
                </Text>
                <TouchableOpacity onPress={() => setSelectedDestination(null)}>
                  <Feather name="x" size={22} color="#fff" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                {selectedDestination.imageUrl ? (
                  <View style={styles.detailHero}>
                    <Image
                      source={{ uri: selectedDestination.imageUrl }}
                      style={styles.detailHeroImg}
                      resizeMode="cover"
                    />
                  </View>
                ) : null}

                <View style={styles.modalBadgeRow}>
                  <View style={styles.cardBadge}>
                    <Text style={styles.cardBadgeText}>
                      {selectedDestination.category}
                    </Text>
                  </View>
                  <Text style={styles.modalDistanceLabel}>
                    📍 {selectedDestination.distance} km dari pusat kota
                  </Text>
                </View>

                <View style={styles.modalMetaCard}>
                  <View style={styles.modalMetaItem}>
                    <Feather name="map-pin" size={16} color="#06b6d4" />
                    <Text style={styles.modalMetaVal}>
                      {selectedDestination.location}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.modalMetaItem,
                      {
                        borderLeftWidth: 1,
                        borderLeftColor: "#334155",
                        paddingLeft: 12,
                      },
                    ]}
                  >
                    <Feather name="dollar-sign" size={16} color="#10b981" />
                    <Text style={[styles.modalMetaVal, { color: "#10b981" }]}>
                      {formatRupiah(selectedDestination.cost)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.modalDescTitle}>Tentang Destinasi</Text>
                <Text style={styles.modalDescText}>
                  {selectedDestination.description}
                </Text>

                <Text style={styles.modalDescTitle}>
                  Fasilitas yang Tersedia
                </Text>
                <View style={styles.badgeListContainer}>
                  {selectedDestination.facilities.map((fac, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.facilityBadge,
                        { marginRight: 6, marginBottom: 6 },
                      ]}
                    >
                      <Text style={styles.facilityBadgeText}>✨ {fac}</Text>
                    </View>
                  ))}
                  {selectedDestination.facilities.length === 0 && (
                    <Text style={styles.emptyBadgeText}>
                      Belum ada info fasilitas
                    </Text>
                  )}
                </View>

                <Text style={styles.modalDescTitle}>Wahana Rekreasi</Text>
                <View style={styles.badgeListContainer}>
                  {selectedDestination.rides.map((ride, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.rideBadge,
                        { marginRight: 6, marginBottom: 6 },
                      ]}
                    >
                      <Text style={styles.rideBadgeText}>🎡 {ride}</Text>
                    </View>
                  ))}
                  {selectedDestination.rides.length === 0 && (
                    <Text style={styles.emptyBadgeText}>
                      Belum ada info wahana
                    </Text>
                  )}
                </View>
              </ScrollView>

              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setSelectedDestination(null)}
              >
                <Text style={styles.modalCloseBtnText}>Tutup Detail</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* 5. MODAL SORT PICKER (MOBILE FRIENDLY) */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isSortPickerOpen}
        onRequestClose={() => setIsSortPickerOpen(false)}
      >
        <TouchableOpacity
          style={styles.pickerOverlay}
          activeOpacity={1}
          onPress={() => setIsSortPickerOpen(false)}
        >
          <View style={styles.pickerBox}>
            <Text style={styles.pickerTitle}>Urutkan Destinasi</Text>
            {[
              { val: "distance_asc", label: "📍 Jarak Terdekat" },
              { val: "distance_desc", label: "🗺️ Jarak Terjauh" },
              { val: "cost_asc", label: "💵 Tiket Termurah" },
              { val: "cost_desc", label: "💎 Tiket Termahal" },
              { val: "facilities_desc", label: "✨ Fasilitas Terlengkap" },
            ].map((item) => (
              <TouchableOpacity
                key={item.val}
                style={[
                  styles.pickerItem,
                  sortBy === item.val && styles.pickerItemActive,
                ]}
                onPress={() => {
                  setSortBy(item.val);
                  setIsSortPickerOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.pickerItemText,
                    sortBy === item.val && styles.pickerItemTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 6. MODAL TAMBAH DESTINASI (ADMIN) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isAddModalOpen}
        onRequestClose={() => setIsAddModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              isLargeScreen && styles.modalContentLarge,
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tambah Wisata Baru</Text>
              <TouchableOpacity onPress={() => setIsAddModalOpen(false)}>
                <Feather name="x" size={22} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.formLabel}>Nama Tempat Wisata *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Contoh: Raja Ampat"
                placeholderTextColor="#4b5563"
                value={formData.name}
                onChangeText={(val) => setFormData({ ...formData, name: val })}
              />

              <Text style={styles.formLabel}>Kategori *</Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  marginBottom: 12,
                }}
              >
                {["Alam", "Budaya", "Petualangan", "Rekreasi"].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.formSelectBtn,
                      formData.category === cat && styles.formSelectBtnActive,
                    ]}
                    onPress={() => setFormData({ ...formData, category: cat })}
                  >
                    <Text
                      style={[
                        styles.formSelectBtnText,
                        formData.category === cat &&
                          styles.formSelectBtnTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.formLabel}>Harga Tiket Masuk (Rupiah) *</Text>
              <TextInput
                style={styles.formInput}
                keyboardType="numeric"
                placeholder="Contoh: 50000"
                placeholderTextColor="#4b5563"
                value={formData.cost === 0 ? "" : String(formData.cost)}
                onChangeText={(val) =>
                  setFormData({ ...formData, cost: Number(val) })
                }
              />

              <Text style={styles.formLabel}>Jarak Dari Kota (km) *</Text>
              <TextInput
                style={styles.formInput}
                keyboardType="numeric"
                placeholder="Contoh: 12.5"
                placeholderTextColor="#4b5563"
                value={formData.distance === 0 ? "" : String(formData.distance)}
                onChangeText={(val) =>
                  setFormData({ ...formData, distance: Number(val) })
                }
              />

              <Text style={styles.formLabel}>Lokasi Administrasi *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Contoh: Badung, Bali"
                placeholderTextColor="#4b5563"
                value={formData.location}
                onChangeText={(val) =>
                  setFormData({ ...formData, location: val })
                }
              />

              <Text style={styles.formLabel}>Link Foto (URL) *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Contoh: https://images.unsplash.com/..."
                placeholderTextColor="#4b5563"
                value={formData.imageUrl}
                onChangeText={(val) =>
                  setFormData({ ...formData, imageUrl: val })
                }
              />

              <Text style={styles.formLabel}>Deskripsi Tempat Wisata</Text>
              <TextInput
                style={[
                  styles.formInput,
                  { height: 80, textAlignVertical: "top" },
                ]}
                multiline={true}
                placeholder="Deskripsi singkat..."
                placeholderTextColor="#4b5563"
                value={formData.description}
                onChangeText={(val) =>
                  setFormData({ ...formData, description: val })
                }
              />

              <Text style={styles.formLabel}>
                Fasilitas (Pisahkan dengan tanda koma)
              </Text>
              <TextInput
                style={styles.formInput}
                placeholder="Toilet, Mushola, Parkir"
                placeholderTextColor="#4b5563"
                value={formData.facilities}
                onChangeText={(val) =>
                  setFormData({ ...formData, facilities: val })
                }
              />

              <Text style={styles.formLabel}>
                Wahana (Pisahkan dengan tanda koma)
              </Text>
              <TextInput
                style={styles.formInput}
                placeholder="Flying Fox, Jet Ski"
                placeholderTextColor="#4b5563"
                value={formData.rides}
                onChangeText={(val) => setFormData({ ...formData, rides: val })}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={() => setIsAddModalOpen(false)}
              >
                <Text style={styles.btnCancelText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnSave}
                onPress={handleAddSubmit}
              >
                <Text style={styles.btnSaveText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 7. MODAL EDIT DESTINASI (ADMIN) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isEditModalOpen}
        onRequestClose={() => setIsEditModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              isLargeScreen && styles.modalContentLarge,
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ubah Data Wisata</Text>
              <TouchableOpacity onPress={() => setIsEditModalOpen(false)}>
                <Feather name="x" size={22} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.formLabel}>Nama Tempat Wisata *</Text>
              <TextInput
                style={styles.formInput}
                value={formData.name}
                onChangeText={(val) => setFormData({ ...formData, name: val })}
              />

              <Text style={styles.formLabel}>Kategori *</Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  marginBottom: 12,
                }}
              >
                {["Alam", "Budaya", "Petualangan", "Rekreasi"].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.formSelectBtn,
                      formData.category === cat && styles.formSelectBtnActive,
                    ]}
                    onPress={() => setFormData({ ...formData, category: cat })}
                  >
                    <Text
                      style={[
                        styles.formSelectBtnText,
                        formData.category === cat &&
                          styles.formSelectBtnTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.formLabel}>Harga Tiket Masuk (Rupiah) *</Text>
              <TextInput
                style={styles.formInput}
                keyboardType="numeric"
                value={String(formData.cost)}
                onChangeText={(val) =>
                  setFormData({ ...formData, cost: Number(val) })
                }
              />

              <Text style={styles.formLabel}>Jarak Dari Kota (km) *</Text>
              <TextInput
                style={styles.formInput}
                keyboardType="numeric"
                value={String(formData.distance)}
                onChangeText={(val) =>
                  setFormData({ ...formData, distance: Number(val) })
                }
              />

              <Text style={styles.formLabel}>Lokasi Administrasi *</Text>
              <TextInput
                style={styles.formInput}
                value={formData.location}
                onChangeText={(val) =>
                  setFormData({ ...formData, location: val })
                }
              />

              <Text style={styles.formLabel}>Link Foto (URL) *</Text>
              <TextInput
                style={styles.formInput}
                value={formData.imageUrl}
                onChangeText={(val) =>
                  setFormData({ ...formData, imageUrl: val })
                }
              />

              <Text style={styles.formLabel}>Deskripsi Tempat Wisata</Text>
              <TextInput
                style={[
                  styles.formInput,
                  { height: 80, textAlignVertical: "top" },
                ]}
                multiline={true}
                value={formData.description}
                onChangeText={(val) =>
                  setFormData({ ...formData, description: val })
                }
              />

              <Text style={styles.formLabel}>
                Fasilitas (Pisahkan dengan koma)
              </Text>
              <TextInput
                style={styles.formInput}
                value={formData.facilities}
                onChangeText={(val) =>
                  setFormData({ ...formData, facilities: val })
                }
              />

              <Text style={styles.formLabel}>
                Wahana (Pisahkan dengan koma)
              </Text>
              <TextInput
                style={styles.formInput}
                value={formData.rides}
                onChangeText={(val) => setFormData({ ...formData, rides: val })}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={() => setIsEditModalOpen(false)}
              >
                <Text style={styles.btnCancelText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnSave}
                onPress={handleEditSubmit}
              >
                <Text style={styles.btnSaveText}>Simpan Perubahan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 8. FLOATING TOASTS NOTIFICATIONS */}
      <View style={styles.toastContainer}>
        {toasts.map((t) => (
          <View
            key={t.id}
            style={[
              styles.toast,
              t.type === "success" ? styles.toastSuccess : styles.toastError,
            ]}
          >
            <Feather
              name={t.type === "success" ? "check-circle" : "alert-circle"}
              size={16}
              color="#fff"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.toastText}>{t.message}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// 9. HIGH-END DESIGN CUSTOM STYLES
const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: "#070a13",
  },
  header: {
    height: 60,
    backgroundColor: "rgba(7, 10, 19, 0.9)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
  },
  brandName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#06b6d4",
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 10,
  },
  roleButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  roleAdmin: {
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  roleUser: {
    backgroundColor: "rgba(6, 182, 212, 0.12)",
    borderColor: "rgba(6, 182, 212, 0.3)",
  },
  roleText: {
    fontSize: 12,
    fontWeight: "700",
  },
  scrollContent: {
    padding: 16,
  },
  offlineBanner: {
    flexDirection: "row",
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  offlineTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fef3c7",
    marginBottom: 2,
  },
  offlineText: {
    fontSize: 11,
    color: "#d1d5db",
  },
  heroCard: {
    backgroundColor: "rgba(20, 30, 55, 0.5)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    lineHeight: 28,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 12,
    color: "#9ca3af",
    lineHeight: 18,
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    color: "#f3f4f6",
    fontSize: 13,
    height: "100%",
  },
  categoryTabs: {
    flexDirection: "row",
    marginBottom: 16,
  },
  categoryTabBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryTabBtnActive: {
    backgroundColor: "#06b6d4",
    borderColor: "transparent",
  },
  categoryTabText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9ca3af",
  },
  categoryTabTextActive: {
    color: "#070a13",
  },
  sortContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sortLabel: {
    fontSize: 12,
    color: "#9ca3af",
  },
  sortPickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  sortPickerText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#f3f4f6",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
  loadingBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 13,
    color: "#9ca3af",
    marginTop: 10,
  },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 2,
  },
  emptyText: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridLarge: {
    // Styling tambahan jika layar desktop
  },
  card: {
    width: "100%",
    backgroundColor: "rgba(17, 24, 39, 0.6)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.07)",
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 16,
  },
  cardLarge: {
    width: "48.5%", // 2 kolom di desktop
  },
  cardImageWrapper: {
    position: "relative",
    height: 160,
    width: "100%",
  },
  cardBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(7, 10, 19, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  cardBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#06b6d4",
  },
  cardImg: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  cardImgFallback: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  detailHero: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  detailHeroImg: {
    width: "100%",
    height: "100%",
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  cardLocRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  cardLocText: {
    fontSize: 11,
    color: "#9ca3af",
  },
  cardDesc: {
    fontSize: 11,
    color: "#9ca3af",
    lineHeight: 16,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.05)",
    paddingTop: 8,
  },
  cardFootLabel: {
    fontSize: 9,
    color: "#9ca3af",
    marginBottom: 1,
  },
  cardPrice: {
    fontSize: 12,
    fontWeight: "700",
    color: "#10b981",
  },
  cardDistance: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
  },
  // ADMIN DASHBOARD
  adminPanel: {
    backgroundColor: "rgba(17, 24, 39, 0.6)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.07)",
    borderRadius: 14,
    padding: 16,
  },
  adminHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
    paddingBottom: 12,
    marginBottom: 16,
  },
  adminTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
  },
  adminSubtitle: {
    fontSize: 11,
    color: "#9ca3af",
  },
  btnAdd: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#06b6d4",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  btnAddText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#070a13",
  },
  adminRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.02)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  adminRowInfo: {
    flex: 1,
    marginRight: 12,
  },
  adminDestName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
  },
  adminDestLoc: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 2,
  },
  adminStatBadge: {
    fontSize: 10,
    fontWeight: "600",
    color: "#fff",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingVertical: 1,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  adminRowActions: {
    flexDirection: "row",
  },
  btnEdit: {
    backgroundColor: "rgba(6, 182, 212, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.3)",
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  btnDelete: {
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  // MODALS GENERAL
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(7, 10, 19, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContent: {
    width: "100%",
    maxHeight: "85%",
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 16,
    padding: 16,
  },
  modalContentLarge: {
    maxWidth: 550,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
    paddingBottom: 10,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
  },
  modalBody: {
    marginBottom: 16,
  },
  modalBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  modalDistanceLabel: {
    fontSize: 11,
    color: "#9ca3af",
    marginLeft: 8,
  },
  modalMetaCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.02)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  modalMetaItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  modalMetaVal: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 6,
    flex: 1,
  },
  modalDescTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
    paddingBottom: 4,
    marginBottom: 8,
    marginTop: 12,
  },
  modalDescText: {
    fontSize: 11,
    color: "#9ca3af",
    lineHeight: 18,
  },
  badgeListContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  facilityBadge: {
    backgroundColor: "rgba(6, 182, 212, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.25)",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  facilityBadgeText: {
    fontSize: 10,
    color: "#cffafe",
  },
  rideBadge: {
    backgroundColor: "rgba(245, 158, 11, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.25)",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  rideBadgeText: {
    fontSize: 10,
    color: "#fef3c7",
  },
  emptyBadgeText: {
    fontSize: 11,
    fontStyle: "italic",
    color: "#4b5563",
  },
  modalCloseBtn: {
    backgroundColor: "#06b6d4",
    borderRadius: 10,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCloseBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#070a13",
  },
  // FORM STYLING
  formLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9ca3af",
    marginBottom: 4,
    marginTop: 8,
  },
  formInput: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    color: "#f3f4f6",
    paddingHorizontal: 10,
    height: 38,
    fontSize: 12,
    marginBottom: 8,
  },
  formSelectBtn: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  formSelectBtnActive: {
    backgroundColor: "#06b6d4",
    borderColor: "transparent",
  },
  formSelectBtnText: {
    fontSize: 11,
    color: "#9ca3af",
  },
  formSelectBtnTextActive: {
    color: "#070a13",
    fontWeight: "700",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
    paddingTop: 12,
    marginTop: 12,
  },
  btnCancel: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  btnCancelText: {
    fontSize: 12,
    color: "#fff",
  },
  btnSave: {
    backgroundColor: "#06b6d4",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  btnSaveText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#070a13",
  },
  // MOBILE FRIENDLY SELECT PICKER MODAL
  pickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(7, 10, 19, 0.7)",
    justifyContent: "flex-end",
  },
  pickerBox: {
    backgroundColor: "#0f172a",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  pickerTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 12,
  },
  pickerItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
  },
  pickerItemActive: {
    backgroundColor: "rgba(6, 182, 212, 0.08)",
    borderRadius: 10,
  },
  pickerItemText: {
    fontSize: 13,
    color: "#9ca3af",
  },
  pickerItemTextActive: {
    color: "#06b6d4",
    fontWeight: "700",
  },
  // FLOATING TOASTS NOTIFICATIONS
  toastContainer: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    zIndex: 999,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  toastSuccess: {
    backgroundColor: "#10b981",
  },
  toastError: {
    backgroundColor: "#ef4444",
  },
  toastText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
    flex: 1,
  },
});
