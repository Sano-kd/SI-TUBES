import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'mahasiswa' | 'penjual';
  contact: string;
  balance: number;
  avatar?: string;
  canteenName?: string;
  password?: string;
}

export interface OrderOption {
  title: string;
  options: string[];
}

export interface Product {
  id: string;
  name: string;
  category: 'Food' | 'Drink' | 'Dessert' | 'Snack';
  price: number;
  rating: number;
  image: string;
  description: string;
  available: boolean;
  sellerId: string;
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
  paymentMethod: 'Saldo';
  status: 'Menunggu' | 'Diterima' | 'Diproses' | 'Siap Diambil' | 'Selesai' | 'Ditolak';
  date: string;
  sellerId?: string;
  rated?: boolean;
  rejectionReason?: string;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'topup' | 'purchase' | 'income';
  amount: number;
  date: string;
  description: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
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
  // Authentication & Users
  currentUser: User | null;
  users: User[];

  // Menu Products
  products: Product[];

  // Cart
  cart: CartItem[];

  // Orders
  orders: Order[];

  // Wallet Transactions
  transactions: WalletTransaction[];

  // Notifications
  notifications: Notification[];

  // Canteen Ratings
  canteenRatings: CanteenRating[];

  // UI preferences
  darkMode: boolean;
  sidebarCollapsed: boolean;

  // Actions
  setDarkMode: (dark: boolean) => void;
  toggleSidebar: () => void;
  login: (email: string, password: string) => { success: boolean; message: string };
  register: (details: Omit<User, 'id' | 'balance'> & { passwordConfirm: string }) => { success: boolean; message: string };
  logout: () => void;
  updateProfile: (details: Partial<User>) => void;

  // Cart Actions
  addToCartWithOptions: (product: Product, quantity: number, options: { selectedOptions?: { [title: string]: string }; catatan?: string }) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, type: 'inc' | 'dec') => void;
  clearCart: () => void;
  toggleCartItemChecked: (cartItemId: string) => void;
  toggleAllCartItemsChecked: (checked: boolean) => void;
  updateCartItemOptions: (cartItemId: string, quantity: number, options: { selectedOptions?: { [title: string]: string }; catatan?: string }) => void;

  // Checkout & Wallet Actions
  checkout: () => { success: boolean; message: string; orderId?: string };
  topUp: (amount: number) => void;

  // Penjual CRUD Operations
  addProduct: (product: Omit<Product, 'id' | 'rating'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Seller Order status actions
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  rejectOrder: (orderId: string, reason: string) => void;

  // Notifications
  addNotification: (notification: Omit<Notification, 'id' | 'date' | 'read'>) => void;
  markNotificationRead: (notifId: string) => void;
  markAllNotificationsRead: (userId: string) => void;

  // Ratings
  addCanteenRating: (rating: Omit<CanteenRating, 'id' | 'date'>) => void;
  markOrderRated: (orderId: string) => void;
}

