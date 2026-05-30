'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function ReservationPage() {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState(2);
  const [loading, setLoading] = useState(false);

  const handleReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time || guests < 1) return toast.error('Mohon lengkapi detail reservasi');

    setLoading(true);
    try {
      await api.post('/reservations', { date, time, guests: Number(guests) });
      toast.success('Reservasi berhasil diajukan! Cek berkala dashboard Anda.');
      setDate('');
      setTime('');
      setGuests(2);
    } catch (error) {
      toast.error('Gagal membuat reservasi. Coba waktu atau meja lain.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Reservasi Meja Restoran</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReservation} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Pilih Tanggal</label>
              <Input type="date" value={date} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDate(e.target.value)} className="w-full mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Jam Kedatangan</label>
              <Input type="time" value={time} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTime(e.target.value)} className="w-full mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Jumlah Orang (Tamu)</label>
              <Input type="number" min={1} max={20} value={guests} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGuests(Number(e.target.value))} className="w-full mt-1" />
            </div>
            <Button type="submit" className="w-full mt-4" disabled={loading}>
              {loading ? 'Mengirim Pengajuan...' : 'Ajukan Reservasi Sekarang'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}