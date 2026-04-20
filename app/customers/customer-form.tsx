"use client";

import { useState } from "react";
import { CustomerType } from "../types/customer";
import { saveCustomer } from "../lib/customers";

interface CustomerFormProps {
  onSaved: () => void;
  onCancel: () => void;
}

export default function CustomerForm({ onSaved, onCancel }: CustomerFormProps) {
  const [name, setName] = useState("");
  const [nif, setNif] = useState("");
  const [type, setType] = useState<CustomerType>("particular");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Nome é obrigatório";
    if (!nif.trim()) newErrors.nif = "NIF é obrigatório";
    else if (!/^\d{9}$/.test(nif.trim())) newErrors.nif = "NIF deve ter 9 dígitos";
    if (!email.trim()) newErrors.email = "Email é obrigatório";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      newErrors.email = "Email inválido";
    if (!phone.trim()) newErrors.phone = "Telefone é obrigatório";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    saveCustomer({
      name: name.trim(),
      nif: nif.trim(),
      type,
      email: email.trim(),
      phone: phone.trim(),
    });
    onSaved();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground-secondary)' }}>
            Nome <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <input
            className="input-field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome completo"
          />
          {errors.name && (
            <p className="text-xs mt-1.5" style={{ color: 'var(--danger)' }}>{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground-secondary)' }}>
            NIF <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <input
            className="input-field"
            value={nif}
            onChange={(e) => setNif(e.target.value)}
            placeholder="123456789"
            maxLength={9}
          />
          {errors.nif && (
            <p className="text-xs mt-1.5" style={{ color: 'var(--danger)' }}>{errors.nif}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground-secondary)' }}>
            Tipo <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <select
            className="input-field"
            value={type}
            onChange={(e) => setType(e.target.value as CustomerType)}
          >
            <option value="particular">Particular</option>
            <option value="empresa">Empresa</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground-secondary)' }}>
            Email <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <input
            className="input-field"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@exemplo.pt"
          />
          {errors.email && (
            <p className="text-xs mt-1.5" style={{ color: 'var(--danger)' }}>{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground-secondary)' }}>
            Telefone <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <input
            className="input-field"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="912345678"
          />
          {errors.phone && (
            <p className="text-xs mt-1.5" style={{ color: 'var(--danger)' }}>{errors.phone}</p>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-3">
        <button type="submit" className="btn btn-primary">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.5 4L5.5 10L2.5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Guardar
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
