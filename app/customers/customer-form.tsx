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

  const inputClass =
    "w-full h-10 rounded-md border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary";
  const labelClass = "block text-sm font-medium mb-1.5";
  const errorClass = "text-xs text-danger mt-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Nome *</label>
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome completo"
          />
          {errors.name && <p className={errorClass}>{errors.name}</p>}
        </div>

        <div>
          <label className={labelClass}>NIF *</label>
          <input
            className={inputClass}
            value={nif}
            onChange={(e) => setNif(e.target.value)}
            placeholder="123456789"
            maxLength={9}
          />
          {errors.nif && <p className={errorClass}>{errors.nif}</p>}
        </div>

        <div>
          <label className={labelClass}>Tipo *</label>
          <select
            className={inputClass}
            value={type}
            onChange={(e) => setType(e.target.value as CustomerType)}
          >
            <option value="particular">Particular</option>
            <option value="empresa">Empresa</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Email *</label>
          <input
            className={inputClass}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@exemplo.pt"
          />
          {errors.email && <p className={errorClass}>{errors.email}</p>}
        </div>

        <div>
          <label className={labelClass}>Telefone *</label>
          <input
            className={inputClass}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="912345678"
          />
          {errors.phone && <p className={errorClass}>{errors.phone}</p>}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="h-10 rounded-md bg-primary px-5 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
        >
          Guardar
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="h-10 rounded-md border border-border px-5 text-sm font-medium text-muted hover:text-foreground transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
