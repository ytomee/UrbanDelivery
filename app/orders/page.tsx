"use client";

import { useCallback, useEffect, useState } from "react";
import { Order } from "../types/order";
import { Customer } from "../types/customer";
import { Courier } from "../types/courier";
import { getOrders, deleteOrder, cancelOrder } from "../lib/orders";
import { getCustomers } from "../lib/customers";
import { getCouriers } from "../lib/couriers";
import OrderForm from "./order-form";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Record<string, Customer>>({});
  const [couriersMap, setCouriersMap] = useState<Record<string, Courier>>({});
  const [showForm, setShowForm] = useState(false);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelError, setCancelError] = useState("");

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

  function openCancelModal(orderId: string) {
    setCancellingOrderId(orderId);
    setCancelReason("");
    setCancelError("");
  }

  function closeCancelModal() {
    setCancellingOrderId(null);
    setCancelReason("");
    setCancelError("");
  }

  function handleCancel() {
    if (!cancelReason.trim()) {
      setCancelError("O motivo do cancelamento é obrigatório");
      return;
    }
    if (cancellingOrderId) {
      cancelOrder(cancellingOrderId, cancelReason.trim());
      closeCancelModal();
      load();
    }
  }

  const cancellingOrder = cancellingOrderId
    ? orders.find((o) => o.id === cancellingOrderId)
    : null;

  return (
    <div className="animate-fade-in">
      {/* Cancel modal */}
      {cancellingOrderId && (
        <div className="modal-overlay" onClick={closeCancelModal}>
          <div
            className="modal-content glass-card-elevated animate-slide-down"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-header-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M10 6.5v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="10" cy="13.5" r="0.75" fill="currentColor"/>
                </svg>
              </div>
              <div>
                <h3>Cancelar Encomenda</h3>
                <p className="text-sm" style={{ color: 'var(--muted)', marginTop: 2 }}>
                  #{cancellingOrder?.id.substring(0, 8)} · {cancellingOrder ? customers[cancellingOrder.customerId]?.name || "Desconhecido" : ""}
                </p>
              </div>
            </div>
            <div className="modal-body">
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground-secondary)' }}>
                Motivo do cancelamento <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <textarea
                className="input-field"
                style={{ height: 'auto', minHeight: 80, padding: '10px 14px', resize: 'vertical' }}
                value={cancelReason}
                onChange={(e) => {
                  setCancelReason(e.target.value);
                  if (cancelError) setCancelError("");
                }}
                placeholder="Ex: Cliente solicitou cancelamento, artigo indisponível..."
                autoFocus
              />
              {cancelError && (
                <p className="text-xs mt-1.5" style={{ color: 'var(--danger)' }}>{cancelError}</p>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                onClick={closeCancelModal}
                className="btn btn-secondary"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="btn btn-danger"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Confirmar Cancelamento
              </button>
            </div>
          </div>
        </div>
      )}

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
                  <th style={{ width: 140 }}></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className={o.status === "cancelada" ? "row-cancelled" : ""}>
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
                        o.status === "cancelada" ? "badge-cancelada" :
                        "badge-particular"
                      }`}>
                        {o.status === "em distribuição" ? "Em Distribuição" :
                         o.status === "entregue" ? "Entregue" :
                         o.status === "cancelada" ? "Cancelada" :
                         "Pendente"}
                      </span>
                      {o.status === "cancelada" && o.cancellationReason && (
                        <span className="cancel-reason-tooltip" title={o.cancellationReason}>
                          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1"/>
                            <path d="M6.5 4.5v2.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                            <circle cx="6.5" cy="9" r="0.5" fill="currentColor"/>
                          </svg>
                        </span>
                      )}
                    </td>
                    <td style={{ color: 'var(--foreground-secondary)' }}>
                      {o.courierId ? couriersMap[o.courierId]?.name || "—" : "—"}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        {o.status !== "cancelada" && o.status !== "entregue" && (
                          <button
                            onClick={() => openCancelModal(o.id)}
                            className="btn-danger-ghost"
                            style={{ fontSize: '0.75rem' }}
                          >
                            Cancelar
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(o.id)}
                          className="btn-danger-ghost"
                          style={{ fontSize: '0.75rem' }}
                        >
                          Remover
                        </button>
                      </div>
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
