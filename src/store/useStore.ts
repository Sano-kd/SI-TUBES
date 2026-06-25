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
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  items: OrderItem[];
  total: number;
  paymentMethod: 'Saldo';
  status: 'Diterima' | 'Diproses' | 'Siap Diambil' | 'Selesai';
  date: string;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'topup' | 'purchase' | 'income';
  amount: number;
  date: string;
  description: string;
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
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, type: 'inc' | 'dec') => void;
  clearCart: () => void;
  
  // Checkout & Wallet Actions
  checkout: () => { success: boolean; message: string; orderId?: string };
  topUp: (amount: number) => void;
  
  // Penjual CRUD Operations
  addProduct: (product: Omit<Product, 'id' | 'rating'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  // Seller Order status actions
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
}

// Initial mock data
const INITIAL_PRODUCTS: Product[] = [
  // Foods
  {
    id: 'prod-1',
    name: 'Chicken Rice Bowl',
    category: 'Food',
    price: 25000,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=60',
    description: 'Nasi hangat dengan ayam pop corn gurih dan telur mata sapi setengah matang disiram saus mentai.',
    available: true
  },
  {
    id: 'prod-2',
    name: 'Nasi Goreng Gila Canteen',
    category: 'Food',
    price: 22000,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=60',
    description: 'Nasi goreng bumbu rempah dengan topping bakso, sosis, telur ayam orak-arik, dan sayuran segar.',
    available: true
  },
  {
    id: 'prod-3',
    name: 'Mie Goreng Katsu Cabe Ijo',
    category: 'Food',
    price: 20000,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=60',
    description: 'Mie goreng lezat disajikan dengan chicken katsu renyah dan sambal cabe ijo pedas mantap.',
    available: true
  },
  {
    id: 'prod-4',
    name: 'Ayam Geprek Mozzarella',
    category: 'Food',
    price: 24000,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=60',
    description: 'Dada ayam krispi digeprek dengan sambal bawang khas solo, diselimuti keju mozzarella leleh hangat.',
    available: true
  },
  {
    id: 'prod-5',
    name: 'Beef Teriyaki Bowl',
    category: 'Food',
    price: 30000,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=600&auto=format&fit=crop&q=60',
    description: 'Irisan daging sapi empuk dimasak saus teriyaki manis gurih, bawang bombay, taburan wijen di atas nasi.',
    available: true
  },
  {
    id: 'prod-6',
    name: 'Kwetiau Sapi Goreng',
    category: 'Food',
    price: 23000,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&auto=format&fit=crop&q=60',
    description: 'Kwetiau kenyal digoreng dengan irisan daging sapi tipis, toge segar, telur bebek orak-arik.',
    available: true
  },
  // Drinks
  {
    id: 'prod-7',
    name: 'Caramel Frappuccino',
    category: 'Drink',
    price: 18000,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=60',
    description: 'Kopi blend es premium dengan sirup karamel manis lembut, whipped cream, dan saus karamel di atasnya.',
    available: true
  },
  {
    id: 'prod-8',
    name: 'Matcha Latte Ice',
    category: 'Drink',
    price: 15000,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=60',
    description: 'Bubuk matcha murni Jepang diseduh dengan susu segar dingin dan pemanis alami madu.',
    available: true
  },
  {
    id: 'prod-9',
    name: 'Ice Peach Tea Floral',
    category: 'Drink',
    price: 12000,
    rating: 4.4,
    image: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=600&auto=format&fit=crop&q=60',
    description: 'Teh hitam segar diseduh dingin dicampur sirup buah persik manis aromatik dan potongan buah persik.',
    available: true
  },
  {
    id: 'prod-10',
    name: 'Brown Sugar Boba Milk',
    category: 'Drink',
    price: 17000,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=600&auto=format&fit=crop&q=60',
    description: 'Susu segar dingin creamy berpadu dengan mutiara boba kenyal yang dimasak karamel gula aren.',
    available: true
  },
  {
    id: 'prod-11',
    name: 'Avocado Juice Premium',
    category: 'Drink',
    price: 14000,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1589733901241-5e53429e1db4?w=600&auto=format&fit=crop&q=60',
    description: 'Jus buah alpukat mentega segar kental disajikan dengan susu kental manis cokelat di sekeliling gelas.',
    available: true
  },
  {
    id: 'prod-12',
    name: 'Vietnamese Drip Coffee',
    category: 'Drink',
    price: 16000,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=60',
    description: 'Seduhan kopi robusta pekat khas vietnam menetes perlahan di atas susu kental manis lezat.',
    available: true
  },
  // Desserts
  {
    id: 'prod-13',
    name: 'Croissant Almond Butter',
    category: 'Dessert',
    price: 18000,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=60',
    description: 'Croissant renyah mentega berlapis dihiasi irisan kacang almond renyah dan taburan gula bubuk halus.',
    available: true
  },
  {
    id: 'prod-14',
    name: 'Choco Lava Cake Melted',
    category: 'Dessert',
    price: 15000,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=60',
    description: 'Kue cokelat panggang dengan bagian tengah cokelat cair kental hangat yang meleleh saat dipotong.',
    available: true
  },
  {
    id: 'prod-15',
    name: 'Tiramisu Slice Classic',
    category: 'Dessert',
    price: 22000,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop&q=60',
    description: 'Dessert klasik Italia berlapis biskuit ladyfinger terendam espresso, keju mascarpone lembut, bubuk cokelat.',
    available: true
  },
  {
    id: 'prod-16',
    name: 'Mango Pudding Silk',
    category: 'Dessert',
    price: 10000,
    rating: 4.4,
    image: 'https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?w=600&auto=format&fit=crop&q=60',
    description: 'Puding sutra rasa mangga harum disajikan dingin dengan saus vla susu manis yang melimpah.',
    available: true
  },
  // Snacks
  {
    id: 'prod-17',
    name: 'French Fries Cheese Sauce',
    category: 'Snack',
    price: 12000,
    rating: 4.3,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=60',
    description: 'Kentang goreng renyah bumbu garam gurih disajikan cocolan saus keju cheddar kental nan gurih.',
    available: true
  },
  {
    id: 'prod-18',
    name: 'Dimsum Mentai Mozzarella',
    category: 'Snack',
    price: 16000,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=60',
    description: '4 buah siomay ayam udang lembut dibalut saus mentai creamy gurih dibakar dengan keju mozzarella.',
    available: true
  },
  {
    id: 'prod-19',
    name: 'Cireng Rujak Garing',
    category: 'Snack',
    price: 10000,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=60', // Placeholder cireng
    description: 'Cireng aci goreng garing krispi di luar lembut kenyal di dalam dicocol bumbu rujak pedas manis asam.',
    available: true
  },
  {
    id: 'prod-20',
    name: 'Garlic Bread Toast',
    category: 'Snack',
    price: 14000,
    rating: 4.4,
    image: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=600&auto=format&fit=crop&q=60',
    description: 'Roti baguette panggang diolesi mentega bawang putih harum berlimpah dan cincangan seledri.',
    available: true
  }
];

