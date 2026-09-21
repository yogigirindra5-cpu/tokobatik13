import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'wastra_cart';

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw).map((item) => ({ ...item, dipilih: item.dipilih !== false })) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (produk, jumlah = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id_produk === produk.id_produk);
      if (existing) {
        const jumlahBaru = Math.min(existing.jumlah + jumlah, produk.stok);
        return prev.map((item) =>
          item.id_produk === produk.id_produk ? { ...item, jumlah: jumlahBaru } : item
        );
      }
            return [
        ...prev,
        {
          id_produk: produk.id_produk,
          nama_produk: produk.nama_produk,
          harga: produk.harga,
          gambar: produk.gambar,
          stok: produk.stok,
          kategori: produk.kategori,
          bahan_kain: produk.bahan_kain,
          ukuran: produk.ukuran,
          jumlah: Math.min(jumlah, produk.stok),
          dipilih: true,
        },
      ];
    });
  };

  const updateJumlah = (id_produk, jumlah) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id_produk === id_produk
          ? { ...item, jumlah: Math.max(1, Math.min(jumlah, item.stok)) }
          : item
      )
    );
  };

  const removeFromCart = (id_produk) => {
    setItems((prev) => prev.filter((item) => item.id_produk !== id_produk));
  };

  const toggleDipilih = (id_produk) => {
    setItems((prev) => prev.map((item) => (
      item.id_produk === id_produk ? { ...item, dipilih: !item.dipilih } : item
    )));
  };

  const selectedItems = items.filter((item) => item.dipilih);
  const removeSelectedItems = () => {
    setItems((prev) => prev.filter((item) => !item.dipilih));
  };

  const clearCart = () => setItems([]);

  const totalItem = items.reduce((sum, item) => sum + item.jumlah, 0);
  const totalHarga = items.reduce((sum, item) => sum + item.harga * item.jumlah, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        selectedItems,
        addToCart,
        updateJumlah,
        removeFromCart,
        toggleDipilih,
        removeSelectedItems,
        clearCart,
        totalItem,
        totalHarga,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}