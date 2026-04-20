"use client";

import { useState } from "react";
import { saveVehicle } from "../lib/vehicles";
import { VehicleType, VehicleStatus } from "../types/vehicle";

interface VehicleFormProps {
  onSaved: () => void;
  onCancel: () => void;
}

export default function VehicleForm({ onSaved, onCancel }: VehicleFormProps) {
  const [plate, setPlate] = useState("");
  const [type, setType] = useState<VehicleType | "">("");
  const [capacity, setCapacity] = useState("");
  const [status, setStatus] = useState<VehicleStatus>("ativo");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!plate.trim()) newErrors.plate = "Matrícula é obrigatória";
    else if (!/^[A-Z0-9]{2}-[A-Z0-9]{2}-[A-Z0-9]{2}$/i.test(plate.trim()))
      newErrors.plate = "Formato inválido (ex: AA-00-BB)";
    if (!type) newErrors.type = "Tipo é obrigatório";
    if (!capacity.trim()) newErrors.capacity = "Capacidade é obrigatória";
    else if (isNaN(Number(capacity)) || Number(capacity) <= 0)
      newErrors.capacity = "Capacidade deve ser um número positivo";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    saveVehicle({
      plate: plate.trim().toUpperCase(),
      type: type as VehicleType,
      capacity: Number(capacity),
      status,
    });
    onSaved();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground-secondary)' }}>
            Matrícula <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <input
            className="input-field"
            value={plate}
            onChange={(e) => setPlate(e.target.value)}
            placeholder="AA-00-BB"
          />
          {errors.plate && (
            <p className="text-xs mt-1.5" style={{ color: 'var(--danger)' }}>{errors.plate}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground-secondary)' }}>
            Tipo <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <select
            className="input-field"
            value={type}
            onChange={(e) => setType(e.target.value as VehicleType)}
          >
            <option value="">Selecione o tipo</option>
            <option value="motorizada">Motorizada</option>
            <option value="carrinha">Carrinha</option>
            <option value="bicicleta">Bicicleta</option>
          </select>
          {errors.type && (
            <p className="text-xs mt-1.5" style={{ color: 'var(--danger)' }}>{errors.type}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground-secondary)' }}>
            Capacidade (kg) <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <input
            className="input-field"
            type="number"
            min="1"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            placeholder="Ex: 50"
          />
          {errors.capacity && (
            <p className="text-xs mt-1.5" style={{ color: 'var(--danger)' }}>{errors.capacity}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground-secondary)' }}>
            Estado
          </label>
          <select
            className="input-field"
            value={status}
            onChange={(e) => setStatus(e.target.value as VehicleStatus)}
          >
            <option value="ativo">Ativo</option>
            <option value="em manutenção">Em Manutenção</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3 pt-3">
        <button type="submit" className="btn btn-primary">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.5 4L5.5 10L2.5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Registar Veículo
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
