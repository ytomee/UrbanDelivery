"use client";

import { useCallback, useEffect, useState } from "react";
import { Order } from "../types/order";
import { Customer } from "../types/customer";
import { Courier } from "../types/courier";
import { getOrders, deleteOrder } from "../lib/orders";
import { getCustomers } from "../lib/customers";
import { getCouriers } from "../lib/couriers";
import OrderForm from "./order-form";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Record<string, Customer>>({});
  const [couriersMap, setCouriersMap] = useState<Record<string, Courier>>({});
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(() => {
    setOrders(getOrders());
    const custMap: Record<string, Customer> = {};
    getCustomers().forEach((c) => {
      custMap[c.id] = c;
    });
    setCustomers(custMap);
    const courMap: Record<string, Courier> = {};
    getCouriers().forEach((c) => {
      courMap[c.id] = c;
    });
    setCouriersMap(courMap);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function handleDelete(id: string) {
    if (confirm("Tem a certeza que deseja eliminar esta encomenda?")) {
      deleteOrder(id);
      load();
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1>Encomendas</h1>
          <p>Registo e gestão de novas encomendas</p>
          <div className="accent-line" />
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Nova Encomenda
          </button>
        )}
      </div>

      {showForm && (
        <div className="glass-card form-section mb-8">
          <h2>Criar Nova Encomenda</h2>
          <OrderForm
            onSaved={() => {
              setShowForm(false);
              load();
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {orders.length === 0 ? (
        <div className="glass-card empty-state">
          <div className="empty-state-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 2.5L2.5 5.5V10.5L8 13.5L13.5 10.5V5.5L8 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M2.5 5.5L8 8.5L13.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M8 13.5V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-base font-medium" style={{ color: 'var(--foreground-secondary)' }}>
            Nenhuma encomenda registada
          </p>
          <p className="text-sm mt-1.5">
            Clique em &quot;Nova Encomenda&quot; para começar
          </p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Artigos</th>
                  <th>Data Prevista</th>
                  <th>Estado</th>
                  <th>Estafeta</th>
                  <th style={{ width: 80 }}></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="font-mono" style={{ fontSize: '0.8125rem', color: 'var(--yale)' }}>
                      #{o.id.substring(0, 8)}
                    </td>
                    <td className="font-medium">
                      {customers[o.customerId]?.name || "Desconhecido"}
                    </td>
                    <td style={{ color: 'var(--foreground-secondary)' }}>{o.articles}</td>
                    <td style={{ color: 'var(--foreground-secondary)' }}>
                      {new Date(o.expectedDate).toLocaleDateString('pt-PT')}
                    </td>
                    <td>
                      <span className={`badge ${
                        o.status === "entregue" ? "badge-ativo" :
                        o.status === "em distribuição" ? "badge-empresa" :
                        o.status === "cancelada" ? "badge-manutencao" :
                        "badge-particular"
                      }`}>
                        {o.status === "em distribuição" ? "Em Distribuição" :
                         o.status === "entregue" ? "Entregue" :
                         o.status === "cancelada" ? "Cancelada" :
                         "Pendente"}
                      </span>
                    </td>
                    <td style={{ color: 'var(--foreground-secondary)' }}>
                      {o.courierId ? couriersMap[o.courierId]?.name || "—" : "—"}
                    </td>
                    <td>
                      <button
                        onClick={() => handleDelete(o.id)}
                        className="btn-danger-ghost"
                        style={{ fontSize: '0.75rem' }}
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
