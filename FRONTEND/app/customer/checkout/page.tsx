'use client';

import { useState, ChangeEvent } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PaymentMethod } from '@/types';
import { toast } from 'sonner';
import Image from 'next/image';
import api from '@/lib/api';

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('TRANSFER');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi Format JPG/PNG/JPEG
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error('Format file harus JPG, JPEG, atau PNG!');
      return;
    }

    setReceiptFile(file);
    setReceiptPreview(URL.createObjectURL(file));
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return toast.error('Keranjang Anda kosong');
    if (!customerName || !phone) return toast.error('Mohon lengkapi data diri Anda');
    if (paymentMethod === 'TRANSFER' && !receiptFile) return toast.error('Mohon upload bukti pembayaran terlebih dahulu');

    setIsSubmitting(true);
    try {
      // 1. Kirim data order terlebih dahulu ke Backend
      const orderPayload = {
        customerName,
        phone,
        paymentMethod,
        items: items.map(item => ({ menuId: item.id, quantity: item.quantity, price: item.price })),
        totalAmount: getTotalPrice()
      };

      const { data: newOrder } = await api.post('/orders', orderPayload);

      // 2. Jika metode TRANSFER, upload gambarnya menggunakan FormData
      if (paymentMethod === 'TRANSFER' && receiptFile) {
        const formData = new FormData();
        formData.append('receipt', receiptFile);
        await api.post(`/orders/${newOrder.id}/upload-receipt`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      toast.success('Pesanan berhasil dibuat! Menunggu verifikasi admin.');
      clearCart();
      // Redirect ke riwayat pesanan customer
      window.location.href = '/dashboard/orders';
    } catch (error) {
      toast.error('Terjadi kesalahan saat memproses checkout.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Data Diri & Pembayaran */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Data Pengiriman & Pemesan</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nama Lengkap</label>
                <Input value={customerName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerName(e.target.value)} placeholder="Masukkan nama Anda" />
              </div>
              <div>
                <label className="text-sm font-medium">Nomor HP / WhatsApp</label>
                <Input value={phone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)} placeholder="Contoh: 08123456789" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Metode Pembayaran</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Select value={paymentMethod} onValueChange={(value: string) => setPaymentMethod(value as PaymentMethod)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Metode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Tunai (Bayar di Kasir)</SelectItem>
                  <SelectItem value="TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="E_WALLET">E-Wallet (Dana/Ovo/Gopay)</SelectItem>
                  <SelectItem value="CREDIT_CARD">Kartu Kredit</SelectItem>
                </SelectContent>
              </Select>

              {/* Upload Section jika memilih TRANSFER */}
              {paymentMethod === 'TRANSFER' && (
                <div className="mt-4 p-4 border border-dashed rounded-lg space-y-3">
                  <label className="text-sm font-medium block">Upload Bukti Transfer</label>
                  <Input type="file" accept="image/*" onChange={handleFileChange} />
                  
                  {receiptPreview && (
                    <div className="mt-2 relative w-full h-48 border rounded-md overflow-hidden bg-muted">
                      <Image src={receiptPreview} alt="Preview Bukti" fill className="object-contain" />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Ringkasan Pesanan */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Ringkasan Pesanan</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.name} <span className="text-muted-foreground">x{item.quantity}</span></span>
                  <span className="font-semibold">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                </div>
              ))}
              <hr />
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">Rp {getTotalPrice().toLocaleString('id-ID')}</span>
              </div>
              <Button onClick={handleCheckoutSubmit} className="w-full mt-4" disabled={isSubmitting}>
                {isSubmitting ? 'Memproses...' : 'Lanjutkan Pembayaran'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}