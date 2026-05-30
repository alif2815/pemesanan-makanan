'use client';

import { useQuery } from '@tanstack/react-query';
import { ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import api from '@/lib/api';
import { Menu } from '@/types';
import { useCartStore } from '@/store/useCartStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// Dummy fetcher
const fetchMenus = async (): Promise<Menu[]> => {
  const { data } = await api.get('/menus');
  return data;
};

export default function CustomerMenuPage() {
  const { items, addItem, getTotalPrice } = useCartStore();
  
  const { data: menus, isLoading } = useQuery({
    queryKey: ['menus'],
    queryFn: fetchMenus,
  });

  const handleAddToCart = (menu: Menu) => {
    addItem(menu);
    toast.success(`${menu.name} ditambahkan ke keranjang`);
  };

  if (isLoading) return <div className="p-8 text-center">Memuat menu...</div>;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Menu Kami</h1>
          <p className="text-muted-foreground mt-2">Pilih hidangan favorit Anda.</p>
        </div>
        
        {/* Cart Summary Header */}
        <div className="flex items-center gap-4 bg-secondary p-4 rounded-lg">
          <ShoppingCart className="w-5 h-5" />
          <div className="flex flex-col">
            <span className="text-sm font-medium">{items.length} Items</span>
            <span className="text-sm font-bold text-primary">
              Rp {getTotalPrice().toLocaleString('id-ID')}
            </span>
          </div>
          <Button onClick={() => window.location.href = '/cart'}>Checkout</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {menus?.map((menu) => {
          const isOutOfStock = menu.stock === 0 || !menu.isAvailable;

          return (
            <div key={menu.id} className="group flex flex-col justify-between border rounded-xl overflow-hidden bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
              <div className="relative h-48 w-full">
                <Image
                  src={menu.imageUrl}
                  alt={menu.name}
                  fill
                  className={`object-cover ${isOutOfStock ? 'grayscale opacity-60' : ''}`}
                />
                {isOutOfStock && (
                  <Badge variant="destructive" className="absolute top-3 right-3 shadow-md">
                    Habis
                  </Badge>
                )}
                <Badge variant="secondary" className="absolute top-3 left-3 shadow-md">
                  {menu.category}
                </Badge>
              </div>
              
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-semibold text-lg line-clamp-1">{menu.name}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{menu.description}</p>
                <div className="mt-4 flex items-center justify-between mt-auto">
                  <span className="font-bold text-lg">Rp {menu.price.toLocaleString('id-ID')}</span>
                  <Button 
                    onClick={() => handleAddToCart(menu)} 
                    disabled={isOutOfStock}
                    size="sm"
                  >
                    {isOutOfStock ? 'Tidak Tersedia' : 'Tambah'}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}