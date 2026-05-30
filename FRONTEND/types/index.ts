export type Role = 'ADMIN' | 'USER';
export type OrderStatus = 'PENDING' | 'PAID' | 'NOT_PAID';
export type PaymentMethod = 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'E_WALLET' | 'TRANSFER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
}

export interface Menu {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
  isAvailable: boolean;
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuId: string;
  quantity: number;
  price: number;
  menu: Menu;
}

export interface Order {
  id: string;
  userId: string;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  receiptImage?: string;
  createdAt: string;
  items: OrderItem[];
  user: User;
}

export interface Reservation {
  id: string;
  userId: string;
  date: string;
  time: string;
  guests: number;
  status: OrderStatus;
  createdAt: string;
}