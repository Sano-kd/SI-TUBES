import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "mahasiswa" | "penjual";
  contact: string;
  balance: number;
  avatar?: string;
  canteenName?: string;
  password?: string;
}

export interface OrderOptionValue {
  value: string;
  additionalPrice: number;
}

export interface OrderOption {
  title: string;
  options: OrderOptionValue[];
}

export interface Product {
  id: string;
  name: string;
  category: "Food" | "Drink" | "Dessert" | "Snack";
  price: number;
  rating: number;
  totalRating?: number;
  image: string;
  description: string;
  available: boolean;
  sellerId: string;
  canteenName?: string | null;
  orderOptions?: OrderOption[];
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedOptions?: { [title: string]: string };
  catatan?: string;
  checked?: boolean;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image: string;
  selectedOptions?: { [title: string]: string };
  catatan?: string;
}

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  items: OrderItem[];
  total: number;
  paymentMethod: "Saldo";
  status:
    | "Menunggu"
    | "Diterima"
    | "Diproses"
    | "Siap Diambil"
    | "Selesai"
    | "Ditolak";
  date: string;
  sellerId?: string;
  rated?: boolean;
  rejectionReason?: string;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  orderId?: string | null;
  type: "topup" | "purchase" | "income" | "refund";
  amount: number;
  date: string;
  description: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "success" | "error" | "warning";
  read: boolean;
  date: string;
  orderId?: string;
}

export interface CanteenRating {
  id: string;
  canteenId: string;
  studentId: string;
  studentName: string;
  rating: number;
  comment: string;
  date: string;
  orderId: string;
}

interface AppState {
  currentUser: User | null;

  // UI preferences
  darkMode: boolean;
  sidebarCollapsed: boolean;

  // Actions
  setCurrentUser: (user: User | null) => void;
  logout: () => void;

  setDarkMode: (dark: boolean) => void;
  toggleSidebar: () => void;
  notifications: Notification[];

  addNotification: (
    notification: Omit<Notification, "id" | "date" | "read">,
  ) => void;

  markNotificationRead: (id: string) => void;

  markAllNotificationsRead: (userId: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      notifications: [],

      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            {
              ...notification,
              id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              date: new Date().toISOString(),
              read: false,
            },
            ...state.notifications,
          ],
        })),

      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((notification) =>
            notification.id === id
              ? {
                  ...notification,
                  read: true,
                }
              : notification,
          ),
        })),

      markAllNotificationsRead: (userId) =>
        set((state) => ({
          notifications: state.notifications.map((notification) =>
            notification.userId === userId
              ? {
                  ...notification,
                  read: true,
                }
              : notification,
          ),
        })),
      currentUser: null,

      darkMode: false,
      sidebarCollapsed: false,

      setCurrentUser: (user) =>
        set({
          currentUser: user,
        }),

      logout: () =>
        set({
          currentUser: null,
        }),

      setDarkMode: (dark) =>
        set({
          darkMode: dark,
        }),

      toggleSidebar: () =>
        set((state) => ({
          sidebarCollapsed: !state.sidebarCollapsed,
        })),
    }),
    {
      name: "e-kantin-storage",

      partialize: (state) => ({
        currentUser: state.currentUser,
        darkMode: state.darkMode,
        sidebarCollapsed: state.sidebarCollapsed,
        notifications: state.notifications,
      }),
    },
  ),
);
