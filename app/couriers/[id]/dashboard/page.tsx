"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Order } from "../../../types/order";
import { Customer } from "../../../types/customer";
import { Courier } from "../../../types/courier";
import { Address } from "../../../types/address";
import { getOrders, updateOrderStatus } from "../../../lib/orders";
import { getCustomers } from "../../../lib/customers";
import { getCouriers } from "../../../lib/couriers";
import { getAddressesByCustomer } from "../../../lib/addresses";
import Link from "next/link";

export default function CourierDashboard() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [courier, setCourier] = useState<Courier | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Record<string, Customer>>({});
  const [addresses, setAddresses] = useState<Record<string, Address>>({});

  const load = useCallback(() => {
    const allCouriers = getCouriers();
    const c = allCouriers.find((c) => c.id === id);
    if (!c) {
      router.push("/couriers");
      return;
    }
    setCourier(c);

    const allOrders = getOrders().filter((o) => o.courierId === id && o.status !== "cancelada" && o.status !== "entregue" && o.status !== "falhou");
    setOrders(allOrders);

    const custMap: Record<string, Customer> = {};
    const addrMap: Record<string, Address> = {};
    
    getCustomers().forEach((cust) => { custMap[cust.id] = cust; });
    
    // Load addresses for orders
    const customerIds = Array.from(new Set(allOrders.map(o => o.customerId)));
    customerIds.forEach(custId => {
      const custAddresses = getAddressesByCustomer(custId);
      custAddresses.forEach(a => {
        addrMap[a.id] = a;
      });
    });

    setCustomers(custMap);
    setAddresses(addrMap);
  }, [id, router]);

  useEffect(() => {
    load();
  }, [load]);

  function getMockGPSNote() {
    // Generates a simulated GPS location around Porto center
    const lat = 41.15 + (Math.random() - 0.5) * 0.05;
    const lng = -8.61 + (Math.random() - 0.5) * 0.05;
    return `Localização GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }

  function handleAction(orderId: string, action: "recolhida" | "entregue" | "falhou") {
    try {
      const note = getMockGPSNote();
      let newStatus: Order["status"];
      
      if (action === "recolhida") newStatus = "em distribuição";
      else if (action === "entregue") newStatus = "entregue";
      else newStatus = "falhou";

      updateOrderStatus(orderId, newStatus, note);
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro ao atualizar estado");
    }
  }

  if (!courier) return <div className="p-8">A carregar...</div>;

  return (
    <div className="animate-fade-in" style={{ maxWidth: 600, margin: "0 auto" }}>
      <div className="page-header mb-6 flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: '1.5rem' }}>Dashboard Estafeta</h1>
          <p style={{ color: "var(--yale)", fontWeight: 500 }}>{courier.name}</p>
        </div>
        <Link href="/couriers" className="btn btn-secondary">
          Sair
        </Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {orders.length === 0 ? (
          <div className="glass-card text-center p-8">
            <p style={{ color: "var(--foreground-secondary)" }}>Não tem entregas pendentes.</p>
          </div>
        ) : (
          orders.map(order => {
            const customer = customers[order.customerId];
            const address = addresses[order.addressId];
            
            return (
              <div key={order.id} className="glass-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{customer?.name || "Desconhecido"}</h3>
                    <p className="font-mono text-xs" style={{ color: "var(--yale)", marginTop: '0.25rem' }}>#{order.id.substring(0, 8)}</p>
                  </div>
                  <span className={`badge ${order.status === 'pendente' ? 'badge-particular' : 'badge-empresa'}`}>
                    {order.status === 'pendente' ? 'Pendente' : 'Em Distribuição'}
                  </span>
                </div>

                <div style={{ marginBottom: '1rem', color: "var(--foreground-secondary)", fontSize: '0.9rem' }}>
                  <p><strong>Artigos:</strong> {order.articles}</p>
                  <p><strong>Morada:</strong> {address ? `${address.street}, ${address.city} ${address.postalCode}` : "Desconhecida"}</p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {order.status === 'pendente' && (
                    <button 
                      onClick={() => handleAction(order.id, "recolhida")}
                      className="btn btn-primary" 
                      style={{ flex: 1, minWidth: 120, padding: '0.75rem' }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                        <line x1="12" y1="22.08" x2="12" y2="12"></line>
                      </svg>
                      Recolhida
                    </button>
                  )}
                  {order.status === 'em distribuição' && (
                    <>
                      <button 
                        onClick={() => handleAction(order.id, "entregue")}
                        className="btn btn-primary" 
                        style={{ flex: 1, minWidth: 120, padding: '0.75rem', background: 'var(--success)', borderColor: 'var(--success)' }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        Entregue
                      </button>
                      <button 
                        onClick={() => handleAction(order.id, "falhou")}
                        className="btn btn-danger" 
                        style={{ flex: 1, minWidth: 120, padding: '0.75rem' }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="15" y1="9" x2="9" y2="15"></line>
                          <line x1="9" y1="9" x2="15" y2="15"></line>
                        </svg>
                        Falhou
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
