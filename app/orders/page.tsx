"use client";

import { useCallback, useEffect, useState } from "react";
import { Order, OrderStatus, VALID_TRANSITIONS } from "../types/order";
import { Customer } from "../types/customer";
import { Courier } from "../types/courier";
import { getOrders, deleteOrder, updateOrderStatus, addDelayNote, rescheduleOrder } from "../lib/orders";
import { getCustomers } from "../lib/customers";
import { getCouriers } from "../lib/couriers";
import { createStatusNotifications, createDelayNotification, createRescheduleNotification } from "../lib/notifications";
import OrderForm from "./order-form";

const STATUS_LABELS: Record<OrderStatus, string> = {
  "pendente": "Pendente",
  "em distribuição": "Em Distribuição",
  "entregue": "Entregue",
  "cancelada": "Cancelada",
};

const STATUS_BADGE: Record<OrderStatus, string> = {
  "pendente": "badge-particular",
  "em distribuição": "badge-empresa",
  "entregue": "badge-ativo",
  "cancelada": "badge-cancelada",
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("pt-PT", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Record<string, Customer>>({});
  const [couriersMap, setCouriersMap] = useState<Record<string, Courier>>({});
  const [showForm, setShowForm] = useState(false);

  // Cancel modal state
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelError, setCancelError] = useState("");

  // Status update modal state
  const [statusOrderId, setStatusOrderId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "">("");
  const [statusNote, setStatusNote] = useState("");
  const [statusError, setStatusError] = useState("");

  // History modal state
  const [historyOrderId, setHistoryOrderId] = useState<string | null>(null);

  // Alert (delay/reschedule) modal state
  const [alertOrderId, setAlertOrderId] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<"delay" | "reschedule">("delay");
  const [alertReason, setAlertReason] = useState("");
  const [alertNewDate, setAlertNewDate] = useState("");
  const [alertError, setAlertError] = useState("");

  const load = useCallback(() => {
    setOrders(getOrders());
    const custMap: Record<string, Customer> = {};
    getCustomers().forEach((c) => { custMap[c.id] = c; });
    setCustomers(custMap);
    const courMap: Record<string, Courier> = {};
    getCouriers().forEach((c) => { courMap[c.id] = c; });
    setCouriersMap(courMap);
  }, []);

  useEffect(() => { load(); }, [load]);

  function handleDelete(id: string) {
    if (confirm("Tem a certeza que deseja eliminar esta encomenda?")) {
      deleteOrder(id);
      load();
    }
  }

  // Cancel modal
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
      try {
        const order = orders.find((o) => o.id === cancellingOrderId);
        updateOrderStatus(cancellingOrderId, "cancelada", cancelReason.trim());
        if (order) {
          const customer = customers[order.customerId];
          if (customer) createStatusNotifications(cancellingOrderId, customer, "cancelada");
        }
        closeCancelModal();
        load();
      } catch (e) {
        setCancelError(e instanceof Error ? e.message : "Erro ao cancelar");
      }
    }
  }

  // Status update modal
  function openStatusModal(orderId: string) {
    setStatusOrderId(orderId);
    setSelectedStatus("");
    setStatusNote("");
    setStatusError("");
  }
  function closeStatusModal() {
    setStatusOrderId(null);
    setSelectedStatus("");
    setStatusNote("");
    setStatusError("");
  }
  function handleStatusUpdate() {
    if (!selectedStatus) {
      setStatusError("Selecione um estado");
      return;
    }
    if (!statusOrderId) return;
    try {
      const order = orders.find((o) => o.id === statusOrderId);
      updateOrderStatus(statusOrderId, selectedStatus as OrderStatus, statusNote.trim() || undefined);
      if (order) {
        const customer = customers[order.customerId];
        if (customer) createStatusNotifications(statusOrderId, customer, selectedStatus as OrderStatus);
      }
      closeStatusModal();
      load();
    } catch (e) {
      setStatusError(e instanceof Error ? e.message : "Erro ao atualizar");
    }
  }

  // Alert modal handlers
  function openAlertModal(orderId: string) {
    setAlertOrderId(orderId);
    setAlertType("delay");
    setAlertReason("");
    setAlertNewDate("");
    setAlertError("");
  }
  function closeAlertModal() {
    setAlertOrderId(null);
    setAlertReason("");
    setAlertNewDate("");
    setAlertError("");
  }
  function handleAlert() {
    if (!alertReason.trim()) { setAlertError("O motivo é obrigatório"); return; }
    if (alertType === "reschedule" && !alertNewDate) { setAlertError("A nova data é obrigatória"); return; }
    if (!alertOrderId) return;
    const order = orders.find((o) => o.id === alertOrderId);
    const customer = order ? customers[order.customerId] : undefined;
    if (alertType === "delay") {
      addDelayNote(alertOrderId, alertReason.trim());
      if (customer) createDelayNotification(alertOrderId, customer, alertReason.trim());
    } else {
      rescheduleOrder(alertOrderId, alertNewDate, alertReason.trim());
      if (customer) createRescheduleNotification(alertOrderId, customer, alertNewDate, alertReason.trim());
    }
    closeAlertModal();
    load();
  }

  const statusOrder = statusOrderId ? orders.find((o) => o.id === statusOrderId) : null;
  const cancellingOrder = cancellingOrderId ? orders.find((o) => o.id === cancellingOrderId) : null;
  const historyOrder = historyOrderId ? orders.find((o) => o.id === historyOrderId) : null;
  const validNextStatuses = statusOrder
    ? VALID_TRANSITIONS[statusOrder.status].filter((s) => s !== "cancelada")
    : [];

  return (
    <div className="animate-fade-in">

      {/* Cancel modal */}
      {cancellingOrderId && (
        <div className="modal-overlay" onClick={closeCancelModal}>
          <div className="modal-content glass-card-elevated animate-slide-down" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M10 6.5v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="10" cy="13.5" r="0.75" fill="currentColor"/>
                </svg>
              </div>
              <div>
                <h3>Cancelar Encomenda</h3>
                <p className="text-sm" style={{ color: "var(--muted)", marginTop: 2 }}>
                  #{cancellingOrder?.id.substring(0, 8)} · {cancellingOrder ? customers[cancellingOrder.customerId]?.name || "Desconhecido" : ""}
                </p>
              </div>
            </div>
            <div className="modal-body">
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground-secondary)" }}>
                Motivo do cancelamento <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <textarea
                className="input-field"
                style={{ height: "auto", minHeight: 80, padding: "10px 14px", resize: "vertical" }}
                value={cancelReason}
                onChange={(e) => { setCancelReason(e.target.value); if (cancelError) setCancelError(""); }}
                placeholder="Ex: Cliente solicitou cancelamento, artigo indisponível..."
                autoFocus
              />
              {cancelError && <p className="text-xs mt-1.5" style={{ color: "var(--danger)" }}>{cancelError}</p>}
            </div>
            <div className="modal-footer">
              <button type="button" onClick={closeCancelModal} className="btn btn-secondary">Voltar</button>
              <button type="button" onClick={handleCancel} className="btn btn-danger">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Confirmar Cancelamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status update modal */}
      {statusOrderId && statusOrder && (
        <div className="modal-overlay" onClick={closeStatusModal}>
          <div className="modal-content glass-card-elevated animate-slide-down" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 3v3M10 14v3M3 10h3M14 10h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </div>
              <div>
                <h3>Atualizar Estado</h3>
                <p className="text-sm" style={{ color: "var(--muted)", marginTop: 2 }}>
                  #{statusOrder.id.substring(0, 8)} · Estado atual:{" "}
                  <span className={`badge ${STATUS_BADGE[statusOrder.status]}`} style={{ fontSize: "0.7rem", padding: "2px 7px" }}>
                    {STATUS_LABELS[statusOrder.status]}
                  </span>
                </p>
              </div>
            </div>
            <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {validNextStatuses.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  Não existem transições de estado disponíveis para esta encomenda.
                </p>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground-secondary)" }}>
                      Novo estado <span style={{ color: "var(--danger)" }}>*</span>
                    </label>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {validNextStatuses.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => { setSelectedStatus(s); if (statusError) setStatusError(""); }}
                          style={{
                            padding: "8px 18px",
                            borderRadius: 8,
                            border: selectedStatus === s ? "2px solid var(--yale)" : "2px solid var(--border)",
                            background: selectedStatus === s ? "var(--yale)" : "var(--surface)",
                            color: selectedStatus === s ? "#fff" : "var(--foreground)",
                            fontWeight: 500,
                            fontSize: "0.875rem",
                            cursor: "pointer",
                            transition: "all 0.15s",
                          }}
                        >
                          {STATUS_LABELS[s]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground-secondary)" }}>
                      Nota (opcional)
                    </label>
                    <input
                      className="input-field"
                      type="text"
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                      placeholder="Ex: Entregue ao vizinho, assinatura obtida..."
                    />
                  </div>
                </>
              )}
              {statusError && <p className="text-xs" style={{ color: "var(--danger)" }}>{statusError}</p>}

              {/* Inline history */}
              <div>
                <p className="text-xs font-medium mb-2" style={{ color: "var(--foreground-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Histórico
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {[...(statusOrder.statusHistory ?? [])].reverse().map((entry, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span className={`badge ${STATUS_BADGE[entry.status]}`} style={{ fontSize: "0.7rem", padding: "2px 7px", minWidth: 100, textAlign: "center" }}>
                        {STATUS_LABELS[entry.status]}
                      </span>
                      <span className="text-xs" style={{ color: "var(--muted)" }}>{formatDateTime(entry.changedAt)}</span>
                      {entry.note && (
                        <span className="text-xs" style={{ color: "var(--foreground-secondary)" }}>— {entry.note}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" onClick={closeStatusModal} className="btn btn-secondary">Fechar</button>
              {validNextStatuses.length > 0 && (
                <button type="button" onClick={handleStatusUpdate} className="btn btn-primary">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2.5 7.5l3 3 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Confirmar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* History modal */}
      {historyOrderId && historyOrder && (
        <div className="modal-overlay" onClick={() => setHistoryOrderId(null)}>
          <div className="modal-content glass-card-elevated animate-slide-down" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M10 6v4.5l3 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h3>Histórico de Estado</h3>
                <p className="text-sm" style={{ color: "var(--muted)", marginTop: 2 }}>
                  #{historyOrder.id.substring(0, 8)} · {customers[historyOrder.customerId]?.name || "Desconhecido"}
                </p>
              </div>
            </div>
            <div className="modal-body">
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[...(historyOrder.statusHistory ?? [])].reverse().map((entry, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{
                        width: 10, height: 10, borderRadius: "50%",
                        background: i === 0 ? "var(--yale)" : "var(--border)",
                        marginTop: 4, flexShrink: 0,
                      }} />
                      {i < (historyOrder.statusHistory?.length ?? 0) - 1 && (
                        <div style={{ width: 2, flex: 1, minHeight: 16, background: "var(--border)", marginTop: 2 }} />
                      )}
                    </div>
                    <div style={{ paddingBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span className={`badge ${STATUS_BADGE[entry.status]}`} style={{ fontSize: "0.7rem", padding: "2px 7px" }}>
                          {STATUS_LABELS[entry.status]}
                        </span>
                        <span className="text-xs" style={{ color: "var(--muted)" }}>{formatDateTime(entry.changedAt)}</span>
                      </div>
                      {entry.note && (
                        <p className="text-xs mt-1" style={{ color: "var(--foreground-secondary)" }}>{entry.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" onClick={() => setHistoryOrderId(null)} className="btn btn-secondary">Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* Alert (delay / reschedule) modal */}
      {alertOrderId && (
        <div className="modal-overlay" onClick={closeAlertModal}>
          <div className="modal-content glass-card-elevated animate-slide-down" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 3.5L2 16.5h16L10 3.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                  <path d="M10 8.5v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="10" cy="14.5" r="0.75" fill="currentColor"/>
                </svg>
              </div>
              <div>
                <h3>Aviso de Atraso / Reagendamento</h3>
                <p className="text-sm" style={{ color: "var(--muted)", marginTop: 2 }}>
                  #{alertOrderId.substring(0, 8)} · {customers[orders.find((o) => o.id === alertOrderId)?.customerId ?? ""]?.name || "Desconhecido"}
                </p>
              </div>
            </div>
            <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Type selector */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground-secondary)" }}>
                  Tipo de aviso <span style={{ color: "var(--danger)" }}>*</span>
                </label>
                <div style={{ display: "flex", gap: 10 }}>
                  {(["delay", "reschedule"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => { setAlertType(t); setAlertError(""); }}
                      style={{
                        padding: "8px 18px",
                        borderRadius: 8,
                        border: alertType === t ? "2px solid var(--yale)" : "2px solid var(--border)",
                        background: alertType === t ? "var(--yale)" : "var(--surface)",
                        color: alertType === t ? "#fff" : "var(--foreground)",
                        fontWeight: 500,
                        fontSize: "0.875rem",
                        cursor: "pointer",
                        transition: "all 0.15s",
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                      }}
                    >
                      {t === "delay" ? (
                        <>
                          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.1"/>
                            <path d="M6.5 4v3l2 1" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                          </svg>
                          Atraso
                        </>
                      ) : (
                        <>
                          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                            <rect x="1" y="2" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.1"/>
                            <path d="M1 5h11M4 1v2M9 1v2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                          </svg>
                          Reagendamento
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* New date (reschedule only) */}
              {alertType === "reschedule" && (
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground-secondary)" }}>
                    Nova data prevista <span style={{ color: "var(--danger)" }}>*</span>
                  </label>
                  <input
                    type="date"
                    className="input-field"
                    value={alertNewDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => { setAlertNewDate(e.target.value); if (alertError) setAlertError(""); }}
                  />
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground-secondary)" }}>
                  {alertType === "delay" ? "Motivo do atraso" : "Motivo do reagendamento"}{" "}
                  <span style={{ color: "var(--danger)" }}>*</span>
                </label>
                <textarea
                  className="input-field"
                  style={{ height: "auto", minHeight: 80, padding: "10px 14px", resize: "vertical" }}
                  value={alertReason}
                  onChange={(e) => { setAlertReason(e.target.value); if (alertError) setAlertError(""); }}
                  placeholder={alertType === "delay"
                    ? "Ex: Congestionamento de tráfego, condições meteorológicas..."
                    : "Ex: Ausência do destinatário, morada inacessível..."}
                  autoFocus
                />
              </div>

              {alertError && <p className="text-xs" style={{ color: "var(--danger)" }}>{alertError}</p>}
            </div>
            <div className="modal-footer">
              <button type="button" onClick={closeAlertModal} className="btn btn-secondary">Cancelar</button>
              <button type="button" onClick={handleAlert} className="btn btn-primary">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7l3.5 3.5L12 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Enviar Aviso
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
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Nova Encomenda
          </button>
        )}
      </div>

      {showForm && (
        <div className="glass-card form-section mb-8">
          <h2>Criar Nova Encomenda</h2>
          <OrderForm onSaved={() => { setShowForm(false); load(); }} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {orders.length === 0 ? (
        <div className="glass-card empty-state">
          <div className="empty-state-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M8 2.5L2.5 5.5V10.5L8 13.5L13.5 10.5V5.5L8 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M2.5 5.5L8 8.5L13.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M8 13.5V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-base font-medium" style={{ color: "var(--foreground-secondary)" }}>Nenhuma encomenda registada</p>
          <p className="text-sm mt-1.5">Clique em &quot;Nova Encomenda&quot; para começar</p>
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
                  <th style={{ width: 200 }}></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className={o.status === "cancelada" ? "row-cancelled" : ""}>
                    <td className="font-mono" style={{ fontSize: "0.8125rem", color: "var(--yale)" }}>
                      #{o.id.substring(0, 8)}
                    </td>
                    <td className="font-medium">{customers[o.customerId]?.name || "Desconhecido"}</td>
                    <td style={{ color: "var(--foreground-secondary)" }}>{o.articles}</td>
                    <td style={{ color: "var(--foreground-secondary)" }}>
                      {new Date(o.expectedDate).toLocaleDateString("pt-PT")}
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span className={`badge ${STATUS_BADGE[o.status]}`}>
                          {STATUS_LABELS[o.status]}
                        </span>
                        {o.status === "cancelada" && o.cancellationReason && (
                          <span className="cancel-reason-tooltip" title={o.cancellationReason}>
                            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                              <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1"/>
                              <path d="M6.5 4.5v2.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                              <circle cx="6.5" cy="9" r="0.5" fill="currentColor"/>
                            </svg>
                          </span>
                        )}
                        <button
                          onClick={() => setHistoryOrderId(o.id)}
                          title="Ver histórico"
                          style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: "var(--muted)", display: "flex" }}
                        >
                          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1"/>
                            <path d="M6.5 4v3l2 1" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td style={{ color: "var(--foreground-secondary)" }}>
                      {o.courierId ? couriersMap[o.courierId]?.name || "—" : "—"}
                    </td>
                    <td>
                      <div className="flex gap-2" style={{ flexWrap: "wrap" }}>
                        {VALID_TRANSITIONS[o.status].filter((s) => s !== "cancelada").length > 0 && (
                          <button
                            onClick={() => openStatusModal(o.id)}
                            className="btn btn-secondary"
                            style={{ fontSize: "0.75rem", padding: "4px 10px" }}
                          >
                            Atualizar Estado
                          </button>
                        )}
                        {(o.status === "pendente" || o.status === "em distribuição") && (
                          <button
                            onClick={() => openAlertModal(o.id)}
                            className="btn btn-secondary"
                            style={{ fontSize: "0.75rem", padding: "4px 10px", display: "flex", alignItems: "center", gap: 5 }}
                          >
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M6 1.5L1 10.5h10L6 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                              <path d="M6 5v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                              <circle cx="6" cy="9" r="0.5" fill="currentColor"/>
                            </svg>
                            Aviso
                          </button>
                        )}
                        {o.status !== "cancelada" && o.status !== "entregue" && (
                          <button
                            onClick={() => openCancelModal(o.id)}
                            className="btn-danger-ghost"
                            style={{ fontSize: "0.75rem" }}
                          >
                            Cancelar
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(o.id)}
                          className="btn-danger-ghost"
                          style={{ fontSize: "0.75rem" }}
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
