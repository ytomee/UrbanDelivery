"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Order } from "../types/order";
import { Courier } from "../types/courier";
import { Customer } from "../types/customer";
import { Address } from "../types/address";
import { getOrders } from "../lib/orders";
import { getCouriers } from "../lib/couriers";
import { getCustomers } from "../lib/customers";
import { getAllAddresses } from "../lib/addresses";

interface EnrichedOrder extends Order {
  customerName: string;
  address: Address | null;
  courierName: string | null;
}

interface RouteGroup {
  key: string;
  label: string;
  postalCode: string;
  zone: string;
  orders: EnrichedOrder[];
}

export default function RoutesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [couriers, setCouriers] = useState<Record<string, Courier>>({});
  const [customers, setCustomers] = useState<Record<string, Customer>>({});
  const [addresses, setAddresses] = useState<Record<string, Address>>({});
  const [postalFilter, setPostalFilter] = useState("");
  const [zoneFilter, setZoneFilter] = useState("");

  const load = useCallback(() => {
    setOrders(getOrders());
    const cMap: Record<string, Courier> = {};
    getCouriers().forEach((c) => { cMap[c.id] = c; });
    setCouriers(cMap);
    const cuMap: Record<string, Customer> = {};
    getCustomers().forEach((c) => { cuMap[c.id] = c; });
    setCustomers(cuMap);
    const aMap: Record<string, Address> = {};
    getAllAddresses().forEach((a) => { aMap[a.id] = a; });
    setAddresses(aMap);
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── enrich orders with resolved names ── */
  const enriched: EnrichedOrder[] = useMemo(() =>
    orders
      .filter((o) => o.status !== "cancelada")
      .map((o) => ({
        ...o,
        customerName: customers[o.customerId]?.name || "Desconhecido",
        address: addresses[o.addressId] || null,
        courierName: o.courierId ? couriers[o.courierId]?.name || null : null,
      })),
    [orders, customers, addresses, couriers]
  );

  /* ── unique postal codes and zones for filters ── */
  const uniquePostalCodes = useMemo(() => {
    const set = new Set<string>();
    enriched.forEach((o) => { if (o.address?.postalCode) set.add(o.address.postalCode); });
    return Array.from(set).sort();
  }, [enriched]);

  const uniqueZones = useMemo(() => {
    const set = new Set<string>();
    enriched.forEach((o) => { if (o.address?.zone) set.add(o.address.zone); });
    return Array.from(set).sort();
  }, [enriched]);

  /* ── filtered + grouped ── */
  const filtered = useMemo(() =>
    enriched.filter((o) => {
      if (postalFilter && o.address?.postalCode !== postalFilter) return false;
      if (zoneFilter && o.address?.zone !== zoneFilter) return false;
      return true;
    }),
    [enriched, postalFilter, zoneFilter]
  );

  const groups: RouteGroup[] = useMemo(() => {
    const map = new Map<string, RouteGroup>();
    filtered.forEach((o) => {
      const pc = o.address?.postalCode || "sem-cp";
      const zone = o.address?.zone || "Sem Zona";
      const key = `${pc}__${zone}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          label: `${zone} — ${pc}`,
          postalCode: pc,
          zone,
          orders: [],
        });
      }
      map.get(key)!.orders.push(o);
    });
    // Sort groups by postal code
    const arr = Array.from(map.values());
    arr.sort((a, b) => a.postalCode.localeCompare(b.postalCode));
    // Sort orders within each group by expectedDate for route sequence
    arr.forEach((g) =>
      g.orders.sort((a, b) => a.expectedDate.localeCompare(b.expectedDate))
    );
    return arr;
  }, [filtered]);

  /* ── CSV export ── */
  function exportCSV() {
    const header = ["Sequência", "Zona", "Código Postal", "ID Encomenda", "Cliente", "Morada", "Cidade", "Artigos", "Data Prevista", "Estado", "Estafeta"];
    const rows: string[][] = [];
    let seq = 1;
    groups.forEach((g) => {
      g.orders.forEach((o) => {
        rows.push([
          String(seq++),
          g.zone,
          g.postalCode,
          o.id.substring(0, 8),
          o.customerName,
          o.address?.street || "",
          o.address?.city || "",
          o.articles,
          new Date(o.expectedDate).toLocaleDateString("pt-PT"),
          o.status,
          o.courierName || "—",
        ]);
      });
    });

    const csvContent = [header, ...rows]
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(";"))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rotas_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /* ── Print ── */
  function handlePrint() {
    window.print();
  }

  const statusLabel: Record<string, string> = {
    pendente: "Pendente",
    "em distribuição": "Em Distribuição",
    entregue: "Entregue",
    falhou: "Falhou",
  };

  const statusClass: Record<string, string> = {
    pendente: "badge-particular",
    "em distribuição": "badge-empresa",
    entregue: "badge-ativo",
    falhou: "badge-manutencao",
  };

  const hasData = enriched.length > 0;

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1>Rotas</h1>
          <p>Agrupar encomendas por zona e código postal</p>
          <div className="accent-line" />
        </div>
        {hasData && (
          <div className="flex gap-2 no-print">
            <button onClick={exportCSV} className="btn btn-secondary">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 2v7M4 6.5L7 9.5L10 6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 10.5v1.5h10v-1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Exportar CSV
            </button>
            <button onClick={handlePrint} className="btn btn-secondary">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4.5V1.5h6v3M4 10H2.5A1 1 0 011.5 9V6a1 1 0 011-5h9a1 1 0 011 1v3a1 1 0 01-1 1H10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="4" y="8" width="6" height="4.5" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
              </svg>
              Imprimir
            </button>
          </div>
        )}
      </div>

      {!hasData ? (
        <div className="glass-card empty-state">
          <div className="empty-state-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C8 2 5 5.5 5 9.5S12 22 12 22s7-8.5 7-12.5S16 2 12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="9.5" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </div>
          <p className="text-base font-medium" style={{ color: 'var(--foreground-secondary)' }}>
            Nenhuma encomenda ativa
          </p>
          <p className="text-sm mt-1.5">
            Crie encomendas para poder visualizar rotas
          </p>
        </div>
      ) : (
        <>
          {/* Filters bar */}
          <div className="glass-card routes-filter-bar no-print">
            <div className="routes-filter-group">
              <label className="routes-filter-label">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.5 3h10L7.5 7.5V10l-2 1.5V7.5L1.5 3z" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Código Postal
              </label>
              <select
                className="input-field"
                style={{ height: 36, fontSize: '0.8125rem' }}
                value={postalFilter}
                onChange={(e) => setPostalFilter(e.target.value)}
              >
                <option value="">Todos</option>
                {uniquePostalCodes.map((pc) => (
                  <option key={pc} value={pc}>{pc}</option>
                ))}
              </select>
            </div>
            <div className="routes-filter-group">
              <label className="routes-filter-label">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.5 1C4 1 2 4 2 6.5S6.5 12 6.5 12s4.5-3 4.5-5.5S9 1 6.5 1z" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="6.5" cy="6.5" r="1.5" stroke="currentColor" strokeWidth="1"/>
                </svg>
                Zona
              </label>
              <select
                className="input-field"
                style={{ height: 36, fontSize: '0.8125rem' }}
                value={zoneFilter}
                onChange={(e) => setZoneFilter(e.target.value)}
              >
                <option value="">Todas</option>
                {uniqueZones.map((z) => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
            </div>
            <div className="routes-filter-summary">
              {filtered.length} encomenda{filtered.length !== 1 ? "s" : ""} em {groups.length} rota{groups.length !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Route groups */}
          {groups.length === 0 ? (
            <div className="glass-card empty-state" style={{ marginTop: 16 }}>
              <p className="text-base font-medium" style={{ color: 'var(--foreground-secondary)' }}>
                Nenhuma encomenda corresponde aos filtros
              </p>
            </div>
          ) : (
            <>
            <div className="routes-groups print:hidden">
              {groups.map((group, gi) => (
                <div key={group.key} className="route-group glass-card">
                  <div className="route-group-header">
                    <div className="route-group-header-left">
                      <div className="route-group-icon">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8 1C5.5 1 3.5 3.5 3.5 6S8 14 8 14s4.5-5.5 4.5-8S10.5 1 8 1z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="8" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="route-group-title">{group.zone}</h3>
                        <span className="route-group-postal">{group.postalCode}</span>
                      </div>
                    </div>
                    <span className="badge badge-default">
                      {group.orders.length} entrega{group.orders.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Sequenced route list */}
                  <div className="route-sequence">
                    {group.orders.map((order, i) => {
                      const globalSeq = groups.slice(0, gi).reduce((sum, g) => sum + g.orders.length, 0) + i + 1;
                      return (
                        <div key={order.id} className="route-stop">
                          <div className="route-stop-indicator">
                            <div className="route-stop-number">{globalSeq}</div>
                            {i < group.orders.length - 1 && <div className="route-stop-line" />}
                          </div>
                          <div className="route-stop-content">
                            <div className="route-stop-row">
                              <span className="route-stop-id font-mono">#{order.id.substring(0, 8)}</span>
                              <span className={`badge ${statusClass[order.status] || "badge-default"}`}>
                                {statusLabel[order.status] || order.status}
                              </span>
                            </div>
                            <div className="route-stop-customer">
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="6" cy="4" r="2" stroke="currentColor" strokeWidth="1"/>
                                <path d="M2.5 10.5c0-2 1.5-3 3.5-3s3.5 1 3.5 3" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                              </svg>
                              {order.customerName}
                            </div>
                            {order.address && (
                              <div className="route-stop-address">
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M6 1C4 1 2.5 3 2.5 5S6 10.5 6 10.5s3.5-3.5 3.5-5.5S8 1 6 1z" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                                  <circle cx="6" cy="5" r="1" stroke="currentColor" strokeWidth="0.8"/>
                                </svg>
                                {order.address.street}, {order.address.city}
                              </div>
                            )}
                            <div className="route-stop-meta">
                              <span className="route-stop-articles">{order.articles}</span>
                              <span className="route-stop-date">
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <rect x="1" y="1.5" width="8" height="7" rx="1" stroke="currentColor" strokeWidth="0.8"/>
                                  <path d="M1 4h8M3.5 0.5v2M6.5 0.5v2" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
                                </svg>
                                {new Date(order.expectedDate).toLocaleDateString("pt-PT")}
                              </span>
                              {order.courierName && (
                                <span className="route-stop-courier">
                                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="5" cy="3.5" r="1.5" stroke="currentColor" strokeWidth="0.8"/>
                                    <path d="M2 9c0-1.5 1.5-2.5 3-2.5s3 1 3 2.5" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
                                  </svg>
                                  {order.courierName}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Relatório de Impressão (Apenas visível em PDF) */}
            <div className="hidden print:block mt-8 w-full">
              <h2 className="text-2xl font-bold mb-4 border-b-2 border-black pb-2">Relatório de Rotas</h2>
              <div className="mb-4 flex gap-8 text-sm">
                <p><strong>Total de Encomendas:</strong> {filtered.length}</p>
                <p><strong>Total de Rotas:</strong> {groups.length}</p>
                <p><strong>Data:</strong> {new Date().toLocaleDateString("pt-PT")}</p>
              </div>
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-400 bg-gray-100">
                    <th className="py-2 px-2 font-semibold">Seq</th>
                    <th className="py-2 px-2 font-semibold">Zona</th>
                    <th className="py-2 px-2 font-semibold">Código Postal</th>
                    <th className="py-2 px-2 font-semibold">ID</th>
                    <th className="py-2 px-2 font-semibold">Cliente</th>
                    <th className="py-2 px-2 font-semibold">Morada</th>
                    <th className="py-2 px-2 font-semibold">Data Prevista</th>
                    <th className="py-2 px-2 font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map((g) => {
                    return g.orders.map((o, index) => (
                      <tr key={o.id} className="border-b border-gray-200">
                        <td className="py-1 px-2">{index + 1}</td>
                        <td className="py-1 px-2 font-medium">{g.zone}</td>
                        <td className="py-1 px-2">{g.postalCode}</td>
                        <td className="py-1 px-2 font-mono">{o.id.substring(0, 8)}</td>
                        <td className="py-1 px-2">{o.customerName}</td>
                        <td className="py-1 px-2">{o.address?.street || "—"}, {o.address?.city || "—"}</td>
                        <td className="py-1 px-2">{new Date(o.expectedDate).toLocaleDateString("pt-PT")}</td>
                        <td className="py-1 px-2">{o.status}</td>
                      </tr>
                    ));
                  })}
                </tbody>
              </table>
            </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
