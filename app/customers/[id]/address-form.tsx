"use client";

import { useState } from "react";
import { Address } from "../../types/address";

interface AddressFormProps {
  initial?: Address;
  onSubmit: (data: {
    street: string;
    city: string;
    postalCode: string;
    zone: string;
    isDefault: boolean;
  }) => void;
  onCancel: () => void;
}

export default function AddressForm({
  initial,
  onSubmit,
  onCancel,
}: AddressFormProps) {
  const [street, setStreet] = useState(initial?.street ?? "");
  const [city, setCity] = useState(initial?.city ?? "");
  const [postalCode, setPostalCode] = useState(initial?.postalCode ?? "");
  const [zone, setZone] = useState(initial?.zone ?? "");
  const [isDefault, setIsDefault] = useState(initial?.isDefault ?? false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!street.trim()) newErrors.street = "Rua é obrigatória";
    if (!city.trim()) newErrors.city = "Cidade é obrigatória";
    if (!postalCode.trim()) newErrors.postalCode = "Código postal é obrigatório";
    else if (!/^\d{4}-\d{3}$/.test(postalCode.trim()))
      newErrors.postalCode = "Formato: 1234-567";
    if (!zone.trim()) newErrors.zone = "Zona é obrigatória";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      street: street.trim(),
      city: city.trim(),
      postalCode: postalCode.trim(),
      zone: zone.trim(),
      isDefault,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground-secondary)' }}>
            Rua <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <input
            className="input-field"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            placeholder="Rua e número"
          />
          {errors.street && (
            <p className="text-xs mt-1.5" style={{ color: 'var(--danger)' }}>{errors.street}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground-secondary)' }}>
            Cidade <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <input
            className="input-field"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Lisboa"
          />
          {errors.city && (
            <p className="text-xs mt-1.5" style={{ color: 'var(--danger)' }}>{errors.city}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground-secondary)' }}>
            Código Postal <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <input
            className="input-field"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            placeholder="1234-567"
            maxLength={8}
          />
          {errors.postalCode && (
            <p className="text-xs mt-1.5" style={{ color: 'var(--danger)' }}>{errors.postalCode}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground-secondary)' }}>
            Zona <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <input
            className="input-field"
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            placeholder="Centro"
          />
          {errors.zone && (
            <p className="text-xs mt-1.5" style={{ color: 'var(--danger)' }}>{errors.zone}</p>
          )}
        </div>

        <div className="flex items-center gap-2.5 self-end h-[42px]">
          <input
            type="checkbox"
            id="isDefault"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
          />
          <label
            htmlFor="isDefault"
            className="text-sm cursor-pointer select-none"
            style={{ color: 'var(--foreground-secondary)' }}
          >
            Morada predefinida
          </label>
        </div>
      </div>

      <div className="flex gap-3 pt-3">
        <button type="submit" className="btn btn-primary">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.5 4L5.5 10L2.5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {initial ? "Atualizar" : "Adicionar"}
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
