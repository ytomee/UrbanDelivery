"use client";

import { useEffect, useState, useMemo } from "react";
import { Order, OrderStatus } from "../types/order";
import { Courier } from "../types/courier";
import { Address } from "../types/address";
import { getOrders } from "../lib/orders";
import { getCouriers } from "../lib/couriers";
import { getAllAddresses } from "../lib/addresses";
import { Vehicle } from "../types/vehicle";
import { getVehicles } from "../lib/vehicles";

type Period = "day" | "week" | "month";

interface ChartDataPoint {
  label: string;
  value: number;
}

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [period, setPeriod] = useState<Period>("day");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setOrders(getOrders());
    setCouriers(getCouriers());
    setAddresses(getAllAddresses());
    setVehicles(getVehicles());

    // Pequeno atraso para a animação de altura funcionar corretamente no mount
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const chartData = useMemo(() => {
    // Generate data based on period
    const now = new Date();
    const data: ChartDataPoint[] = [];

    // helper to zero-out time
    const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

    if (period === "day") {
      // Last 5 days
      for (let i = 4; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const label = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
        data.push({ label, value: 0 });
      }

      orders.forEach(o => {
        const d = new Date(o.createdAt);
        const diffTime = startOfDay(now).getTime() - startOfDay(d).getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays < 5) {
          const idx = 4 - diffDays;
          if (data[idx]) data[idx].value++;
        }
      });

    } else if (period === "week") {
      // Last 4 weeks
      for (let i = 3; i >= 0; i--) {
        data.push({ label: `Semana ${4 - i}`, value: 0 });
      }

      orders.forEach(o => {
        const d = new Date(o.createdAt);
        const diffTime = startOfDay(now).getTime() - startOfDay(d).getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays < 28) {
          const weekIdx = Math.floor(diffDays / 7); // 0 is current week, 1 is last week
          const idx = 3 - weekIdx;
          if (data[idx]) data[idx].value++;
        }
      });

    } else if (period === "month") {
      // Last 6 months
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = d.toLocaleDateString("pt-PT", { month: 'short' });
        data.push({ label, value: 0 });
      }

      orders.forEach(o => {
        const d = new Date(o.createdAt);
        const diffMonths = (now.getFullYear() - d.getFullYear()) * 12 + now.getMonth() - d.getMonth();
        if (diffMonths >= 0 && diffMonths < 6) {
          const idx = 5 - diffMonths;
          if (data[idx]) data[idx].value++;
        }
      });
    }

    return data;
  }, [orders, period]);

  const totalVolume = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [chartData]);

  const onTimeMetrics = useMemo(() => {
    const deliveredOrders = orders.filter((o) => o.status === "entregue");
    if (deliveredOrders.length === 0) return { rate: 0, total: 0, onTime: 0, hasData: false };

    let onTimeCount = 0;
    deliveredOrders.forEach((o) => {
      const history = o.statusHistory?.filter(h => h.status === "entregue") || [];
      const lastEntry = history[history.length - 1];
      const deliveredAt = lastEntry ? new Date(lastEntry.changedAt) : new Date(o.createdAt);
      const dDate = new Date(deliveredAt.getFullYear(), deliveredAt.getMonth(), deliveredAt.getDate());

      const eDateOriginal = new Date(o.expectedDate);
      const eDate = isNaN(eDateOriginal.getTime()) ? dDate : new Date(eDateOriginal.getFullYear(), eDateOriginal.getMonth(), eDateOriginal.getDate());

      if (dDate <= eDate) {
        onTimeCount++;
      }
    });

    return {
      rate: Math.round((onTimeCount / deliveredOrders.length) * 100),
      total: deliveredOrders.length,
      onTime: onTimeCount,
      hasData: true
    };
  }, [orders]);

  const getRateColor = (rate: number) => {
    if (!onTimeMetrics.hasData) return "var(--muted)";
    if (rate > 90) return "#22c55e"; // verde
    if (rate >= 70) return "#eab308"; // amarelo
    return "#ef4444"; // vermelho
  };

  const getRateBg = (rate: number) => {
    if (!onTimeMetrics.hasData) return "rgba(0,0,0,0.05)";
    if (rate > 90) return "rgba(34, 197, 94, 0.1)";
    if (rate >= 70) return "rgba(234, 179, 8, 0.1)";
    return "rgba(239, 68, 68, 0.1)";
  };

  const statusDistribution = useMemo(() => {
    const counts: Record<OrderStatus, number> = {
      "pendente": 0,
      "em distribuição": 0,
      "entregue": 0,
      "falhou": 0,
      "cancelada": 0
    };
    orders.forEach(o => {
      if (counts[o.status] !== undefined) {
        counts[o.status]++;
      }
    });

    return [
      { label: "Pendente", value: counts["pendente"], color: "var(--foreground-secondary)" },
      { label: "Em Distrib.", value: counts["em distribuição"], color: "var(--yale-light, #3b82f6)" },
      { label: "Entregue", value: counts["entregue"], color: "#22c55e" },
      { label: "Falhou", value: counts["falhou"], color: "#f97316" },
      { label: "Cancelada", value: counts["cancelada"], color: "#ef4444" },
    ];
  }, [orders]);

  const renderBarChart = () => {
    const maxVal = Math.max(...statusDistribution.map(d => d.value), 1);
    const chartHeight = 160;

    return (
      <div className="w-full flex items-end justify-around h-48 mt-4 border-b border-[var(--border)] pb-2 relative">
        {statusDistribution.map((d, i) => {
          const barHeight = (d.value / maxVal) * chartHeight;
          return (
            <div key={i} className="flex flex-col items-center group w-full px-2">
              <div className="relative flex flex-col justify-end w-full max-w-[60px] h-40 mb-1">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[var(--foreground)] text-[var(--background)] text-xs font-bold py-1 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-10 pointer-events-none drop-shadow-md">
                  {d.value}
                </div>

                <div
                  className="w-full rounded-t-lg transition-all ease-out group-hover:brightness-110"
                  style={{
                    height: mounted ? `${Math.max(barHeight, 4)}px` : '0px',
                    backgroundColor: d.color,
                    opacity: 0.9,
                    transitionDuration: '800ms',
                    transitionDelay: `${i * 50}ms`
                  }}
                />
              </div>
              <span className="text-xs md:text-sm font-medium text-muted truncate max-w-full absolute -bottom-6">
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const workloadData = useMemo(() => {
    const now = new Date();
    const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

    const activeOrders = orders.filter(o => {
      const d = new Date(o.createdAt);
      if (period === "day") {
        const diffDays = Math.floor((startOfDay(now).getTime() - startOfDay(d).getTime()) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays < 7;
      } else if (period === "week") {
        const diffDays = Math.floor((startOfDay(now).getTime() - startOfDay(d).getTime()) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays < 28;
      } else if (period === "month") {
        const diffMonths = (now.getFullYear() - d.getFullYear()) * 12 + now.getMonth() - d.getMonth();
        return diffMonths >= 0 && diffMonths < 6;
      }
      return false;
    });

    const counts: Record<string, number> = {};
    activeOrders.forEach(o => {
      if (o.courierId) {
        counts[o.courierId] = (counts[o.courierId] || 0) + 1;
      }
    });

    const totalAssigned = Object.values(counts).reduce((a, b) => a + b, 0);
    const numCouriers = couriers.length;
    const avg = numCouriers > 0 ? totalAssigned / numCouriers : 0;
    const overloadThreshold = Math.max(avg * 1.3, avg + 2); // 30% above average, or at least 2 more

    return couriers.map(c => {
      const count = counts[c.id] || 0;
      const isOverloaded = count > overloadThreshold && count > 0;
      return {
        id: c.id,
        label: c.name.split(" ")[0],
        fullName: c.name,
        value: count,
        isOverloaded,
        color: isOverloaded ? "#ef4444" : "var(--yale-light, #3b82f6)"
      };
    }).sort((a, b) => b.value - a.value);
  }, [orders, couriers, period]);

  const renderWorkloadChart = () => {
    if (workloadData.length === 0) return <div className="p-4 text-center text-sm text-muted mt-4">Nenhum estafeta registado.</div>;
    const maxVal = Math.max(...workloadData.map(d => d.value), 1);
    const chartHeight = 160;

    return (
      <div className="w-full flex flex-col mt-3 pt-4 border-t border-[var(--border)] gap-4 overflow-y-auto pr-2" style={{ maxHeight: '220px', scrollbarWidth: 'thin' }}>
        {workloadData.map((d, i) => {
          const barWidth = (d.value / maxVal) * 100;
          return (
            <div key={d.id} className="flex items-center group w-full">
              <div className="w-24 shrink-0 flex flex-col justify-center">
                <span className={`text-sm font-medium truncate w-full ${d.isOverloaded ? 'text-[#ef4444] font-bold' : 'text-[var(--foreground)]'}`} title={d.fullName}>
                  {d.label}
                </span>
                {d.isOverloaded && (
                  <span className="text-[9px] text-white bg-[#ef4444] px-1 rounded uppercase w-fit leading-none py-0.5 mt-0.5 tracking-wider">Alto</span>
                )}
              </div>
              <div className="flex-1 h-7 bg-[rgba(13,59,102,0.04)] rounded-r-lg ml-3 relative flex items-center">
                <div
                  className="h-full rounded-r-lg transition-all ease-out group-hover:brightness-110 flex items-center justify-end pr-3"
                  style={{
                    width: mounted ? `${Math.max(barWidth, 2)}%` : '0%',
                    backgroundColor: d.color,
                    opacity: 0.9,
                    transitionDuration: '800ms',
                    transitionDelay: `${i * 30}ms`
                  }}
                >
                  <span className="text-[11px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.value}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const deliveryTimeData = useMemo(() => {
    const addressMap = new Map(addresses.map(a => [a.id, a]));

    const now = new Date();
    const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

    const deliveredOrders = orders.filter(o => {
      if (o.status !== "entregue") return false;
      const d = new Date(o.createdAt);
      if (period === "day") {
        const diffDays = Math.floor((startOfDay(now).getTime() - startOfDay(d).getTime()) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays < 7;
      } else if (period === "week") {
        const diffDays = Math.floor((startOfDay(now).getTime() - startOfDay(d).getTime()) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays < 28;
      } else if (period === "month") {
        const diffMonths = (now.getFullYear() - d.getFullYear()) * 12 + now.getMonth() - d.getMonth();
        return diffMonths >= 0 && diffMonths < 6;
      }
      return false;
    });

    const zoneStats: Record<string, { totalMs: number; count: number }> = {};

    deliveredOrders.forEach(o => {
      const history = o.statusHistory || [];
      const entregueEntry = history.find(h => h.status === "entregue");
      if (!entregueEntry) return;

      const startEntry = history.find(h => h.status === "em distribuição");
      const startTime = startEntry ? new Date(startEntry.changedAt).getTime() : new Date(o.createdAt).getTime();
      const endTime = new Date(entregueEntry.changedAt).getTime();

      const durationMs = endTime - startTime;
      if (durationMs < 0) return;

      const address = addressMap.get(o.addressId);
      const zone = address?.zone || "Desconhecida";

      if (!zoneStats[zone]) {
        zoneStats[zone] = { totalMs: 0, count: 0 };
      }
      zoneStats[zone].totalMs += durationMs;
      zoneStats[zone].count += 1;
    });

    const formatDuration = (ms: number) => {
      const totalMins = Math.floor(ms / 60000);
      if (totalMins < 60) return `${totalMins} min`;
      const hours = Math.floor(totalMins / 60);
      const mins = totalMins % 60;
      return `${hours}h ${mins}m`;
    };

    return Object.entries(zoneStats).map(([zone, stats]) => {
      const avgMs = stats.totalMs / stats.count;
      return {
        zone,
        avgMs,
        avgFormatted: formatDuration(avgMs),
        count: stats.count
      };
    }).sort((a, b) => b.avgMs - a.avgMs);
  }, [orders, addresses, period]);

  const renderDeliveryTimes = () => {
    if (deliveryTimeData.length === 0) {
      return <div className="p-4 text-center text-sm text-muted mt-4">Sem dados de entrega suficientes para o período.</div>;
    }

    const maxMs = Math.max(...deliveryTimeData.map(d => d.avgMs));

    return (
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
        {deliveryTimeData.map((d, i) => {
          const widthPct = Math.max((d.avgMs / maxMs) * 100, 5);
          const isBottleneck = i === 0 && d.avgMs > 1000 * 60 * 60; // Highlights the worst one if it takes > 1 hour

          return (
            <div key={d.zone} className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-[var(--foreground)] flex items-center gap-2">
                  {d.zone}
                  {isBottleneck && <span className="text-[9px] text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Estrangulamento</span>}
                </span>
                <span className="text-muted font-mono">{d.avgFormatted} <span className="text-[10px] opacity-70">({d.count} enc.)</span></span>
              </div>
              <div className="w-full bg-[var(--border)] h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out`}
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: isBottleneck ? '#f97316' : 'var(--yale)',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const maintenanceVehicles = useMemo(() => {
    const now = new Date();
    return vehicles.filter(v => {
      // Já está em manutenção
      if (v.status === "em manutenção") return true;

      // Limite de quilómetros atingido
      if (v.currentMileage !== undefined && v.maintenanceMileageLimit !== undefined) {
        if (v.currentMileage >= v.maintenanceMileageLimit) return true;
      }

      // Data de manutenção atingida
      if (v.nextMaintenanceDate) {
        const maintDate = new Date(v.nextMaintenanceDate);
        if (maintDate <= now) return true;
      }

      return false;
    });
  }, [vehicles]);

  const renderMaintenanceWidget = () => {
    return (
      <div className="glass-card p-6 flex flex-col mt-6 border-l-4" style={{ borderRadius: '1.5rem', borderLeftColor: '#f97316' }}>
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-1 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              Alertas de Manutenção Preventiva
            </h2>
            <p className="text-sm text-muted">Veículos que requerem atenção (limite de km ou data atingidos).</p>
          </div>
          {maintenanceVehicles.length > 0 && (
            <span className="flex items-center gap-2 text-xs font-medium bg-orange-100 text-orange-600 px-3 py-1.5 rounded-full w-fit">
              {maintenanceVehicles.length} veículo(s) pendente(s)
            </span>
          )}
        </div>

        {maintenanceVehicles.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted bg-[var(--background)] rounded-xl border border-[var(--border)]">
            A frota está em dia. Nenhum veículo necessita de manutenção de momento.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table w-full text-sm text-left">
              <thead>
                <tr className="border-b border-[var(--border)] text-muted">
                  <th className="pb-2 font-medium">Matrícula</th>
                  <th className="pb-2 font-medium">Tipo</th>
                  <th className="pb-2 font-medium">Estado</th>
                  <th className="pb-2 font-medium">Motivo do Alerta</th>
                </tr>
              </thead>
              <tbody>
                {maintenanceVehicles.map(v => {
                  const kmAlert = v.currentMileage !== undefined && v.maintenanceMileageLimit !== undefined && v.currentMileage >= v.maintenanceMileageLimit;
                  const dateAlert = v.nextMaintenanceDate && new Date(v.nextMaintenanceDate) <= new Date();

                  let reason = "";
                  if (v.status === "em manutenção") reason = "Em manutenção ativa";
                  else if (kmAlert && dateAlert) reason = "Limite de KM e Data atingidos";
                  else if (kmAlert) reason = `Limite de KM atingido (${v.currentMileage} / ${v.maintenanceMileageLimit} km)`;
                  else if (dateAlert) reason = `Data limite atingida (${new Date(v.nextMaintenanceDate!).toLocaleDateString("pt-PT")})`;

                  return (
                    <tr key={v.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-3 font-mono font-medium text-[var(--yale)]">{v.plate}</td>
                      <td className="py-3 capitalize">{v.type}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 text-[10px] rounded uppercase font-bold tracking-wider ${v.status === 'em manutenção' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'}`}>
                          {v.status === "em manutenção" ? "Em Manutenção" : "Atenção Necessária"}
                        </span>
                      </td>
                      <td className="py-3 text-muted">{reason}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  const exportToCSV = () => {
    if (orders.length === 0) {
      alert("Não há dados para exportar.");
      return;
    }

    const headers = ["ID Encomenda", "Estado", "Data Criação", "Data Prevista", "Cliente ID", "Estafeta ID"];
    const rows = orders.map(o => [
      o.id,
      o.status,
      new Date(o.createdAt).toLocaleDateString("pt-PT"),
      new Date(o.expectedDate).toLocaleDateString("pt-PT"),
      o.customerId,
      o.courierId || ""
    ]);

    const csvContent = [
      headers.map(h => `"${h}"`).join(";"),
      ...rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(";"))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio_entregas_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Max value for scaling the SVG
  const maxVal = Math.max(...chartData.map(d => d.value), 1); // at least 1 to avoid div by zero

  const renderLine = () => {
    if (chartData.length === 0) return null;
    const width = 800;
    const height = 200;

    const stepX = width / Math.max(chartData.length - 1, 1);

    const points = chartData.map((d, i) => {
      const x = i * stepX;
      // top margin for text, bottom margin for line
      const topMargin = 20;
      const bottomMargin = 10;
      const usableHeight = height - topMargin - bottomMargin;
      const y = height - bottomMargin - (d.value / maxVal) * usableHeight;
      return { x, y, value: d.value };
    });

    const dPath = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;
    const areaPath = `${dPath} L ${width},${height} L 0,${height} Z`;

    return (
      <svg viewBox="0 0 800 200" className="w-full h-auto overflow-visible mt-2">
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--yale)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--yale)" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--yale)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="var(--yale)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={areaPath}
          fill="url(#areaGrad)"
        />
        <path
          d={dPath}
          fill="none"
          stroke="url(#lineGrad)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-draw-line"
          style={{
            strokeDasharray: '1000',
            strokeDashoffset: '0',
            animation: 'draw 1.5s ease-out forwards'
          }}
        />
        {points.map((p, i) => (
          <g key={i} className="group cursor-default">
            <circle
              cx={p.x}
              cy={p.y}
              r="6"
              fill="#FAF0CA"
              stroke="var(--yale)"
              strokeWidth="3"
              className="transition-all duration-300 group-hover:r-8"
            />
            <text
              x={p.x}
              y={p.y - 14}
              textAnchor="middle"
              fontSize="12"
              fill="var(--yale)"
              fontWeight="bold"
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              {p.value}
            </text>
          </g>
        ))}
      </svg>
    );
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--yale)]">Painel de Gestor</h1>
          <p className="text-muted mt-1">Acompanhe o volume operacional e a qualidade de serviço da plataforma.</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <button onClick={exportToCSV} className="btn btn-secondary text-sm px-4 py-2 flex items-center gap-2 bg-white shadow-sm border border-[var(--border)] rounded-lg hover:bg-gray-50 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Exportar CSV
          </button>
          <button onClick={() => window.print()} className="btn btn-secondary text-sm px-4 py-2 flex items-center gap-2 bg-white shadow-sm border border-[var(--border)] rounded-lg hover:bg-gray-50 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            Exportar PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">
        {/* Gráfico de Volume - Coluna Dupla */}
        <div className="lg:col-span-2 glass-card p-6 flex flex-col" style={{ borderRadius: '1.5rem' }}>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <h2 className="text-lg font-semibold text-[var(--foreground)] mb-1">Volume de Entregas</h2>
              <p className="text-sm text-muted">Total de encomendas registadas no período selecionado.</p>
            </div>

            <div className="flex bg-[var(--background)] rounded-full p-1 border border-[var(--border)] shadow-sm">
              {(["day", "week", "month"] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-medium transition-colors ${period === p
                    ? 'bg-[var(--yale)] text-[#FAF0CA] shadow-md'
                    : 'text-muted hover:text-[var(--foreground)]'
                    }`}
                >
                  {p === "day" ? "5 Dias" : p === "week" ? "4 Semanas" : "6 Meses"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8 flex-1">
            {/* Cartão Numérico */}
            <div className="flex-shrink-0 w-full md:w-48 aspect-square rounded-2xl bg-gradient-to-br from-[#FAF0CA] to-[#F2E5B5] shadow-inner flex flex-col items-center justify-center border border-[rgba(255,255,255,0.4)]">
              <span className="text-sm font-semibold text-[var(--yale)] uppercase tracking-wider opacity-80 mb-2">Total</span>
              <span className="text-6xl font-bold text-[var(--yale)] tracking-tighter" style={{ textShadow: '0 2px 10px rgba(13, 59, 102, 0.1)' }}>
                {totalVolume}
              </span>
              <span className="text-xs text-[var(--yale)] font-medium mt-2 opacity-70">
                {period === "day" ? "entregas nesta semana" : period === "week" ? "entregas no mês" : "entregas no semestre"}
              </span>
            </div>

            {/* Linha de Tendência */}
            <div className="flex-1 w-full flex flex-col justify-end">
              <div className="relative w-full">
                {renderLine()}
                {/* X-axis labels */}
                <div className="flex justify-between mt-4 text-xs font-medium text-muted px-1">
                  {chartData.map((d, i) => (
                    <span key={i} className={i === 0 ? "text-left" : i === chartData.length - 1 ? "text-right" : "text-center"}>
                      {d.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Taxa no Prazo - Coluna Simples */}
        <div className="glass-card p-6 flex flex-col items-center text-center relative overflow-hidden" style={{ borderRadius: '1.5rem' }}>
          <div className="w-full text-left mb-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-1">Taxa no Prazo</h2>
            <p className="text-sm text-muted">Percentagem de encomendas entregues na data prevista.</p>
          </div>

          <div className="relative flex items-center justify-center flex-1 w-full my-4">
            <svg viewBox="0 0 100 100" className="w-48 h-48 drop-shadow-md">
              <circle
                cx="50" cy="50" r="40"
                fill="none"
                stroke={getRateBg(onTimeMetrics.rate)}
                strokeWidth="12"
              />
              <circle
                cx="50" cy="50" r="40"
                fill="none"
                stroke={getRateColor(onTimeMetrics.rate)}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray="251.2"
                strokeDashoffset={onTimeMetrics.hasData ? 251.2 - (251.2 * onTimeMetrics.rate) / 100 : 251.2}
                className="transition-all duration-1000 ease-out"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold tracking-tighter" style={{ color: getRateColor(onTimeMetrics.rate) }}>
                {onTimeMetrics.hasData ? `${onTimeMetrics.rate}%` : "-"}
              </span>
            </div>
          </div>

          <div className="w-full flex justify-between items-center text-sm mt-auto pt-4 border-t border-[var(--border)]">
            <span className="text-muted">No prazo</span>
            <span className="font-semibold">{onTimeMetrics.onTime} de {onTimeMetrics.total}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 print:hidden">
        {/* Estado das Encomendas */}
        <div className="glass-card p-6 flex flex-col" style={{ borderRadius: '1.5rem' }}>
          <div className="mb-2">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-1">Distribuição por Estado</h2>
            <p className="text-sm text-muted">Visão global de encomendas.</p>
          </div>
          {renderBarChart()}
        </div>

        {/* Carga de Trabalho */}
        <div className="glass-card p-6 flex flex-col" style={{ borderRadius: '1.5rem' }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-[var(--foreground)] mb-1">Carga de Trabalho</h2>
              <p className="text-sm text-muted">Atribuições no período selecionado.</p>
            </div>
            <span className="flex items-center gap-2 text-xs font-medium bg-red-100 text-red-600 px-2 py-1 rounded w-fit">
              <span className="w-2 h-2 rounded-full bg-[#ef4444]"></span>
              Sobrecarregado
            </span>
          </div>
          {renderWorkloadChart()}
        </div>
      </div>

      {/* Tempo Médio de Entrega */}
      <div className="glass-card p-6 flex flex-col mt-6" style={{ borderRadius: '1.5rem' }}>
        <div className="mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-1">Tempo Médio de Entrega por Zona</h2>
            <p className="text-sm text-muted">Acompanhe a duração média desde a expedição até ao cliente e identifique estrangulamentos geográficos.</p>
          </div>
          <span className="flex items-center gap-2 text-xs font-medium bg-orange-100 text-orange-600 px-3 py-1.5 rounded-full w-fit whitespace-nowrap">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            Horas Operacionais
          </span>
        </div>
        {renderDeliveryTimes()}
      </div>

      {/* Alertas de Manutenção */}
      {renderMaintenanceWidget()}

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes draw {
          from { stroke-dashoffset: 300; }
          to { stroke-dashoffset: 0; }
        }
      `}} />
      {/* Relatório de Impressão (Apenas visível em PDF) */}
      <div className="hidden print:block mt-8 w-full">
        <h2 className="text-2xl font-bold mb-4 border-b-2 border-black pb-2">Relatório Global de Entregas</h2>
        <div className="mb-4 flex gap-8 text-sm">
          <p><strong>Total de Registos:</strong> {orders.length}</p>
          <p><strong>Taxa no Prazo Global:</strong> {onTimeMetrics.rate}%</p>
          <p><strong>Data de Extração:</strong> {new Date().toLocaleDateString("pt-PT")}</p>
        </div>
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-gray-400 bg-gray-100">
              <th className="py-2 px-2 font-semibold">ID</th>
              <th className="py-2 px-2 font-semibold">Estado</th>
              <th className="py-2 px-2 font-semibold">Data Criação</th>
              <th className="py-2 px-2 font-semibold">Data Prevista</th>
              <th className="py-2 px-2 font-semibold">Cliente ID</th>
              <th className="py-2 px-2 font-semibold">Estafeta ID</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} className="border-b border-gray-200">
                <td className="py-1 px-2 font-mono">{o.id.substring(0, 8)}</td>
                <td className="py-1 px-2">{o.status}</td>
                <td className="py-1 px-2">{new Date(o.createdAt).toLocaleDateString("pt-PT")}</td>
                <td className="py-1 px-2">{new Date(o.expectedDate).toLocaleDateString("pt-PT")}</td>
                <td className="py-1 px-2">{o.customerId}</td>
                <td className="py-1 px-2">{o.courierId || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
