"use client";

import { useCallback, useEffect, useState } from "react";
import { Order } from "../types/order";
import { Courier } from "../types/courier";
import { Customer } from "../types/customer";
import { getOrders, assignCourier } from "../lib/orders";
import { getCouriers } from "../lib/couriers";
import { getCustomers } from "../lib/customers";

export default function DispatchPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [customers, setCustomers] = useState<Record<string, Customer>>({});
  const [draggedOrderId, setDraggedOrderId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(() => {
    setOrders(getOrders());
    setCouriers(getCouriers());
    const custMap: Record<string, Customer> = {};
    getCustomers().forEach((c) => {
      custMap[c.id] = c;
    });
    setCustomers(custMap);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  /* ── assignment logic ── */
  function assignOrder(orderId: string, courierId: string | null) {
    assignCourier(orderId, courierId);
    const order = orders.find((o) => o.id === orderId);
    const courier = couriers.find((c) => c.id === courierId);
    if (courier && order) {
      setToast(`Encomenda #${order.id.substring(0, 8)} atribuída a ${courier.name}`);
    } else if (order) {
      setToast(`Encomenda #${order.id.substring(0, 8)} desatribuída`);
    }
    load();
  }

  /* ── drag handlers ── */
  function handleDragStart(orderId: string) {
    setDraggedOrderId(orderId);
  }

  function handleDragEnd() {
    setDraggedOrderId(null);
    setDropTargetId(null);
  }

  function handleDragOver(e: React.DragEvent, courierId: string | null) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTargetId(courierId);
  }

  function handleDragLeave() {
    setDropTargetId(null);
  }

  function handleDrop(e: React.DragEvent, courierId: string | null) {
    e.preventDefault();
    setDropTargetId(null);
    if (draggedOrderId) {
      assignOrder(draggedOrderId, courierId);
    }
    setDraggedOrderId(null);
  }

  /* ── derived data ── */
  const unassignedOrders = orders.filter((o) => !o.courierId);
  const courierOrders = (courierId: string) =>
    orders.filter((o) => o.courierId === courierId);

  return (
    <div className="animate-fade-in">
      {/* Toast */}
      {toast && (
        <div className="dispatch-toast animate-slide-down">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 5L6.5 11.5L3 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {toast}
        </div>
      )}

      {/* Page header */}
      <div className="page-header">
        <div>
          <h1>Despacho</h1>
          <p>Atribuir encomendas a estafetas por drag-and-drop ou dropdown</p>
          <div className="accent-line" />
        </div>
      </div>

      {couriers.length === 0 || orders.length === 0 ? (
        <div className="glass-card empty-state">
          <div className="empty-state-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="text-base font-medium" style={{ color: 'var(--foreground-secondary)' }}>
            {couriers.length === 0
              ? "Nenhum estafeta registado"
              : "Nenhuma encomenda registada"}
          </p>
          <p className="text-sm mt-1.5">
            {couriers.length === 0
              ? "Registe estafetas primeiro para poder atribuir encomendas"
              : "Crie encomendas primeiro para poder atribuí-las"}
          </p>
        </div>
      ) : (
        <div className="dispatch-board">
          {/* Unassigned column */}
          <div
            className={`dispatch-column ${dropTargetId === "__unassigned" ? "dispatch-column-drop-active" : ""}`}
            onDragOver={(e) => handleDragOver(e, "__unassigned")}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, null)}
          >
            <div className="dispatch-column-header">
              <div className="dispatch-column-header-icon" style={{ background: 'var(--chiffon)' }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 2.5L2 5.5V9.5L7 12.5L12 9.5V5.5L7 2.5Z" stroke="var(--yale)" strokeWidth="1.2" strokeLinejoin="round"/>
                  <path d="M2 5.5L7 8.5L12 5.5" stroke="var(--yale)" strokeWidth="1.2" strokeLinejoin="round"/>
                  <path d="M7 12.5V8.5" stroke="var(--yale)" strokeWidth="1.2" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h3>Não Atribuídas</h3>
                <span className="dispatch-column-count">{unassignedOrders.length} encomenda{unassignedOrders.length !== 1 ? "s" : ""}</span>
              </div>
            </div>
            <div className="dispatch-column-body">
              {unassignedOrders.length === 0 ? (
                <div className="dispatch-empty-lane">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 5L6.5 11.5L3 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Todas as encomendas atribuídas
                </div>
              ) : (
                unassignedOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    customerName={customers[order.customerId]?.name}
                    couriers={couriers}
                    isDragging={draggedOrderId === order.id}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onAssign={assignOrder}
                  />
                ))
              )}
            </div>
          </div>

          {/* Courier columns */}
          {couriers.map((courier) => {
            const courierOrdersList = courierOrders(courier.id);
            return (
              <div
                key={courier.id}
                className={`dispatch-column ${dropTargetId === courier.id ? "dispatch-column-drop-active" : ""}`}
                onDragOver={(e) => handleDragOver(e, courier.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, courier.id)}
              >
                <div className="dispatch-column-header">
                  <div className="dispatch-column-header-icon" style={{ background: 'var(--yale-faint)' }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="7" cy="5" r="2.5" stroke="var(--yale)" strokeWidth="1.2"/>
                      <path d="M3 12.5c0-2.5 2-4 4-4s4 1.5 4 4" stroke="var(--yale)" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div>
                    <h3>{courier.name}</h3>
                    <span className="dispatch-column-count">
                      {courierOrdersList.length} encomenda{courierOrdersList.length !== 1 ? "s" : ""}
                      {courier.preferredZone && ` · ${courier.preferredZone}`}
                    </span>
                  </div>
                </div>
                <div className="dispatch-column-body">
                  {courierOrdersList.length === 0 ? (
                    <div className="dispatch-empty-lane">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                      Arraste encomendas para cá
                    </div>
                  ) : (
                    courierOrdersList.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        customerName={customers[order.customerId]?.name}
                        couriers={couriers}
                        isDragging={draggedOrderId === order.id}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onAssign={assignOrder}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Order card component ── */
interface OrderCardProps {
  order: Order;
  customerName?: string;
  couriers: Courier[];
  isDragging: boolean;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onAssign: (orderId: string, courierId: string | null) => void;
}

function OrderCard({
  order,
  customerName,
  couriers,
  isDragging,
  onDragStart,
  onDragEnd,
  onAssign,
}: OrderCardProps) {
  const statusLabel: Record<string, string> = {
    pendente: "Pendente",
    "em distribuição": "Em Distribuição",
    entregue: "Entregue",
    cancelada: "Cancelada",
  };

  const statusClass: Record<string, string> = {
    pendente: "badge-particular",
    "em distribuição": "badge-empresa",
    entregue: "badge-ativo",
    cancelada: "badge-manutencao",
  };

  return (
    <div
      className={`dispatch-card ${isDragging ? "dispatch-card-dragging" : ""}`}
      draggable
      onDragStart={() => onDragStart(order.id)}
      onDragEnd={onDragEnd}
    >
      <div className="dispatch-card-header">
        <span className="dispatch-card-id font-mono">#{order.id.substring(0, 8)}</span>
        <span className={`badge ${statusClass[order.status] || "badge-default"}`}>
          {statusLabel[order.status] || order.status}
        </span>
      </div>
      <div className="dispatch-card-customer">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="6" cy="4" r="2" stroke="currentColor" strokeWidth="1"/>
          <path d="M2.5 10.5c0-2 1.5-3 3.5-3s3.5 1 3.5 3" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
        </svg>
        {customerName || "Desconhecido"}
      </div>
      <div className="dispatch-card-articles">{order.articles}</div>
      <div className="dispatch-card-date">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="1.5" y="2" width="9" height="8" rx="1.5" stroke="currentColor" strokeWidth="1"/>
          <path d="M1.5 5h9M4 1v2M8 1v2" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
        </svg>
        {new Date(order.expectedDate).toLocaleDateString("pt-PT")}
      </div>
      <div className="dispatch-card-assign">
        <select
          className="dispatch-select"
          value={order.courierId || ""}
          onChange={(e) => onAssign(order.id, e.target.value || null)}
          onClick={(e) => e.stopPropagation()}
        >
          <option value="">Sem atribuição</option>
          {couriers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
