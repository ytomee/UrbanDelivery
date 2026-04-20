"use client";

import { useCallback, useEffect, useState } from "react";
import { Customer } from "../types/customer";
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
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clientes</h1>
          <p className="text-muted text-sm mt-1">
            Registe e consulte clientes particulares e empresas
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="h-10 rounded-md bg-primary px-5 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
          >
            Novo Cliente
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-8 rounded-lg border border-border p-6">
          <h2 className="text-lg font-medium mb-4">Registar Cliente</h2>
          <CustomerForm
            onSaved={() => {
              setShowForm(false);
              load();
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {customers.length === 0 ? (
        <div className="text-center py-16 text-muted">
          <p className="text-lg">Nenhum cliente registado</p>
          <p className="text-sm mt-1">
            Clique em &quot;Novo Cliente&quot; para começar
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-gray-50 text-left">
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">NIF</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Telefone</th>
                <th className="px-4 py-3 font-medium w-20"></th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-border last:border-0 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 font-mono text-muted">{c.nif}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        c.type === "empresa"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {c.type === "empresa" ? "Empresa" : "Particular"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">{c.email}</td>
                  <td className="px-4 py-3 text-muted">{c.phone}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-xs text-muted hover:text-danger transition-colors"
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
