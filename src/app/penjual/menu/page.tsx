"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CookingPot,
  Plus,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  X,
} from "lucide-react";
import { Product, useStore } from "@/store/useStore";
import { useToastStore } from "@/store/useToastStore";
import Dialog from "@/components/ui/dialog";

export default function SellerMenuPage() {
  const currentUser = useStore((state) => state.currentUser);

  const [products, setProducts] = useState<Product[]>([]);

  const toast = useToastStore((state) => state.toast);

  // Filter products for this specific canteen seller
  const sellerProducts = currentUser
    ? products.filter((p) => p.sellerId === currentUser.id)
    : [];

  // Modal / Form States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Field States
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Product["category"] | "">("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [available, setAvailable] = useState(true);

  // Dynamic variation fields
  type VariationOptionForm = {
    value: string;
    additionalPrice: string;
  };

  type VariationForm = {
    title: string;
    options: VariationOptionForm[];
  };

  const [variations, setVariations] = useState<VariationForm[]>([
    {
      title: "",
      options: [
        {
          value: "",
          additionalPrice: "0",
        },
      ],
    },
  ]);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products", {
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Gagal mengambil data menu");
        }

        setProducts(result.data);
      } catch (error) {
        console.error("GET SELLER PRODUCTS ERROR:", error);
        toast("Gagal mengambil data menu dari database.", "error");
      }
    };

    fetchProducts();
  }, [toast]);

  if (!currentUser) return null;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setName("");
    setCategory("");
    setPrice("");
    setImage("");
    setDescription("");
    setAvailable(true);
    setVariations([
      {
        title: "",
        options: [
          {
            value: "",
            additionalPrice: "0",
          },
        ],
      },
    ]);
    setModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingId(product.id);
    setName(product.name);
    setCategory(product.category);
    setPrice(product.price.toString());
    setImage(product.image);
    setDescription(product.description);
    setAvailable(product.available);

    if (product.orderOptions && product.orderOptions.length > 0) {
      setVariations(
        product.orderOptions.map((option) => ({
          title: option.title,

          options: option.options.map((item) => ({
            value: item.value,
            additionalPrice: item.additionalPrice.toString(),
          })),
        })),
      );
    } else {
      setVariations([
        {
          title: "",
          options: [
            {
              value: "",
              additionalPrice: "0",
            },
          ],
        },
      ]);
    }
    setModalOpen(true);
  };

  const handleToggleAvailable = async (
    productId: string,
    currentVal: boolean,
  ) => {
    try {
      const newAvailable = !currentVal;

      const response = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          available: newAvailable,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal mengubah ketersediaan menu");
      }

      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product.id === productId
            ? {
                ...product,
                available: newAvailable,
              }
            : product,
        ),
      );

      toast("Status ketersediaan menu diubah.", "success");
    } catch (error) {
      console.error("TOGGLE PRODUCT ERROR:", error);
      toast("Gagal mengubah status ketersediaan menu.", "error");
    }
  };

  const handleDelete = async (productId: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus "${name}" dari menu?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal menghapus menu");
      }

      setProducts((currentProducts) =>
        currentProducts.filter((product) => product.id !== productId),
      );

      toast("Data berhasil dihapus.", "success");
    } catch (error) {
      console.error("DELETE PRODUCT ERROR:", error);
      toast("Gagal menghapus menu.", "error");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast("Nama wajib diisi.", "error");
      return;
    }
    if (!category) {
      toast("Kategori wajib dipilih.", "error");
      return;
    }
    const priceNum = Number(price);
    if (!price || isNaN(priceNum) || priceNum <= 0) {
      toast("Harga wajib diisi.", "error");
      return;
    }
    if (!image) {
      toast("Upload gambar terlebih dahulu.", "error");
      return;
    }

    // Build custom variation option if input exists
    const orderOptions: Product["orderOptions"] = variations
      .map((variation) => ({
        title: variation.title.trim(),

        options: variation.options
          .map((option) => ({
            value: option.value.trim(),
            additionalPrice: Number(option.additionalPrice) || 0,
          }))
          .filter((option) => option.value.length > 0),
      }))
      .filter(
        (variation) =>
          variation.title.length > 0 && variation.options.length > 0,
      );

    if (editingId) {
      try {
        const response = await fetch(`/api/products/${editingId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            category,
            price: priceNum,
            image,
            description,
            available,
            orderOptions,
          }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Gagal memperbarui menu");
        }

        // Ambil ulang products dari database
        const productsResponse = await fetch("/api/products", {
          cache: "no-store",
        });

        const productsResult = await productsResponse.json();

        if (!productsResponse.ok || !productsResult.success) {
          throw new Error(
            productsResult.message || "Gagal memperbarui daftar menu",
          );
        }

        setProducts(productsResult.data);

        toast("Data berhasil diperbarui.", "success");
        setModalOpen(false);
      } catch (error) {
        console.error("UPDATE PRODUCT ERROR:", error);
        toast("Gagal memperbarui menu.", "error");
      }
    } else {
      // Add product melalui API
      try {
        const response = await fetch("/api/products", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            category,
            price: priceNum,
            image,
            description,
            available,
            sellerId: currentUser.id,
            orderOptions,
          }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Gagal menambahkan menu");
        }

        const productsResponse = await fetch("/api/products", {
          cache: "no-store",
        });

        const productsResult = await productsResponse.json();

        if (!productsResponse.ok || !productsResult.success) {
          throw new Error(
            productsResult.message || "Gagal memperbarui daftar menu",
          );
        }

        setProducts(productsResult.data);

        toast("Data berhasil disimpan.", "success");
        setModalOpen(false);
      } catch (error) {
        console.error("CREATE PRODUCT ERROR:", error);
        toast("Gagal menambahkan menu.", "error");
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <CookingPot className="w-5 h-5 text-primary" />
          <h3 className="font-extrabold text-lg text-foreground">
            Kelola Daftar Menu
          </h3>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-md shadow-primary/25 hover:shadow-lg transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Menu Baru</span>
        </button>
      </div>

      {/* Responsive List of products for the Canteen Seller */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {sellerProducts.map((product) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-3xl p-4 shadow-soft flex gap-4 hover:shadow-premium hover-scale transition-shadow"
            >
              {/* Product Thumbnail image */}
              <div className="relative w-28 self-stretch min-h-32 rounded-2xl overflow-hidden shrink-0 bg-muted border border-border/80">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />

                {/* Availability indicator badge overlay */}
                <span
                  className={`absolute bottom-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-md
                  ${product.available ? "bg-emerald-500 text-white" : "bg-destructive text-white"}
                `}
                >
                  {product.available ? "Ready" : "Habis"}
                </span>
              </div>

              {/* Product Info & Actions */}
              <div className="flex flex-col justify-between flex-1 min-w-0">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-sm text-foreground truncate">
                      {product.name}
                    </h4>
                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-lg font-bold shrink-0">
                      {product.category}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-1 mt-1 leading-normal">
                    {product.description || "Tidak ada deskripsi."}
                  </p>

                  {product.orderOptions && product.orderOptions.length > 0 && (
                    <div className="mt-1 space-y-1">
                      {product.orderOptions.map((option, index) => (
                        <p
                          key={index}
                          className="text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded truncate"
                        >
                          💡 💡 {option.title}:{" "}
                          {option.options
                            .map((item) =>
                              item.additionalPrice > 0
                                ? `${item.value} (+${formatRupiah(item.additionalPrice)})`
                                : item.value,
                            )
                            .join(", ")}
                        </p>
                      ))}
                    </div>
                  )}

                  <p className="text-xs font-extrabold text-foreground mt-1.5">
                    {formatRupiah(product.price)}
                  </p>
                </div>

                {/* Edit, Delete, Toggle Availability buttons */}
                <div className="flex items-center justify-between border-t border-border/40 pt-2 mt-2">
                  <button
                    onClick={() =>
                      handleToggleAvailable(product.id, product.available)
                    }
                    className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    title="Klik untuk ubah ketersediaan produk"
                  >
                    {product.available ? (
                      <ToggleRight className="w-5 h-5 text-emerald-500 shrink-0" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-muted-foreground shrink-0" />
                    )}
                    <span>Tersedia</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(product)}
                      className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-primary transition-colors shrink-0"
                      title="Edit Item"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDelete(product.id, product.name)}
                      className="p-1.5 rounded-lg border border-destructive/20 hover:bg-destructive/10 text-destructive transition-colors shrink-0"
                      title="Hapus Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* CRUD Product Modal Dialog */}
      <Dialog
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Menu Hidangan" : "Tambah Menu Hidangan Baru"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1.5">
              Nama Menu Makanan / Minuman
            </label>
            <input
              type="text"
              placeholder="cth. Chicken Rice Bowl Mentai"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1.5">
                Kategori Menu
              </label>
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as Product["category"])
                }
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground font-bold"
              >
                <option value="">-- Pilih Kategori --</option>
                <option value="Food">Food 🍔</option>
                <option value="Drink">Drink 🥤</option>
                <option value="Dessert">Dessert 🍰</option>
                <option value="Snack">Snack 🍟</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1.5">
                Harga Hidangan (Rp)
              </label>
              <input
                type="number"
                placeholder="cth. 25000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground font-bold"
                min="0"
                required
              />
            </div>
          </div>

          {/* Manual image upload with FileReader preview */}
          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1.5">
              Foto Menu Makanan/Minuman
            </label>
            <div className="flex flex-col gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 file:cursor-pointer"
              />
              {image && (
                <div className="relative h-32 w-full rounded-xl overflow-hidden border border-border mt-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt="Preview Gambar"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImage("")}
                    className="absolute top-2 right-2 p-1.5 bg-zinc-950/60 hover:bg-zinc-950/80 text-white rounded-full transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Dynamic menu variations */}
          <div className="p-3.5 bg-muted/40 border border-border/40 rounded-2xl space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h5 className="font-bold text-xs text-foreground">
                  Variasi Menu Kustom
                </h5>

                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Tambahkan variasi seperti pilihan nasi, level pedas, topping,
                  dan lainnya.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setVariations((currentVariations) => [
                    ...currentVariations,
                    {
                      title: "",
                      options: [
                        {
                          value: "",
                          additionalPrice: "0",
                        },
                      ],
                    },
                  ])
                }
                className="flex items-center gap-1 px-3 py-2 rounded-xl border border-primary/30 text-primary hover:bg-primary/10 text-[10px] font-bold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Variasi
              </button>
            </div>

            <div className="space-y-3">
              {variations.map((variation, index) => (
                <div
                  key={index}
                  className="p-3 bg-background border border-border rounded-xl space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-muted-foreground">
                      Variasi {index + 1}
                    </span>

                    {variations.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setVariations((currentVariations) =>
                            currentVariations.filter(
                              (_, variationIndex) => variationIndex !== index,
                            ),
                          )
                        }
                        className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                        title="Hapus Variasi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-muted-foreground font-bold block mb-1">
                        Nama Variasi
                      </label>

                      <input
                        type="text"
                        placeholder="cth. Pilihan Nasi"
                        value={variation.title}
                        onChange={(e) => {
                          const value = e.target.value;

                          setVariations((currentVariations) =>
                            currentVariations.map((item, variationIndex) =>
                              variationIndex === index
                                ? {
                                    ...item,
                                    title: value,
                                  }
                                : item,
                            ),
                          );
                        }}
                        className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-hidden text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-muted-foreground font-bold block mb-1">
                        Opsi dan Harga Tambahan
                      </label>

                      <div className="space-y-2">
                        {variation.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className="p-3 bg-muted/30 border border-border rounded-xl space-y-2"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-muted-foreground">
                                  Nama Opsi
                                </label>

                                <input
                                  type="text"
                                  placeholder="Contoh: Pakai Nasi"
                                  value={option.value}
                                  onChange={(event) => {
                                    const value = event.target.value;

                                    setVariations((currentVariations) =>
                                      currentVariations.map(
                                        (item, itemIndex) =>
                                          itemIndex === index
                                            ? {
                                                ...item,
                                                options: item.options.map(
                                                  (
                                                    currentOption,
                                                    currentOptionIndex,
                                                  ) =>
                                                    currentOptionIndex ===
                                                    optionIndex
                                                      ? {
                                                          ...currentOption,
                                                          value,
                                                        }
                                                      : currentOption,
                                                ),
                                              }
                                            : item,
                                      ),
                                    );
                                  }}
                                  className="w-full min-w-0 px-3 py-2 border border-border rounded-xl bg-background text-sm"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-muted-foreground">
                                  Harga Tambahan
                                </label>

                                <input
                                  type="number"
                                  min="0"
                                  placeholder="0"
                                  value={option.additionalPrice}
                                  onChange={(event) => {
                                    const additionalPrice = event.target.value;

                                    setVariations((currentVariations) =>
                                      currentVariations.map(
                                        (item, itemIndex) =>
                                          itemIndex === index
                                            ? {
                                                ...item,
                                                options: item.options.map(
                                                  (
                                                    currentOption,
                                                    currentOptionIndex,
                                                  ) =>
                                                    currentOptionIndex ===
                                                    optionIndex
                                                      ? {
                                                          ...currentOption,
                                                          additionalPrice,
                                                        }
                                                      : currentOption,
                                                ),
                                              }
                                            : item,
                                      ),
                                    );
                                  }}
                                  className="w-full min-w-0 px-3 py-2 border border-border rounded-xl bg-background text-sm"
                                />
                              </div>
                            </div>

                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() =>
                                  setVariations((currentVariations) =>
                                    currentVariations.map((item, itemIndex) =>
                                      itemIndex === index
                                        ? {
                                            ...item,
                                            options:
                                              item.options.length > 1
                                                ? item.options.filter(
                                                    (_, currentOptionIndex) =>
                                                      currentOptionIndex !==
                                                      optionIndex,
                                                  )
                                                : item.options,
                                          }
                                        : item,
                                    ),
                                  )
                                }
                                disabled={variation.options.length <= 1}
                                className="text-xs font-semibold text-destructive hover:underline disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                              >
                                Hapus Opsi
                              </button>
                            </div>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() =>
                            setVariations((currentVariations) =>
                              currentVariations.map((item, itemIndex) =>
                                itemIndex === index
                                  ? {
                                      ...item,
                                      options: [
                                        ...item.options,
                                        {
                                          value: "",
                                          additionalPrice: "0",
                                        },
                                      ],
                                    }
                                  : item,
                              ),
                            )
                          }
                          className="text-xs font-bold text-primary hover:underline cursor-pointer"
                        >
                          + Tambah Opsi
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1.5">
              Deskripsi Menu / Keterangan
            </label>
            <textarea
              placeholder="Deskripsikan komposisi hidangan lezat Anda..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground h-20 resize-none"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 bg-muted/40 rounded-2xl border border-border/40 select-none">
            <div>
              <h5 className="font-bold text-xs text-foreground">
                Menu Tersedia untuk Dipesan
              </h5>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Mahasiswa bisa melihat dan membeli menu ini
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAvailable(!available)}
              className="cursor-pointer shrink-0"
            >
              {available ? (
                <ToggleRight className="w-8 h-8 text-emerald-500" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-muted-foreground" />
              )}
            </button>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-1.5 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-md shadow-primary/20 hover:shadow-lg transition-all cursor-pointer mt-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {editingId ? "Simpan Pembaruan Menu" : "Tambahkan Menu Hidangan"}
            </span>
          </button>
        </form>
      </Dialog>
    </div>
  );
}
