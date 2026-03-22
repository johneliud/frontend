export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
}
