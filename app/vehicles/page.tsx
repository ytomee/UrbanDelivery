"use client";

import { useCallback, useEffect, useState } from "react";
import { Vehicle } from "../types/vehicle";
import { getVehicles, deleteVehicle, updateVehicleStatus } from "../lib/vehicles";
import VehicleForm from "./vehicle-form";

const typeLabels: Record<string, string> = {
  motorizada: "Motorizada",
  carrinha: "Carrinha",
  bicicleta: "Bicicleta",
};

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(() => {
    setVehicles(getVehicles());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function handleDelete(id: string) {
    if (confirm("Tem a certeza que deseja eliminar este veículo?")) {
      deleteVehicle(id);
      load();
    }
  }

  function handleToggleStatus(vehicle: Vehicle) {
    const newStatus = vehicle.status === "ativo" ? "em manutenção" : "ativo";
    updateVehicleStatus(vehicle.id, newStatus);
    load();
  }

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1>Veículos</h1>
          <p>Registo e gestão da frota de veículos</p>
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
            Novo Veículo
          </button>
        )}
      </div>

      {showForm && (
        <div className="glass-card form-section mb-8">
          <h2>Registar Novo Veículo</h2>
          <VehicleForm
            onSaved={() => {
              setShowForm(false);
              load();
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {vehicles.length === 0 ? (
        <div className="glass-card empty-state">
          <div className="empty-state-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 17h14M7 17V9l3-4h4l3 4v8M9 17v-4h6v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-base font-medium" style={{ color: 'var(--foreground-secondary)' }}>
            Nenhum veículo registado
          </p>
          <p className="text-sm mt-1.5">
            Clique em &quot;Novo Veículo&quot; para começar
          </p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Matrícula</th>
                  <th>Tipo</th>
                  <th>Capacidade</th>
                  <th>Estado</th>
                  <th style={{ width: 160 }}></th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr key={v.id}>
                    <td className="font-mono font-medium" style={{ color: 'var(--yale)' }}>
                      {v.plate}
                    </td>
                    <td>
                      <span className="badge badge-default">
                        {typeLabels[v.type] || v.type}
                      </span>
                    </td>
                    <td style={{ color: 'var(--foreground-secondary)' }}>
                      {v.capacity} kg
                    </td>
                    <td>
                      <span className={`badge ${v.status === "ativo" ? "badge-ativo" : "badge-manutencao"}`}>
                        {v.status === "ativo" ? "Ativo" : "Em Manutenção"}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleStatus(v)}
                          className="btn-ghost"
                          style={{ fontSize: '0.75rem' }}
                        >
                          {v.status === "ativo" ? "Manutenção" : "Ativar"}
                        </button>
                        <button
                          onClick={() => handleDelete(v.id)}
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
