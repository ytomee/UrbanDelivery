"use client";

import { useCallback, useEffect, useState } from "react";
import { Customer } from "../types/customer";
import Link from "next/link";
import { deleteCustomer, getCustomers } from "../lib/customers";
import CustomerForm from "./customer-form";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(() => {
    setCustomers(getCustomers());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function handleDelete(id: string) {
    deleteCustomer(id);
    load();
  }

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1>Clientes</h1>
          <p>Registe e consulte clientes particulares e empresas</p>
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
            Novo Cliente
          </button>
        )}
      </div>

      {/* New customer form */}
      {showForm && (
        <div className="glass-card form-section mb-8">
          <h2>Registar Cliente</h2>
          <CustomerForm
            onSaved={() => {
              setShowForm(false);
              load();
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Customer list */}
      {customers.length === 0 ? (
        <div className="glass-card empty-state">
          <div className="empty-state-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="text-base font-medium" style={{ color: 'var(--foreground-secondary)' }}>
            Nenhum cliente registado
          </p>
          <p className="text-sm mt-1.5">
            Clique em &quot;Novo Cliente&quot; para começar
          </p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>NIF</th>
                  <th>Tipo</th>
                  <th>Email</th>
                  <th>Telefone</th>
                  <th style={{ width: 80 }}></th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td className="font-medium">
                      <Link
                        href={`/customers/${c.id}`}
                        className="transition-base"
                        style={{ color: 'var(--yale)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--yale-light)')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--yale)')}
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="font-mono" style={{ color: 'var(--muted)', fontSize: '0.8125rem' }}>
                      {c.nif}
                    </td>
                    <td>
                      <span className={`badge ${c.type === "empresa" ? "badge-empresa" : "badge-particular"}`}>
                        {c.type === "empresa" ? "Empresa" : "Particular"}
                      </span>
                    </td>
                    <td style={{ color: 'var(--foreground-secondary)' }}>{c.email}</td>
                    <td style={{ color: 'var(--foreground-secondary)' }}>{c.phone}</td>
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
