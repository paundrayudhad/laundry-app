'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/app/lib/firebase';
import { useRouter } from 'next/navigation';

interface Service {
  id: string;
  nama_layanan: string;
  deskripsi: string;
}

interface Order {
  id_orderan: string;
  status: string;
  total_harga: number;
}

export default function Dashboard() {
  const [services, setServices] = useState<Service[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      const servicesRef = ref(db, 'services');
      const ordersRef = ref(db, 'orders');

      const servicesUnsubscribe = onValue(servicesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setServices(Object.values(data));
        }
      });

      const ordersUnsubscribe = onValue(ordersRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setOrders(Object.values(data));
        }
      });

      return () => {
        servicesUnsubscribe();
        ordersUnsubscribe();
      };
    }
  }, [status]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Laundry Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Services</h2>
          <ul className="space-y-2">
            {services.map((service) => (
              <li key={service.id} className="bg-blue-400 p-4 rounded shadow">
                <h3 className="font-bold">{service.nama_layanan}</h3>
                <p>{service.deskripsi}</p>
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold mb-4">Recent Orders</h2>
          <ul className="space-y-2">
            {orders.map((order) => (
              <li key={order.id_orderan} className="bg-white p-4 rounded shadow">
                <h3 className="font-bold">Order #{order.id_orderan}</h3>
                <p>Status: {order.status}</p>
                <p>Total: {order.total_harga}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
