'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Order } from '@/types';

export default function AdminOrderManagement() {
  const queryClient = useQueryClient();
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);

  // Fetch semua order masuk
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data } = await api.get('/admin/orders');
      return data;
    }
  });

  // Mutasi Ubah Status Pembayaran
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string, status: 'PAID' | 'NOT_PAID' }) => {
      await api.patch(`/admin/orders/${orderId}/status`, { status });
    },
    onSuccess: (_, variables) => {
      toast.success(`Status pesanan berhasil diupdate menjadi ${variables.status}`);
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
    onError: () => {
      toast.error('Gagal memperbarui status pesanan.');
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID': return <Badge className="bg-emerald-500 hover:bg-emerald-600">PAID</Badge>;
      case 'NOT_PAID': return <Badge variant="destructive">NOT PAID</Badge>;
      default: return <Badge className="bg-amber-500 hover:bg-amber-600">PENDING</Badge>;
    }
  };

  if (isLoading) return <div className="p-8 text-center">Memuat daftar pesanan...</div>;

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
        <p className="text-muted-foreground mt-1">Verifikasi pembayaran dan kelola pesanan masuk.</p>
      </div>

      <div className="border rounded-xl bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-muted/50 text-sm font-medium text-muted-foreground">
                <th className="p-4">Customer</th>
                <th className="p-4">Metode</th>
                <th className="p-4">Total Harga</th>
                <th className="p-4">Status</th>
                <th className="p-4">Bukti</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {orders?.map((order) => (
                <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="font-medium">{order.user?.name || 'Guest'}</div>
                    <div className="text-xs text-muted-foreground">{order.user?.email}</div>
                  </td>
                  <td className="p-4 font-mono text-xs">{order.paymentMethod}</td>
                  <td className="p-4 font-semibold">Rp {order.totalAmount.toLocaleString('id-ID')}</td>
                  <td className="p-4">{getStatusBadge(order.status)}</td>
                  <td className="p-4">
                    {order.receiptImage ? (
                      <Button variant="outline" size="sm" onClick={() => setSelectedReceipt(order.receiptImage!)}>
                        <Eye className="w-4 h-4 mr-1" /> Preview
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">Tidak Ada</span>
                    )}
                  </td>
                  <td className="p-4 flex justify-center gap-2">
                    {order.status === 'PENDING' && (
                      <>
                        <Button 
                          size="sm" 
                          className="bg-emerald-600 hover:bg-emerald-700 h-8 text-xs"
                          onClick={() => updateStatusMutation.mutate({ orderId: order.id, status: 'PAID' })}
                        >
                          <Check className="w-3.5 h-3.5 mr-1" /> Terima
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          className="h-8 text-xs"
                          onClick={() => updateStatusMutation.mutate({ orderId: order.id, status: 'NOT_PAID' })}
                        >
                          <X className="w-3.5 h-3.5 mr-1" /> Tolak
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full Preview Receipt Image Modal */}
      <Dialog open={!!selectedReceipt} onOpenChange={() => setSelectedReceipt(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Bukti Pembayaran Penuh</DialogTitle>
          </DialogHeader>
          {selectedReceipt && (
            <div className="relative w-full h-[70vh] bg-neutral-900 rounded-lg overflow-hidden">
              <img 
                src={selectedReceipt} 
                alt="Bukti Transfer Validasi" 
                className="w-full h-full object-contain" 
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}