// Initial mock data
const INITIAL_PRODUCTS: Product[] = [
  // Kantin Mencintai (usr-2) - Foods
  {
    id: 'prod-1',
    name: 'Chicken Rice Bowl',
    category: 'Food',
    price: 25000,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=60',
    description: 'Nasi hangat dengan ayam pop corn gurih dan telur mata sapi setengah matang disiram saus mentai.',
    available: true,
    sellerId: 'usr-2',
    orderOptions: [
      { title: 'Pilihan Nasi', options: ['Tidak pakai nasi', 'Nasi sedikit', 'Nasi normal', 'Tambah nasi'] },
      { title: 'Level Pedas', options: ['Tidak pedas', 'Sedang', 'Pedas', 'Extra pedas'] },
    ]
  },
  {
    id: 'prod-2',
    name: 'Nasi Goreng Gila Canteen',
    category: 'Food',
    price: 22000,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=60',
    description: 'Nasi goreng bumbu rempah dengan topping bakso, sosis, telur ayam orak-arik, dan sayuran segar.',
    available: true,
    sellerId: 'usr-2',
    orderOptions: [
      { title: 'Level Pedas', options: ['Tidak pedas', 'Sedang', 'Pedas', 'Extra pedas'] },
      { title: 'Topping Tambahan', options: ['Tanpa topping', 'Tambah telur', 'Tambah bakso', 'Tambah keju'] },
    ]
  },
  {
    id: 'prod-3',
    name: 'Ayam Geprek Mozzarella',
    category: 'Food',
    price: 24000,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=60',
    description: 'Dada ayam krispi digeprek dengan sambal bawang khas solo, diselimuti keju mozzarella leleh hangat.',
    available: true,
    sellerId: 'usr-2',
    orderOptions: [
      { title: 'Pilihan Nasi', options: ['Tidak pakai nasi', 'Nasi sedikit', 'Nasi normal', 'Tambah nasi'] },
      { title: 'Level Pedas', options: ['Tidak pedas', 'Sedang', 'Pedas', 'Extra pedas'] },
      { title: 'Keju', options: ['Tanpa keju', 'Tambah keju mozzarella'] },
    ]
  },
  {
    id: 'prod-4',
    name: 'Mie Goreng Katsu Cabe Ijo',
    category: 'Food',
    price: 20000,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=60',
    description: 'Mie goreng lezat disajikan dengan chicken katsu renyah dan sambal cabe ijo pedas mantap.',
    available: true,
    sellerId: 'usr-2',
    orderOptions: [
      { title: 'Level Pedas', options: ['Tidak pedas', 'Sedang', 'Pedas', 'Extra pedas'] },
    ]
  },
  // Kantin Mencintai - Drinks
  {
    id: 'prod-5',
    name: 'Caramel Frappuccino',
    category: 'Drink',
    price: 18000,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=60',
    description: 'Kopi blend es premium dengan sirup karamel manis lembut, whipped cream, dan saus karamel di atasnya.',
    available: true,
    sellerId: 'usr-2',
    orderOptions: [
      { title: 'Tingkat Manis', options: ['Less sweet', 'Normal', 'Extra sweet'] },
      { title: 'Es', options: ['Tanpa es', 'Es sedikit', 'Es normal', 'Extra es'] },
    ]
  },
  {
    id: 'prod-6',
    name: 'Matcha Latte Ice',
    category: 'Drink',
    price: 15000,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=60',
    description: 'Bubuk matcha murni Jepang diseduh dengan susu segar dingin dan pemanis alami madu.',
    available: true,
    sellerId: 'usr-2',
    orderOptions: [
      { title: 'Tingkat Manis', options: ['Less sweet', 'Normal', 'Extra sweet'] },
      { title: 'Suhu', options: ['Hot', 'Iced'] },
    ]
  },
  // Kantin Mencintai - Dessert
  {
    id: 'prod-7',
    name: 'Croissant Almond Butter',
    category: 'Dessert',
    price: 18000,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=60',
    description: 'Croissant renyah mentega berlapis dihiasi irisan kacang almond renyah dan taburan gula bubuk halus.',
    available: true,
    sellerId: 'usr-2',
    orderOptions: [
      { title: 'Kondisi', options: ['Original', 'Dipanaskan', 'Dengan saus ekstra'] },
    ]
  },
  // Kantin Mencintai - Snack
  {
    id: 'prod-8',
    name: 'Dimsum Mentai Mozzarella',
    category: 'Snack',
    price: 16000,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=60',
    description: '4 buah siomay ayam udang lembut dibalut saus mentai creamy gurih dibakar dengan keju mozzarella.',
    available: true,
    sellerId: 'usr-2',
    orderOptions: [
      { title: 'Level Pedas', options: ['Tidak pedas', 'Sedang', 'Pedas'] },
      { title: 'Porsi', options: ['4 pcs', '8 pcs'] },
    ]
  },

  // Kantin Sejahtera (usr-seller-2) - Foods
  {
    id: 'prod-9',
    name: 'Beef Teriyaki Bowl',
    category: 'Food',
    price: 30000,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=600&auto=format&fit=crop&q=60',
    description: 'Irisan daging sapi empuk dimasak saus teriyaki manis gurih, bawang bombay, taburan wijen di atas nasi.',
    available: true,
    sellerId: 'usr-seller-2',
    orderOptions: [
      { title: 'Pilihan Nasi', options: ['Tidak pakai nasi', 'Nasi sedikit', 'Nasi normal', 'Tambah nasi'] },
      { title: 'Topping', options: ['Tanpa topping', 'Tambah telur', 'Tambah keju'] },
    ]
  },
  {
    id: 'prod-10',
    name: 'Kwetiau Sapi Goreng',
    category: 'Food',
    price: 23000,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&auto=format&fit=crop&q=60',
    description: 'Kwetiau kenyal digoreng dengan irisan daging sapi tipis, toge segar, telur bebek orak-arik.',
    available: true,
    sellerId: 'usr-seller-2',
    orderOptions: [
      { title: 'Level Pedas', options: ['Tidak pedas', 'Sedang', 'Pedas'] },
      { title: 'Topping', options: ['Tanpa topping', 'Tambah telur bebek', 'Tambah ceker'] },
    ]
  },
  // Kantin Sejahtera - Drinks
  {
    id: 'prod-11',
    name: 'Avocado Juice Premium',
    category: 'Drink',
    price: 14000,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1589733901241-5e53429e1db4?w=600&auto=format&fit=crop&q=60',
    description: 'Jus buah alpukat mentega segar kental disajikan dengan susu kental manis cokelat di sekeliling gelas.',
    available: true,
    sellerId: 'usr-seller-2',
    orderOptions: [
      { title: 'Tingkat Manis', options: ['Less sweet', 'Normal', 'Extra sweet'] },
      { title: 'Tanpa susu kental manis', options: ['Dengan SKM', 'Tanpa SKM'] },
    ]
  },
  {
    id: 'prod-12',
    name: 'Vietnamese Drip Coffee',
    category: 'Drink',
    price: 16000,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=60',
    description: 'Seduhan kopi robusta pekat khas vietnam menetes perlahan di atas susu kental manis lezat.',
    available: true,
    sellerId: 'usr-seller-2',
    orderOptions: [
      { title: 'Suhu', options: ['Hot', 'Iced'] },
      { title: 'Tingkat Manis', options: ['Tanpa gula', 'Less sweet', 'Normal'] },
    ]
  },
  // Kantin Sejahtera - Dessert
  {
    id: 'prod-13',
    name: 'Tiramisu Slice Classic',
    category: 'Dessert',
    price: 22000,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop&q=60',
    description: 'Dessert klasik Italia berlapis biskuit ladyfinger terendam espresso, keju mascarpone lembut, bubuk cokelat.',
    available: true,
    sellerId: 'usr-seller-2',
    orderOptions: [
      { title: 'Porsi', options: ['1 slice', '2 slice'] },
    ]
  },
  // Kantin Sejahtera - Snack
  {
    id: 'prod-14',
    name: 'Cireng Rujak Garing',
    category: 'Snack',
    price: 10000,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=60',
    description: 'Cireng aci goreng garing krispi di luar lembut kenyal di dalam dicocol bumbu rujak pedas manis asam.',
    available: true,
    sellerId: 'usr-seller-2',
    orderOptions: [
      { title: 'Level Pedas Bumbu', options: ['Tidak pedas', 'Sedang', 'Pedas', 'Extra pedas'] },
      { title: 'Porsi', options: ['Reguler (10 pcs)', 'Jumbo (20 pcs)'] },
    ]
  },
];

