"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Customer } from "../../types/customer";
import { Address } from "../../types/address";
import { getCustomers } from "../../lib/customers";
import {
  addAddress,
  deleteAddress,
  getAddressesByCustomer,
  setDefaultAddress,
  updateAddress,
} from "../../lib/addresses";
import AddressForm from "./address-form";

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const load = useCallback(() => {
    const found = getCustomers().find((c) => c.id === id);
    setCustomer(found ?? null);
    if (found) {
      setAddresses(getAddressesByCustomer(found.id));
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

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
      <div className="text-center py-16 text-muted">
        <p className="text-lg">Cliente não encontrado</p>
        <Link href="/customers" className="text-primary text-sm mt-2 inline-block">
          Voltar à lista
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/customers"
        className="text-sm text-muted hover:text-foreground transition-colors"
      >
        &larr; Voltar à lista
      </Link>

      <div className="mt-4 mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            {customer.name}
          </h1>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              customer.type === "empresa"
                ? "bg-blue-50 text-blue-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {customer.type === "empresa" ? "Empresa" : "Particular"}
          </span>
        </div>
        <p className="text-muted text-sm mt-1">
          NIF {customer.nif} &middot; {customer.email} &middot; {customer.phone}
        </p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium">Moradas de Entrega</h2>
        {!showForm && !editingAddress && (
          <button
            onClick={() => setShowForm(true)}
            className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
          >
            Nova Morada
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-6 rounded-lg border border-border p-6">
          <h3 className="text-sm font-medium mb-4">Adicionar Morada</h3>
          <AddressForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {editingAddress && (
        <div className="mb-6 rounded-lg border border-border p-6">
          <h3 className="text-sm font-medium mb-4">Editar Morada</h3>
          <AddressForm
            initial={editingAddress}
            onSubmit={handleUpdate}
            onCancel={() => setEditingAddress(null)}
          />
        </div>
      )}

      {addresses.length === 0 ? (
        <div className="text-center py-12 text-muted rounded-lg border border-border">
          <p>Nenhuma morada registada</p>
          <p className="text-sm mt-1">
            Clique em &quot;Nova Morada&quot; para adicionar
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((a) => (
            <div
              key={a.id}
              className={`rounded-lg border p-4 flex items-start justify-between gap-4 ${
                a.isDefault ? "border-primary bg-blue-50/30" : "border-border"
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{a.street}</p>
                  {a.isDefault && (
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      Predefinida
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted mt-0.5">
                  {a.postalCode} {a.city} &middot; Zona: {a.zone}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {!a.isDefault && (
                  <button
                    onClick={() => handleSetDefault(a.id)}
                    className="text-xs text-muted hover:text-primary transition-colors"
                  >
                    Predefinir
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingAddress(a);
                  }}
                  className="text-xs text-muted hover:text-foreground transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(a.id)}
                  className="text-xs text-muted hover:text-danger transition-colors"
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