const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    name: 'Kadek Sudarsana',
    email: 'kadek@mahasiswa.id',
    role: 'mahasiswa',
    contact: '082111222333',
    balance: 50000,
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=60'
  },
  {
    id: 'usr-2',
    name: 'Kantin Mencintai',
    email: 'kantin@mencintai.id',
    role: 'penjual',
    contact: '081234567890',
    balance: 250000,
    avatar: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=150&auto=format&fit=crop&q=60',
    canteenName: 'Mencintai'
  }
];

const INITIAL_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'tx-w-1',
    userId: 'usr-1',
    type: 'topup',
    amount: 50000,
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
    id: 'tx-w-3',
    userId: 'usr-1',
    type: 'topup',
    amount: 25000,
    date: '2026-06-23T14:00:00.000Z',
    description: 'Top Up Saldo e-Kantin'
  },
  {
    id: 'tx-w-4',
    userId: 'usr-2',
    type: 'income',
    amount: 25000,
    date: '2026-06-24T09:30:00.000Z',
    description: 'Penjualan Menu: Chicken Rice Bowl'
  },
  {
    id: 'tx-w-5',
    userId: 'usr-1',
    type: 'topup',
    amount: 10000,
    date: '2026-06-22T10:00:00.000Z',
    description: 'Top Up Saldo e-Kantin'
  }
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
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&auto=format&fit=crop&q=60'
      }
    ],
    total: 25000,
    paymentMethod: 'Saldo',
    status: 'Selesai',
    date: '2026-06-24T09:30:00.000Z'
  },
  {
    id: 'TX-10002',
    buyerId: 'usr-3', // Mock other student
    buyerName: 'Ahmad Rafli',
    items: [
      {
        productId: 'prod-2',
        productName: 'Nasi Goreng Gila Canteen',
        price: 22000,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=150&auto=format&fit=crop&q=60'
      },
      {
        productId: 'prod-8',
        productName: 'Matcha Latte Ice',
        price: 15000,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=150&auto=format&fit=crop&q=60'
      }
    ],
    total: 37000,
    paymentMethod: 'Saldo',
    status: 'Siap Diambil',
    date: '2026-06-24T10:15:00.000Z'
  },
  {
    id: 'TX-10003',
    buyerId: 'usr-4', // Mock other student
    buyerName: 'Siti Aminah',
    items: [
      {
        productId: 'prod-4',
        productName: 'Ayam Geprek Mozzarella',
        price: 24000,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=150&auto=format&fit=crop&q=60'
      },
      {
        productId: 'prod-9',
        productName: 'Ice Peach Tea Floral',
        price: 12000,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=150&auto=format&fit=crop&q=60'
      }
    ],
    total: 72000,
    paymentMethod: 'Saldo',
    status: 'Diproses',
    date: '2026-06-24T10:45:00.000Z'
  },
  {
    id: 'TX-10004',
    buyerId: 'usr-5',
    buyerName: 'Christian Wijaya',
    items: [
      {
        productId: 'prod-7',
        productName: 'Caramel Frappuccino',
        price: 18000,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=150&auto=format&fit=crop&q=60'
      },
      {
        productId: 'prod-13',
        productName: 'Croissant Almond Butter',
        price: 18000,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=150&auto=format&fit=crop&q=60'
      }
    ],
    total: 54000,
    paymentMethod: 'Saldo',
    status: 'Diterima',
    date: '2026-06-24T11:00:00.000Z'
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
      darkMode: false,
      sidebarCollapsed: false,

      setDarkMode: (dark) => set({ darkMode: dark }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      login: (email, password) => {
        const users = get().users;
        const matched = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        // Simulating validation (any matching email works with any password, or check exact)
        if (matched) {
          // If match found, authenticate
          set({ currentUser: matched });
          return { success: true, message: 'Berhasil masuk!' };
        }
        return { success: false, message: 'Email atau password salah' };
      },

      register: (details) => {
        const users = get().users;
        const exists = users.some(u => u.email.toLowerCase() === details.email.toLowerCase());
        
        if (exists) {
          return { success: false, message: 'Email sudah terdaftar!' };
        }

        if (details.passwordConfirm !== details.contact) { // arbitrary validation check or bypass
          // we just accept passwords
        }

        const newUser: User = {
          id: `usr-${Date.now()}`,
          name: details.name,
          email: details.email,
          role: details.role,
          contact: details.contact,
          balance: 0,
          avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(details.name)}`,
          canteenName: details.role === 'penjual' ? details.canteenName || 'Kantin Saya' : undefined
        };

        set({
          users: [...users, newUser],
          currentUser: newUser
        });

        // Add top-up transaction of 0
        const newTx: WalletTransaction = {
          id: `tx-w-${Date.now()}`,
          userId: newUser.id,
          type: 'topup',
          amount: 0,
          date: new Date().toISOString(),
          description: 'Dompet e-Kantin dibuat'
        };

        set((state) => ({
          transactions: [newTx, ...state.transactions]
        }));

        return { success: true, message: 'Akun berhasil dibuat' };
      },

      logout: () => set({ currentUser: null, cart: [] }),

      updateProfile: (details) => set((state) => {
        if (!state.currentUser) return state;
        const updatedUser = { ...state.currentUser, ...details };
        const updatedUsers = state.users.map(u => u.id === state.currentUser?.id ? updatedUser : u);
        
        // also if name changed, update active orders that have buyerName
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

      addToCart: (product) => set((state) => {
        const existing = state.cart.find(item => item.product.id === product.id);
        if (existing) {
          return {
            cart: state.cart.map(item =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          };
        }
        return { cart: [...state.cart, { product, quantity: 1 }] };
      }),

      removeFromCart: (productId) => set((state) => ({
        cart: state.cart.filter(item => item.product.id !== productId)
      })),

      updateQuantity: (productId, type) => set((state) => ({
        cart: state.cart.map(item => {
          if (item.product.id === productId) {
            const newQty = type === 'inc' ? item.quantity + 1 : item.quantity - 1;
            return { ...item, quantity: Math.max(1, newQty) };
          }
          return item;
        })
      })),

      clearCart: () => set({ cart: [] }),

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

        const total = state.cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

        if (buyer.balance < total) {
          return { success: false, message: 'Saldo tidak mencukupi, silahkan top up' };
        }

        // Deduct balance from buyer
        const updatedBuyer = {
          ...buyer,
          balance: buyer.balance - total
        };

        // Add balance to seller (Kantin Mencintai or another seller)
        const updatedUsers = state.users.map(u => {
          if (u.id === buyer.id) {
            return updatedBuyer;
          }
          // Assuming seller is Kantin Mencintai (usr-2)
          if (u.role === 'penjual') {
            return {
              ...u,
              balance: u.balance + total
            };
          }
          return u;
        });

        // If current user is buyer, update their active details
        const orderId = `TX-${10000 + state.orders.length + 1}`;
        const orderDate = new Date().toISOString();

        const newOrder: Order = {
          id: orderId,
          buyerId: buyer.id,
          buyerName: buyer.name,
          items: state.cart.map(item => ({
            productId: item.product.id,
            productName: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            image: item.product.image
          })),
          total,
          paymentMethod: 'Saldo',
          status: 'Diterima',
          date: orderDate
        };

        // Create transaction logs
        const buyerTx: WalletTransaction = {
          id: `tx-w-b-${Date.now()}`,
          userId: buyer.id,
          type: 'purchase',
          amount: total,
          date: orderDate,
          description: `Pembelian Makanan di Kantin (${orderId})`
        };

        const sellerTx: WalletTransaction = {
          id: `tx-w-s-${Date.now()}`,
          userId: 'usr-2', // To primary seller
          type: 'income',
          amount: total,
          date: orderDate,
          description: `Penjualan Menu order ${orderId}`
        };

        set({
          currentUser: updatedBuyer,
          users: updatedUsers,
          orders: [newOrder, ...state.orders],
          transactions: [buyerTx, sellerTx, ...state.transactions],
          cart: []
        });

        return { success: true, message: 'Transaksi berhasil!', orderId };
      },

      addProduct: (productDetails) => set((state) => {
        const newProduct: Product = {
          ...productDetails,
          id: `prod-${Date.now()}`,
          rating: 5.0
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
        const updatedOrders = state.orders.map(o =>
          o.id === orderId ? { ...o, status } : o
        );
        return {
          orders: updatedOrders
        };
      })
    }),
    {
      name: 'e-kantin-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        users: state.users,
        products: state.products,
        orders: state.orders,
        transactions: state.transactions,
        darkMode: state.darkMode,
        sidebarCollapsed: state.sidebarCollapsed
      })
    }
  )
);
