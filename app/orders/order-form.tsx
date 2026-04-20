"use client";

import { useEffect, useState } from "react";
import { Customer } from "../types/customer";
import { Address } from "../types/address";
import { getCustomers } from "../lib/customers";
import { getAddressesByCustomer } from "../lib/addresses";
import { saveOrder } from "../lib/orders";

interface OrderFormProps {
  onSaved: () => void;
  onCancel: () => void;
}

export default function OrderForm({ onSaved, onCancel }: OrderFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);

  const [customerId, setCustomerId] = useState("");
  const [addressId, setAddressId] = useState("");
  const [articles, setArticles] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setCustomers(getCustomers());
  }, []);

  useEffect(() => {
    if (customerId) {
      setAddresses(getAddressesByCustomer(customerId));
      setAddressId("");
    } else {
      setAddresses([]);
    }
  }, [customerId]);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!customerId) newErrors.customerId = "Cliente é obrigatório";
    if (!addressId) newErrors.addressId = "Morada é obrigatória";
    if (!articles.trim()) newErrors.articles = "Artigos são obrigatórios";
    if (!expectedDate) newErrors.expectedDate = "Data é obrigatória";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    saveOrder({
      customerId,
      addressId,
      articles: articles.trim(),
      expectedDate,
    });
    onSaved();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground-secondary)' }}>
            Cliente <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <select
            className="input-field"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
          >
            <option value="">Selecione um cliente</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.nif})
              </option>
            ))}
          </select>
          {errors.customerId && (
            <p className="text-xs mt-1.5" style={{ color: 'var(--danger)' }}>{errors.customerId}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground-secondary)' }}>
            Morada de Entrega <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <select
            className="input-field"
            value={addressId}
            onChange={(e) => setAddressId(e.target.value)}
            disabled={!customerId}
          >
            <option value="">
              {customerId ? "Selecione uma morada" : "Selecione primeiro o cliente"}
            </option>
            {addresses.map((a) => (
              <option key={a.id} value={a.id}>
                {a.street}, {a.city}
              </option>
            ))}
          </select>
          {errors.addressId && (
            <p className="text-xs mt-1.5" style={{ color: 'var(--danger)' }}>{errors.addressId}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground-secondary)' }}>
            Artigos (separados por vírgula) <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <input
            className="input-field"
            value={articles}
            onChange={(e) => setArticles(e.target.value)}
            placeholder="Ex: Documentos, Caixa (10kg)"
          />
          {errors.articles && (
            <p className="text-xs mt-1.5" style={{ color: 'var(--danger)' }}>{errors.articles}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground-secondary)' }}>
            Data Prevista <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <input
            type="date"
            className="input-field"
            value={expectedDate}
            onChange={(e) => setExpectedDate(e.target.value)}
          />
          {errors.expectedDate && (
            <p className="text-xs mt-1.5" style={{ color: 'var(--danger)' }}>{errors.expectedDate}</p>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-3">
        <button type="submit" className="btn btn-primary">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.5 4L5.5 10L2.5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Criar Encomenda
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
