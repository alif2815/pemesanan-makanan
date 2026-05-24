"use client";

import { useState } from "react";
import Image from "next/image";

// Definisi tipe data untuk TypeScript yang bersih
interface FoodItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
}

interface CartItem {
  food: FoodItem;
  quantity: number;
}

export default function FoodOrderPage() {
  // State untuk manajemen keranjang belanja dan interaksi UI
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Kosongkan array ini atau isi dengan data dari API/Database Anda nantinya
  const foodMenu: FoodItem[] = [];

  // Mendapatkan daftar kategori unik dari menu
  const categories = ["Semua", ...Array.from(new Set(foodMenu.map((item) => item.category)))];

  // Filter menu berdasarkan kategori terpilih
  const filteredMenu = selectedCategory === "Semua" 
    ? foodMenu 
    : foodMenu.filter((item) => item.category === selectedCategory);

  // Fungsi Keranjang: Tambah Item
  const addToCart = (food: FoodItem) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.food.id === food.id);
      if (existing) {
        return prevCart.map((item) =>
          item.food.id === food.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { food, quantity: 1 }];
    });
  };

  // Fungsi Keranjang: Kurangi / Hapus Item
  const removeFromCart = (foodId: string) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.food.id === foodId);
      if (existing?.quantity === 1) {
        return prevCart.filter((item) => item.food.id !== foodId);
      }
      return prevCart.map((item) =>
        item.food.id === foodId ? { ...item, quantity: item.quantity - 1 } : item
      );
    });
  };

  // Hitung Total Pembayaran
  const totalPrice = cart.reduce((sum, item) => sum + item.food.price * item.quantity, 0);

  // Simulasi Proses Checkout
  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    setIsSubmitting(true);
    // Masukkan logika integrasi payment gateway / hit API backend di sini
    setTimeout(() => {
      alert("Pesanan Anda berhasil ditempatkan!");
      setCart([]);
      setIsSubmitting(false);
    }, 2000);
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Kolom Kiri & Tengah: Menu Makanan */}
      <main className="lg:col-span-2 space-y-8">
        {/* Header Toko */}
        <header className="glass-panel p-6 rounded-3xl flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-pink-500 bg-clip-text text-transparent">
              FlavorForge Kitchen
            </h1>
            <p className="text-sm text-zinc-400">Lezat, Higienis, & Siap Diantar</p>
          </div>
          <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" title="Buka" />
        </header>

        {/* Filter Kategori */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 border whitespace-nowrap ${
                selectedCategory === category
                  ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30"
                  : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Grid Menu */}
        {filteredMenu.length === 0 ? (
          <div className="glass-panel rounded-3xl p-12 text-center border-dashed border-zinc-800">
            <div className="w-16 h-16 mx-auto mb-4 bg-zinc-900 rounded-full flex items-center justify-center text-2xl">
              🍽️
            </div>
            <h3 className="text-lg font-semibold text-zinc-300">Belum Ada Menu Tersedia</h3>
            <p className="text-zinc-500 text-sm mt-1">Silakan hubungkan dengan data dummy atau API database Anda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filteredMenu.map((food) => (
              <div key={food.id} className="glass-panel rounded-3xl overflow-hidden flex flex-col group transition-all duration-300 hover:border-zinc-700">
                <div className="relative h-48 w-full bg-zinc-950 overflow-hidden">
                  <Image
                    src={food.image}
                    alt={food.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold text-pink-500 tracking-wider uppercase">
                      {food.category}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1">{food.name}</h3>
                    <p className="text-sm text-zinc-400 line-clamp-2 mt-1">{food.description}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-lg font-extrabold text-white">
                      Rp {food.price.toLocaleString("id-ID")}
                    </span>
                    <button
                      onClick={() => addToCart(food)}
                      className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-sm font-medium rounded-xl hover:bg-indigo-600 hover:border-indigo-500 hover:text-white transition-all duration-200"
                    >
                      Tambah
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Kolom Kanan: Ringkasan Keranjang Belanja */}
      <aside className="lg:col-span-1">
        <div className="glass-panel rounded-3xl p-6 sticky top-8 space-y-6 flex flex-col max-h-[calc(100vh-4rem)]">
          <div className="border-b border-zinc-800 pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              🛒 Keranjang Belanja
              {cart.length > 0 && (
                <span className="text-xs bg-pink-500 text-white px-2 py-0.5 rounded-full font-bold animate-bounce">
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </span>
              )}
            </h2>
          </div>

          {/* List Item Keranjang */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {cart.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 space-y-2">
                <p className="text-4xl">🧺</p>
                <p className="text-sm">Keranjang Anda masih kosong.</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.food.id} className="flex items-center justify-between gap-4 bg-zinc-900/30 p-3 rounded-2xl border border-zinc-800/50">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-white truncate">{item.food.name}</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Rp {(item.food.price * item.quantity).toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-800">
                    <button
                      onClick={() => removeFromCart(item.food.id)}
                      className="text-zinc-400 hover:text-pink-500 font-bold text-sm transition-colors"
                    >
                      －
                    </button>
                    <span className="text-sm font-bold text-white min-w-[16px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => addToCart(item.food)}
                      className="text-zinc-400 hover:text-indigo-400 font-bold text-sm transition-colors"
                    >
                      ＋
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Form Checkout & Total */}
          <div className="border-t border-zinc-800 pt-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-400">Total Pembayaran</span>
              <span className="text-xl font-extrabold text-white">
                Rp {totalPrice.toLocaleString("id-ID")}
              </span>
            </div>

            <form onSubmit={handleCheckout} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Nomor Meja / Alamat</label>
                <input
                  required
                  type="text"
                  placeholder="Contoh: Meja 05 atau Jl. Kenanga"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={cart.length === 0 || isSubmitting}
                className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                  cart.length === 0
                    ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/30"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-custom" />
                    Memproses...
                  </>
                ) : (
                  "Pesan Sekarang"
                )}
              </button>
            </form>
          </div>
        </div>
      </aside>

    </div>
  );
}