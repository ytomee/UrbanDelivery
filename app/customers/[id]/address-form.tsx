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

  const inputClass =
    "w-full h-10 rounded-md border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary";
  const labelClass = "block text-sm font-medium mb-1.5";
  const errorClass = "text-xs text-danger mt-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="sm:col-span-2">
          <label className={labelClass}>Rua *</label>
          <input
            className={inputClass}
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            placeholder="Rua e número"
          />
          {errors.street && <p className={errorClass}>{errors.street}</p>}
        </div>

        <div>
          <label className={labelClass}>Cidade *</label>
          <input
            className={inputClass}
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Lisboa"
          />
          {errors.city && <p className={errorClass}>{errors.city}</p>}
        </div>

        <div>
          <label className={labelClass}>Código Postal *</label>
          <input
            className={inputClass}
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            placeholder="1234-567"
            maxLength={8}
          />
          {errors.postalCode && (
            <p className={errorClass}>{errors.postalCode}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>Zona *</label>
          <input
            className={inputClass}
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            placeholder="Centro"
          />
          {errors.zone && <p className={errorClass}>{errors.zone}</p>}
        </div>

        <div className="flex items-center gap-2 self-end h-10">
          <input
            type="checkbox"
            id="isDefault"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
          />
          <label htmlFor="isDefault" className="text-sm">
            Morada predefinida
          </label>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="h-10 rounded-md bg-primary px-5 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
        >
          {initial ? "Atualizar" : "Adicionar"}
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
