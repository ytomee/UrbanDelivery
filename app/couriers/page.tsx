"use client";

import { useCallback, useEffect, useState } from "react";
import { Courier } from "../types/courier";
import { getCouriers, deleteCourier } from "../lib/couriers";
import CourierForm from "./courier-form";

export default function CouriersPage() {
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(() => {
    setCouriers(getCouriers());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function handleDelete(id: string) {
    if (confirm("Tem a certeza que deseja eliminar este estafeta?")) {
      deleteCourier(id);
      load();
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1>Estafetas</h1>
          <p>Registo e gestão da frota de estafetas</p>
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
            Novo Estafeta
          </button>
        )}
      </div>

      {showForm && (
        <div className="glass-card form-section mb-8">
          <h2>Registar Novo Estafeta</h2>
          <CourierForm
            onSaved={() => {
              setShowForm(false);
              load();
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {couriers.length === 0 ? (
        <div className="glass-card empty-state">
          <div className="empty-state-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 21v-2a4 4 0 00-8 0v2M12 11a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-base font-medium" style={{ color: 'var(--foreground-secondary)' }}>
            Nenhum estafeta registado
          </p>
          <p className="text-sm mt-1.5">
            Clique em &quot;Novo Estafeta&quot; para começar
          </p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Identificação</th>
                  <th>Contacto</th>
                  <th>Veículo</th>
                  <th>Zona Preferida</th>
                  <th style={{ width: 80 }}></th>
                </tr>
              </thead>
              <tbody>
                {couriers.map((c) => (
                  <tr key={c.id}>
                    <td className="font-medium" style={{ color: 'var(--yale)' }}>
                      {c.name}
                    </td>
                    <td className="font-mono" style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>
                      {c.identification}
                    </td>
                    <td style={{ color: 'var(--foreground-secondary)' }}>{c.contact}</td>
                    <td>
                      <span className="badge badge-default">
                        {c.vehicle}
                      </span>
                    </td>
                    <td style={{ color: 'var(--foreground-secondary)' }}>{c.preferredZone}</td>
                    <td>
                      <button
                        onClick={() => handleDelete(c.id)}
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
