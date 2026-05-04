"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Customer } from "../../types/customer";
import { Address } from "../../types/address";
import { Notification } from "../../types/notification";
import { Order, OrderStatus } from "../../types/order";
import { getCustomers, updateCustomerPreferences } from "../../lib/customers";
import {
  addAddress,
  deleteAddress,
  getAddressesByCustomer,
  setDefaultAddress,
  updateAddress,
} from "../../lib/addresses";
import { getNotificationsByCustomer } from "../../lib/notifications";
import { getOrdersByCustomer, confirmReception } from "../../lib/orders";
import AddressForm from "./address-form";

const STATUS_LABELS: Record<OrderStatus, string> = {
  "pendente": "Pendente",
  "em distribuição": "Em Distribuição",
  "entregue": "Entregue",
  "cancelada": "Cancelada",
  "falhou": "Falhou",
};

const STATUS_BADGE: Record<OrderStatus, string> = {
  "pendente": "badge-particular",
  "em distribuição": "badge-empresa",
  "entregue": "badge-ativo",
  "cancelada": "badge-cancelada",
  "falhou": "badge-cancelada",
};

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [dateSortAsc, setDateSortAsc] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const load = useCallback(() => {
    const found = getCustomers().find((c) => c.id === id);
    setCustomer(found ?? null);
    if (found) {
      setAddresses(getAddressesByCustomer(found.id));
      setNotifications(getNotificationsByCustomer(found.id));
      setOrders(getOrdersByCustomer(found.id));
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  function handleTogglePreference(channel: 'email' | 'sms') {
    if (!customer) return;
    const currentPrefs = customer.communicationPreferences || { email: true, sms: true };
    const newPrefs = { ...currentPrefs, [channel]: !currentPrefs[channel] };
    updateCustomerPreferences(customer.id, newPrefs);
    setCustomer({ ...customer, communicationPreferences: newPrefs });
  }

  function handleAdd(data: {
    street: string;
    city: string;
    postalCode: string;
    zone: string;
    isDefault: boolean;
  }) {
    addAddress({ ...data, customerId: id });
    setShowForm(false);
    load();
  }

  function handleUpdate(data: {
    street: string;
    city: string;
    postalCode: string;
    zone: string;
    isDefault: boolean;
  }) {
    if (!editingAddress) return;
    updateAddress(editingAddress.id, data);
    setEditingAddress(null);
    load();
  }

  function handleDelete(addressId: string) {
    deleteAddress(addressId);
    load();
  }

  function handleSetDefault(addressId: string) {
    setDefaultAddress(addressId);
    load();
  }

  if (!customer) {
    return (
      <div className="glass-card empty-state animate-fade-in">
        <div className="empty-state-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <p className="text-base font-medium" style={{ color: 'var(--foreground-secondary)' }}>
          Cliente não encontrado
        </p>
        <Link
          href="/customers"
          className="btn btn-primary mt-4"
          style={{ fontSize: '0.8125rem' }}
        >
          Voltar à lista
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Back link */}
      <Link href="/customers" className="back-link">
        <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.5 3L4.5 7L8.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Voltar à lista
      </Link>

      {/* Customer info header */}
      <div className="glass-card p-6 mt-4 mb-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: customer.type === "empresa"
                  ? 'rgba(13, 59, 102, 0.09)'
                  : 'var(--chiffon)',
              }}
            >
              {customer.type === "empresa" ? (
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="5" width="16" height="14" rx="1.5" stroke="var(--yale)" strokeWidth="1.3"/>
                  <path d="M8 5V3.5A1.5 1.5 0 019.5 2h3A1.5 1.5 0 0114 3.5V5" stroke="var(--yale)" strokeWidth="1.3"/>
                  <path d="M3 10h16" stroke="var(--yale)" strokeWidth="1.3"/>
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="11" cy="8" r="3.5" stroke="var(--yale)" strokeWidth="1.3"/>
                  <path d="M4.5 19c0-3.5 3-6.5 6.5-6.5s6.5 3 6.5 6.5" stroke="var(--yale)" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              )}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1
                  className="text-xl font-bold tracking-tight"
                  style={{ color: 'var(--foreground)', letterSpacing: '-0.01em' }}
                >
                  {customer.name}
                </h1>
                <span className={`badge ${customer.type === "empresa" ? "badge-empresa" : "badge-particular"}`}>
                  {customer.type === "empresa" ? "Empresa" : "Particular"}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1.5" y="2" width="10" height="9" rx="1" stroke="currentColor" strokeWidth="1.1"/>
                    <path d="M1.5 5h10" stroke="currentColor" strokeWidth="1.1"/>
                  </svg>
                  {customer.nif}
                </span>
                <span style={{ color: 'var(--border-strong)', fontSize: '0.75rem' }}>·</span>
                <span className="inline-flex items-center gap-1.5 text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1.5" y="2.5" width="10" height="8" rx="1" stroke="currentColor" strokeWidth="1.1"/>
                    <path d="M1.5 2.5L6.5 7L11.5 2.5" stroke="currentColor" strokeWidth="1.1"/>
                  </svg>
                  {customer.email}
                </span>
                <span style={{ color: 'var(--border-strong)', fontSize: '0.75rem' }}>·</span>
                <span className="inline-flex items-center gap-1.5 text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="1.5" width="7" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.1"/>
                    <path d="M5.5 9.5h2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                  </svg>
                  {customer.phone}
                </span>
              </div>
          </div>
          
          <div className="flex flex-col gap-2 min-w-[200px] border-t md:border-t-0 md:border-l border-[var(--border)] pt-4 md:pt-0 md:pl-6 mt-4 md:mt-0">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Preferências de Comunicação</h3>
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>Receber por Email</span>
              <div className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${customer.communicationPreferences?.email !== false ? 'bg-[var(--yale)]' : 'bg-[var(--border-strong)]'}`}>
                <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${customer.communicationPreferences?.email !== false ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
              <input type="checkbox" className="hidden" checked={customer.communicationPreferences?.email !== false} onChange={() => handleTogglePreference('email')} />
            </label>
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>Receber por SMS</span>
              <div className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${customer.communicationPreferences?.sms !== false ? 'bg-[var(--yale)]' : 'bg-[var(--border-strong)]'}`}>
                <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${customer.communicationPreferences?.sms !== false ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
              <input type="checkbox" className="hidden" checked={customer.communicationPreferences?.sms !== false} onChange={() => handleTogglePreference('sms')} />
            </label>
          </div>
        </div>
      </div>
    </div>

      {/* Addresses section */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
            Moradas de Entrega
          </h2>
          <div className="accent-line" style={{ marginTop: 6 }} />
        </div>
        {!showForm && !editingAddress && (
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary"
            style={{ height: 36, fontSize: '0.8125rem' }}
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Nova Morada
          </button>
        )}
      </div>

      {showForm && (
        <div className="glass-card form-section mb-6">
          <h3>Adicionar Morada</h3>
          <AddressForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {editingAddress && (
        <div className="glass-card form-section mb-6">
          <h3>Editar Morada</h3>
          <AddressForm
            initial={editingAddress}
            onSubmit={handleUpdate}
            onCancel={() => setEditingAddress(null)}
          />
        </div>
      )}

      {/* Order history section */}
      {(() => {
        const sorted = [...orders].sort((a, b) =>
          dateSortAsc
            ? a.createdAt.localeCompare(b.createdAt)
            : b.createdAt.localeCompare(a.createdAt)
        );
        return (
          <>
            <div className="flex items-center justify-between mb-5 mt-10">
              <div>
                <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
                  Histórico de Encomendas
                </h2>
                <div className="accent-line" style={{ marginTop: 6 }} />
              </div>
              {orders.length > 0 && (
                <span className="text-sm" style={{ color: "var(--muted)" }}>
                  {orders.length} encomenda{orders.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {orders.length === 0 ? (
              <div className="glass-card empty-state" style={{ padding: "32px 24px", marginBottom: 32 }}>
                <div className="empty-state-icon">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <path d="M8 2.5L2.5 5.5V10.5L8 13.5L13.5 10.5V5.5L8 2.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                    <path d="M2.5 5.5L8 8.5L13.5 5.5" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                    <path d="M8 13.5V8.5" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="text-sm font-medium" style={{ color: "var(--foreground-secondary)" }}>
                  Sem encomendas registadas
                </p>
              </div>
            ) : (
              <div className="glass-card overflow-hidden" style={{ marginBottom: 32 }}>
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>
                          <button
                            onClick={() => setDateSortAsc((v) => !v)}
                            style={{
                              background: "none", border: "none", cursor: "pointer",
                              display: "inline-flex", alignItems: "center", gap: 5,
                              fontWeight: 600, fontSize: "inherit", color: "inherit", padding: 0,
                            }}
                          >
                            Data
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ opacity: 0.6 }}>
                              {dateSortAsc ? (
                                <path d="M3 7.5l3-3 3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                              ) : (
                                <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                              )}
                            </svg>
                          </button>
                        </th>
                        <th>ID</th>
                        <th>Estado</th>
                        <th>Artigos</th>
                        <th>Total</th>
                        <th>Receção</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sorted.map((o) => {
                        const articleCount = o.articles
                          ? o.articles.split(",").map((s) => s.trim()).filter(Boolean).length
                          : 0;
                        return (
                          <tr key={o.id} className={o.status === "cancelada" ? "row-cancelled" : ""}>
                            <td style={{ color: "var(--foreground-secondary)", whiteSpace: "nowrap" }}>
                              {new Date(o.createdAt).toLocaleDateString("pt-PT", {
                                day: "2-digit", month: "2-digit", year: "numeric",
                              })}
                            </td>
                            <td className="font-mono" style={{ fontSize: "0.8125rem", color: "var(--yale)" }}>
                              #{o.id.substring(0, 8)}
                            </td>
                            <td>
                              <span className={`badge ${STATUS_BADGE[o.status]}`} style={{ fontSize: "0.7rem" }}>
                                {STATUS_LABELS[o.status]}
                              </span>
                            </td>
                            <td style={{ color: "var(--foreground-secondary)", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {o.articles || "—"}
                            </td>
                            <td style={{ color: "var(--foreground-secondary)", fontVariantNumeric: "tabular-nums" }}>
                              {articleCount} {articleCount === 1 ? "artigo" : "artigos"}
                            </td>
                            <td>
                              {o.status === "entregue" && !o.confirmedAt && (
                                <button
                                  onClick={() => {
                                    confirmReception(o.id);
                                    load();
                                  }}
                                  className="btn btn-confirm-reception"
                                >
                                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M2.5 6.5l2.5 2.5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                  Confirmar Receção
                                </button>
                              )}
                              {o.confirmedAt && (
                                <span className="confirmed-label">
                                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="5.5" cy="5.5" r="4.5" stroke="currentColor" strokeWidth="1"/>
                                    <path d="M3.5 5.5l1.5 1.5 3-3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                  Confirmada a {new Date(o.confirmedAt).toLocaleString("pt-PT", {
                                    day: "2-digit", month: "2-digit", year: "numeric",
                                    hour: "2-digit", minute: "2-digit",
                                  })}
                                </span>
                              )}
                              {o.status !== "entregue" && !o.confirmedAt && (
                                <span style={{ color: "var(--muted)", fontSize: "0.75rem" }}>—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        );
      })()}

      {/* Notifications section */}
      <div className="flex items-center justify-between mb-5 mt-10">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
            Notificações
          </h2>
          <div className="accent-line" style={{ marginTop: 6 }} />
        </div>
        {notifications.length > 0 && (
          <span className="text-sm" style={{ color: "var(--muted)" }}>
            {notifications.length} notificaç{notifications.length === 1 ? "ão" : "ões"} enviada{notifications.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="glass-card empty-state" style={{ padding: "32px 24px", marginBottom: 32 }}>
          <div className="empty-state-icon">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M11 3a6 6 0 016 6v3.5l1.5 2H3.5L5 12.5V9a6 6 0 016-6z" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M9 17a2 2 0 004 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="text-sm font-medium" style={{ color: "var(--foreground-secondary)" }}>
            Sem notificações
          </p>
          <p className="text-xs mt-1">As notificações aparecem aqui quando o estado de uma encomenda mudar</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden" style={{ marginBottom: 32 }}>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Data/Hora</th>
                  <th>Canal</th>
                  <th>Destinatário</th>
                  <th>Encomenda</th>
                  <th>Estado</th>
                  <th>Mensagem</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((n) => (
                  <tr key={n.id}>
                    <td className="font-mono" style={{ fontSize: "0.8rem", color: "var(--muted)", whiteSpace: "nowrap" }}>
                      {new Date(n.sentAt).toLocaleString("pt-PT", {
                        day: "2-digit", month: "2-digit", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </td>
                    <td>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          padding: "3px 9px",
                          borderRadius: 6,
                          background: n.channel === "email" ? "rgba(13,59,102,0.09)" : "rgba(240,180,41,0.15)",
                          color: n.channel === "email" ? "var(--yale)" : "#a07000",
                        }}
                      >
                        {n.channel === "email" ? (
                          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                            <rect x="0.5" y="1.5" width="10" height="8" rx="1" stroke="currentColor" strokeWidth="1"/>
                            <path d="M0.5 1.5L5.5 6L10.5 1.5" stroke="currentColor" strokeWidth="1"/>
                          </svg>
                        ) : (
                          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                            <rect x="3" y="0.5" width="5" height="10" rx="1.5" stroke="currentColor" strokeWidth="1"/>
                            <path d="M4.5 8.5h2" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                          </svg>
                        )}
                        {n.channel === "email" ? "Email" : "SMS"}
                      </span>
                    </td>
                    <td className="font-mono" style={{ fontSize: "0.8125rem", color: "var(--foreground-secondary)" }}>
                      {n.recipient}
                    </td>
                    <td className="font-mono" style={{ fontSize: "0.8125rem", color: "var(--yale)" }}>
                      #{n.orderId.substring(0, 8)}
                    </td>
                    <td>
                      {n.type === "delay" ? (
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          fontSize: "0.7rem", fontWeight: 600, padding: "2px 7px", borderRadius: 6,
                          background: "rgba(220,100,0,0.1)", color: "#b85000",
                        }}>
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1"/>
                            <path d="M5 3v2.5l1.5 1" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                          </svg>
                          Atraso
                        </span>
                      ) : n.type === "reschedule" ? (
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          fontSize: "0.7rem", fontWeight: 600, padding: "2px 7px", borderRadius: 6,
                          background: "rgba(80,80,200,0.1)", color: "#3030a0",
                        }}>
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <rect x="0.5" y="1.5" width="9" height="8" rx="1" stroke="currentColor" strokeWidth="1"/>
                            <path d="M0.5 4h9M3 0.5v2M7 0.5v2" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                          </svg>
                          Reagendamento
                          {n.newExpectedDate && (
                            <span style={{ fontWeight: 400, opacity: 0.8 }}>
                              {" → "}{new Date(n.newExpectedDate).toLocaleDateString("pt-PT")}
                            </span>
                          )}
                        </span>
                      ) : n.orderStatus ? (
                        <span className={`badge ${
                          n.orderStatus === "entregue" ? "badge-ativo" :
                          n.orderStatus === "em distribuição" ? "badge-empresa" :
                          n.orderStatus === "cancelada" ? "badge-cancelada" :
                          n.orderStatus === "falhou" ? "badge-cancelada" :
                          "badge-particular"
                        }`} style={{ fontSize: "0.7rem" }}>
                          {n.orderStatus === "pendente" ? "Pendente" :
                           n.orderStatus === "em distribuição" ? "Em Distribuição" :
                           n.orderStatus === "entregue" ? "Entregue" :
                           n.orderStatus === "falhou" ? "Falhou" : "Cancelada"}
                        </span>
                      ) : null}
                    </td>
                    <td style={{ color: "var(--foreground-secondary)", fontSize: "0.8125rem", maxWidth: 300 }}>
                      {n.message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Addresses section */}
      {addresses.length === 0 ? (
        <div className="glass-card empty-state" style={{ padding: '40px 24px' }}>
          <div className="empty-state-icon">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 2C7 2 4 5.5 4 9.5S11 20 11 20s7-6.5 7-10.5S15 2 11 2z" stroke="currentColor" strokeWidth="1.3"/>
              <circle cx="11" cy="9.5" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
            </svg>
          </div>
          <p className="text-sm font-medium" style={{ color: 'var(--foreground-secondary)' }}>
            Nenhuma morada registada
          </p>
          <p className="text-xs mt-1">
            Clique em &quot;Nova Morada&quot; para adicionar
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((a) => (
            <div
              key={a.id}
              className="glass-card p-4 flex items-start justify-between gap-4 transition-base"
              style={a.isDefault ? {
                borderColor: 'rgba(13, 59, 102, 0.25)',
                background: 'rgba(13, 59, 102, 0.03)',
              } : {}}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = 'var(--glass-shadow-lg)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = 'var(--glass-shadow)';
              }}
            >
              <div className="min-w-0 flex items-start gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{
                    background: a.isDefault ? 'rgba(13, 59, 102, 0.09)' : 'var(--chiffon)',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 1.5C5.5 1.5 3.5 3.8 3.5 6.5S8 14 8 14s4.5-4.8 4.5-7.5S10.5 1.5 8 1.5z" stroke="var(--yale)" strokeWidth="1.2"/>
                    <circle cx="8" cy="6.5" r="1.8" stroke="var(--yale)" strokeWidth="1.2"/>
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                      {a.street}
                    </p>
                    {a.isDefault && (
                      <span className="badge badge-default">Predefinida</span>
                    )}
                  </div>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
                    {a.postalCode} {a.city}
                    <span style={{ margin: '0 6px', opacity: 0.4 }}>·</span>
                    Zona: {a.zone}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {!a.isDefault && (
                  <button
                    onClick={() => handleSetDefault(a.id)}
                    className="btn-ghost"
                    style={{ fontSize: '0.75rem' }}
                  >
                    Predefinir
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingAddress(a);
                  }}
                  className="btn-ghost"
                  style={{ fontSize: '0.75rem' }}
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(a.id)}
                  className="btn-danger-ghost"
                  style={{ fontSize: '0.75rem' }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