const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    name: 'Kadek Sudarsana',
    email: 'kadek@mahasiswa.id',
    role: 'mahasiswa',
    contact: '082111222333',
    balance: 150000,
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=60',
    password: 'password'
  },
  {
    id: 'usr-2',
    name: 'Budi Santoso',
    email: 'kantin@mencintai.id',
    role: 'penjual',
    contact: '081234567890',
    balance: 250000,
    avatar: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=150&auto=format&fit=crop&q=60',
    canteenName: 'Mencintai',
    password: 'password'
  },
  {
    id: 'usr-seller-2',
    name: 'Dewi Rahayu',
    email: 'kantin@sejahtera.id',
    role: 'penjual',
    contact: '081222333444',
    balance: 100000,
    avatar: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=150&auto=format&fit=crop&q=60',
    canteenName: 'Sejahtera',
    password: 'password'
  }
];

const INITIAL_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'tx-w-1',
    userId: 'usr-1',
    type: 'topup',
    amount: 150000,
    date: '2026-06-24T08:00:00.000Z',
    description: 'Top Up Saldo e-Kantin'
  },
  {
    id: 'tx-w-2',
    userId: 'usr-1',
    type: 'purchase',
    amount: 25000,
    date: '2026-06-24T09:30:00.000Z',
    description: 'Pembelian Chicken Rice Bowl'
  },
  {
    id: 'tx-w-4',
    userId: 'usr-2',
    type: 'income',
    amount: 25000,
    date: '2026-06-24T09:30:00.000Z',
    description: 'Penjualan Menu: Chicken Rice Bowl'
  },
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'TX-10001',
    buyerId: 'usr-1',
    buyerName: 'Kadek Sudarsana',
    items: [
      {
        productId: 'prod-1',
        productName: 'Chicken Rice Bowl',
        price: 25000,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&auto=format&fit=crop&q=60',
        selectedOptions: { 'Pilihan Nasi': 'Nasi normal', 'Level Pedas': 'Sedang' }
      }
    ],
    total: 25000,
    paymentMethod: 'Saldo',
    status: 'Selesai',
    date: '2026-06-24T09:30:00.000Z',
    sellerId: 'usr-2',
    rated: false
  },
  {
    id: 'TX-10002',
    buyerId: 'usr-3',
    buyerName: 'Ahmad Rafli',
    items: [
      {
        productId: 'prod-2',
        productName: 'Nasi Goreng Gila Canteen',
        price: 22000,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=150&auto=format&fit=crop&q=60',
        selectedOptions: { 'Level Pedas': 'Pedas' }
      },
    ],
    total: 22000,
    paymentMethod: 'Saldo',
    status: 'Siap Diambil',
    date: '2026-06-24T10:15:00.000Z',
    sellerId: 'usr-2'
  },
  {
    id: 'TX-10003',
    buyerId: 'usr-4',
    buyerName: 'Siti Aminah',
    items: [
      {
        productId: 'prod-3',
        productName: 'Ayam Geprek Mozzarella',
        price: 24000,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=150&auto=format&fit=crop&q=60',
        selectedOptions: { 'Pilihan Nasi': 'Nasi normal', 'Level Pedas': 'Extra pedas' }
      },
    ],
    total: 48000,
    paymentMethod: 'Saldo',
    status: 'Diterima',
    date: '2026-06-24T10:45:00.000Z',
    sellerId: 'usr-2'
  },
  {
    id: 'TX-10004',
    buyerId: 'usr-1',
    buyerName: 'Kadek Sudarsana',
    items: [
      {
        productId: 'prod-9',
        productName: 'Beef Teriyaki Bowl',
        price: 30000,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=150&auto=format&fit=crop&q=60',
        selectedOptions: { 'Pilihan Nasi': 'Nasi normal', 'Topping': 'Tambah telur' }
      },
    ],
    total: 30000,
    paymentMethod: 'Saldo',
    status: 'Diproses',
    date: '2026-06-25T11:00:00.000Z',
    sellerId: 'usr-seller-2'
  }
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    userId: 'usr-1',
    title: 'Pesanan Selesai',
    message: 'Pesanan Chicken Rice Bowl sudah selesai, silahkan ambil di Kantin Mencintai.',
    type: 'success',
    read: false,
    date: '2026-06-24T09:30:00.000Z',
    orderId: 'TX-10001'
  }
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: INITIAL_USERS,
      products: INITIAL_PRODUCTS,
      cart: [],
      orders: INITIAL_ORDERS,
      transactions: INITIAL_TRANSACTIONS,
      notifications: INITIAL_NOTIFICATIONS,
      canteenRatings: [],
      darkMode: false,
      sidebarCollapsed: false,

      setDarkMode: (dark) => set({ darkMode: dark }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      login: (email, password) => {
        const users = get().users;
        const matched = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (!matched) {
          return { success: false, message: 'Akun belum terdaftar. Silakan lakukan registrasi terlebih dahulu.' };
        }

        const expectedPassword = matched.password || 'password';
        if (password !== expectedPassword) {
          return { success: false, message: 'Password yang Anda masukkan salah.' };
        }

        set({ currentUser: matched });
        return { success: true, message: 'Berhasil masuk!' };
      },

      register: (details) => {
        const users = get().users;
        const exists = users.some(u => u.email.toLowerCase() === details.email.toLowerCase());

        if (exists) {
          return { success: false, message: 'Email sudah terdaftar!' };
        }

        if (details.password && details.password.length < 8) {
          return { success: false, message: 'Password minimal 8 karakter.' };
        }

        const newUser: User = {
          id: `usr-${Date.now()}`,
          name: details.name,
          email: details.email,
          role: details.role,
          contact: details.contact,
          balance: 0,
          avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(details.name)}`,
          canteenName: details.role === 'penjual' ? details.canteenName || 'Kantin Saya' : undefined,
          password: details.password
        };

        set({
          users: [...users, newUser]
        });

        return { success: true, message: 'Registrasi berhasil. Silakan login menggunakan akun yang telah dibuat.' };
      },

      logout: () => set({ currentUser: null, cart: [] }),

      updateProfile: (details) => set((state) => {
        if (!state.currentUser) return state;
        const updatedUser = { ...state.currentUser, ...details };
        const updatedUsers = state.users.map(u => u.id === state.currentUser?.id ? updatedUser : u);

        const updatedOrders = state.orders.map(o => {
          if (o.buyerId === state.currentUser?.id) {
            return { ...o, buyerName: updatedUser.name };
          }
          return o;
        });

        return {
          currentUser: updatedUser,
          users: updatedUsers,
          orders: updatedOrders
        };
      }),

      addToCartWithOptions: (product, quantity, options) => set((state) => {
        const optKey = JSON.stringify(options.selectedOptions || {});
        const configId = `${product.id}-${optKey}-${options.catatan || ''}`;
        const existing = state.cart.find(item => item.id === configId);

        let newCart;
        if (existing) {
          newCart = state.cart.map(item =>
            item.id === configId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          newCart = [...state.cart, {
            id: configId,
            product,
            quantity,
            selectedOptions: options.selectedOptions,
            catatan: options.catatan,
            checked: true
          }];
        }
        return { cart: newCart };
      }),

      removeFromCart: (cartItemId) => set((state) => ({
        cart: state.cart.filter(item => item.id !== cartItemId)
      })),

      updateQuantity: (cartItemId, type) => set((state) => ({
        cart: state.cart.map(item => {
          if (item.id === cartItemId) {
            const newQty = type === 'inc' ? item.quantity + 1 : item.quantity - 1;
            return { ...item, quantity: Math.max(1, newQty) };
          }
          return item;
        })
      })),

      clearCart: () => set({ cart: [] }),

      toggleCartItemChecked: (cartItemId) => set((state) => ({
        cart: state.cart.map(item =>
          item.id === cartItemId ? { ...item, checked: !item.checked } : item
        )
      })),

      toggleAllCartItemsChecked: (checked) => set((state) => ({
        cart: state.cart.map(item => ({ ...item, checked }))
      })),

      updateCartItemOptions: (cartItemId, quantity, options) => set((state) => {
        const rawCart = state.cart.map(item => {
          if (item.id === cartItemId) {
            const optKey = JSON.stringify(options.selectedOptions || {});
            const newId = `${item.product.id}-${optKey}-${options.catatan || ''}`;
            return {
              ...item,
              id: newId,
              quantity,
              selectedOptions: options.selectedOptions,
              catatan: options.catatan
            };
          }
          return item;
        });

        // Merge duplicates
        const merged: { [id: string]: CartItem } = {};
        rawCart.forEach(item => {
          if (merged[item.id]) {
            merged[item.id].quantity += item.quantity;
          } else {
            merged[item.id] = { ...item };
          }
        });

        return { cart: Object.values(merged) };
      }),

      topUp: (amount) => set((state) => {
        if (!state.currentUser) return state;

        const updatedUser = {
          ...state.currentUser,
          balance: state.currentUser.balance + amount
        };

        const newTx: WalletTransaction = {
          id: `tx-w-${Date.now()}`,
          userId: state.currentUser.id,
          type: 'topup',
          amount: amount,
          date: new Date().toISOString(),
          description: `Top Up Saldo via Transfer`
        };

        return {
          currentUser: updatedUser,
          users: state.users.map(u => u.id === state.currentUser?.id ? updatedUser : u),
          transactions: [newTx, ...state.transactions]
        };
      }),

      checkout: () => {
        const state = get();
        const buyer = state.currentUser;
        if (!buyer) return { success: false, message: 'Silahkan login terlebih dahulu' };

        const checkedItems = state.cart.filter(item => item.checked);
        if (checkedItems.length === 0) {
          return { success: false, message: 'Tidak ada item yang dicentang untuk dibeli.' };
        }

        const subtotal = checkedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
        const serviceFee = subtotal > 0 ? 2000 : 0;
        const total = subtotal + serviceFee;

        if (buyer.balance < total) {
          return { success: false, message: 'Saldo tidak mencukupi, silahkan top up' };
        }

        const updatedBuyer = {
          ...buyer,
          balance: buyer.balance - total
        };

        // Group by sellerId
        const itemsBySeller: { [sellerId: string]: typeof checkedItems } = {};
        checkedItems.forEach(item => {
          const sId = item.product.sellerId || 'usr-2';
          if (!itemsBySeller[sId]) {
            itemsBySeller[sId] = [];
          }
          itemsBySeller[sId].push(item);
        });

        const newOrders: Order[] = [];
        const newTransactions: WalletTransaction[] = [];
        const newNotifications: Notification[] = [];

        let updatedUsers = state.users.map(u => {
          if (u.id === buyer.id) {
            return updatedBuyer;
          }

          if (u.role === 'penjual' && itemsBySeller[u.id]) {
            const sellerItems = itemsBySeller[u.id];
            const sellerSubtotal = sellerItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
            return {
              ...u,
              balance: u.balance + sellerSubtotal
            };
          }
          return u;
        });

        const orderDate = new Date().toISOString();
        let baseOrderIdNum = 10000 + state.orders.length + 1;
        let createdOrderIds: string[] = [];

        Object.entries(itemsBySeller).forEach(([sellerId, sellerItems], index) => {
          const orderId = `TX-${baseOrderIdNum + index}`;
          createdOrderIds.push(orderId);
          const sellerSubtotal = sellerItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

          // Find canteen name
          const seller = state.users.find(u => u.id === sellerId);
          const canteenName = seller?.canteenName || 'Kantin';

          const newOrder: Order = {
            id: orderId,
            buyerId: buyer.id,
            buyerName: buyer.name,
            items: sellerItems.map(item => ({
              productId: item.product.id,
              productName: item.product.name,
              price: item.product.price,
              quantity: item.quantity,
              image: item.product.image,
              selectedOptions: item.selectedOptions,
              catatan: item.catatan
            })),
            total: sellerSubtotal,
            paymentMethod: 'Saldo',
            status: 'Menunggu',
            date: orderDate,
            sellerId: sellerId,
            rated: false
          };

          newOrders.push(newOrder);

          const buyerTx: WalletTransaction = {
            id: `tx-w-b-${Date.now()}-${index}`,
            userId: buyer.id,
            type: 'purchase',
            amount: sellerSubtotal,
            date: orderDate,
            description: `Pembelian di Kantin ${canteenName} (${orderId})`
          };

          const sellerTx: WalletTransaction = {
            id: `tx-w-s-${Date.now()}-${index}`,
            userId: sellerId,
            type: 'income',
            amount: sellerSubtotal,
            date: orderDate,
            description: `Penjualan Menu order ${orderId}`
          };

          newTransactions.push(buyerTx, sellerTx);

          // Notifikasi ke pembeli: pesanan diterima sistem
          newNotifications.push({
            id: `notif-${Date.now()}-${index}`,
            userId: buyer.id,
            title: 'Pesanan Dikirim',
            message: `Pesanan Anda di Kantin ${canteenName} (${orderId}) sedang menunggu konfirmasi penjual.`,
            type: 'info',
            read: false,
            date: orderDate,
            orderId
          });
        });

        if (serviceFee > 0) {
          const serviceFeeTx: WalletTransaction = {
            id: `tx-w-fee-${Date.now()}`,
            userId: buyer.id,
            type: 'purchase',
            amount: serviceFee,
            date: orderDate,
            description: `Biaya Layanan Aplikasi`
          };
          newTransactions.push(serviceFeeTx);
        }

        const remainingCart = state.cart.filter(item => !item.checked);

        set({
          currentUser: updatedBuyer,
          users: updatedUsers,
          orders: [...newOrders, ...state.orders],
          transactions: [...newTransactions, ...state.transactions],
          notifications: [...newNotifications, ...state.notifications],
          cart: remainingCart
        });

        return { success: true, message: 'Transaksi berhasil!', orderId: createdOrderIds.join(', ') };
      },

      addProduct: (productDetails) => set((state) => {
        const currentUser = state.currentUser;
        const newProduct: Product = {
          ...productDetails,
          id: `prod-${Date.now()}`,
          rating: 5.0,
          sellerId: currentUser?.id || productDetails.sellerId
        };
        return {
          products: [newProduct, ...state.products]
        };
      }),

      updateProduct: (id, updatedDetails) => set((state) => ({
        products: state.products.map(p => p.id === id ? { ...p, ...updatedDetails } as Product : p)
      })),

      deleteProduct: (id) => set((state) => ({
        products: state.products.filter(p => p.id !== id)
      })),

      updateOrderStatus: (orderId, status) => set((state) => {
        const order = state.orders.find(o => o.id === orderId);
        if (!order) return state;

        const updatedOrders = state.orders.map(o =>
          o.id === orderId ? { ...o, status } : o
        );

        const newNotifications: Notification[] = [];

        // Kirim notifikasi ke pembeli berdasarkan status
        let notifMessage = '';
        let notifType: Notification['type'] = 'info';

        const seller = state.users.find(u => u.id === order.sellerId);
        const canteenName = seller?.canteenName || 'Kantin';
        const itemName = order.items[0]?.productName || 'menu';

        if (status === 'Diterima') {
          notifMessage = `Pesanan ${itemName} Anda diterima oleh Kantin ${canteenName} dan sedang diproses.`;
          notifType = 'info';
        } else if (status === 'Diproses') {
          notifMessage = `Pesanan ${itemName} Anda sedang dimasak oleh Kantin ${canteenName}. Harap tunggu ya!`;
          notifType = 'info';
        } else if (status === 'Siap Diambil') {
          notifMessage = `Pesanan ${itemName} Anda sudah siap! Silahkan ambil di Kantin ${canteenName} sekarang.`;
          notifType = 'success';
        } else if (status === 'Selesai') {
          notifMessage = `Pesanan ${itemName} sudah selesai diserahkan. Terima kasih sudah makan di Kantin ${canteenName}!`;
          notifType = 'success';
        }

        if (notifMessage) {
          newNotifications.push({
            id: `notif-${Date.now()}`,
            userId: order.buyerId,
            title: status === 'Siap Diambil' ? 'Pesanan Siap Diambil! 🎉' : `Status Pesanan: ${status}`,
            message: notifMessage,
            type: notifType,
            read: false,
            date: new Date().toISOString(),
            orderId
          });
        }

        return {
          orders: updatedOrders,
          notifications: [...newNotifications, ...state.notifications]
        };
      }),

      rejectOrder: (orderId, reason) => set((state) => {
        const order = state.orders.find(o => o.id === orderId);
        if (!order) return state;

        const updatedOrders = state.orders.map(o =>
          o.id === orderId ? { ...o, status: 'Ditolak' as Order['status'], rejectionReason: reason } : o
        );

        const seller = state.users.find(u => u.id === order.sellerId);
        const canteenName = seller?.canteenName || 'Kantin';
        const itemName = order.items[0]?.productName || 'menu';

        const newNotification: Notification = {
          id: `notif-${Date.now()}`,
          userId: order.buyerId,
          title: 'Pesanan Ditolak',
          message: `Pesanan ${itemName} Anda ditolak oleh Kantin ${canteenName}. Alasan: ${reason}`,
          type: 'error',
          read: false,
          date: new Date().toISOString(),
          orderId
        };

        // Refund buyer
        const updatedUsers = state.users.map(u => {
          if (u.id === order.buyerId) {
            return { ...u, balance: u.balance + order.total };
          }
          if (u.id === order.sellerId) {
            return { ...u, balance: Math.max(0, u.balance - order.total) };
          }
          return u;
        });

        const refundTx: WalletTransaction = {
          id: `tx-refund-${Date.now()}`,
          userId: order.buyerId,
          type: 'topup',
          amount: order.total,
          date: new Date().toISOString(),
          description: `Refund pesanan ${orderId} - ditolak kantin`
        };

        const currentUser = state.currentUser;
        const updatedCurrentUser = currentUser?.id === order.buyerId
          ? updatedUsers.find(u => u.id === currentUser.id) || currentUser
          : currentUser;

        return {
          orders: updatedOrders,
          users: updatedUsers,
          currentUser: updatedCurrentUser,
          notifications: [newNotification, ...state.notifications],
          transactions: [refundTx, ...state.transactions]
        };
      }),

      addNotification: (notification) => set((state) => {
        const newNotif: Notification = {
          ...notification,
          id: `notif-${Date.now()}`,
          date: new Date().toISOString(),
          read: false
        };
        return {
          notifications: [newNotif, ...state.notifications]
        };
      }),

      markNotificationRead: (notifId) => set((state) => ({
        notifications: state.notifications.map(n =>
          n.id === notifId ? { ...n, read: true } : n
        )
      })),

      markAllNotificationsRead: (userId) => set((state) => ({
        notifications: state.notifications.map(n =>
          n.userId === userId ? { ...n, read: true } : n
        )
      })),

      addCanteenRating: (rating) => set((state) => {
        const newRating: CanteenRating = {
          ...rating,
          id: `rating-${Date.now()}`,
          date: new Date().toISOString()
        };
        return {
          canteenRatings: [newRating, ...state.canteenRatings]
        };
      }),

      markOrderRated: (orderId) => set((state) => ({
        orders: state.orders.map(o =>
          o.id === orderId ? { ...o, rated: true } : o
        )
      }))
    }),
    {
      name: 'e-kantin-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        users: state.users,
        products: state.products,
        orders: state.orders,
        transactions: state.transactions,
        notifications: state.notifications,
        canteenRatings: state.canteenRatings,
        darkMode: state.darkMode,
        sidebarCollapsed: state.sidebarCollapsed
      })
    }
  )
);
