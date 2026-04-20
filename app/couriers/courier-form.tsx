"use client";

import { useState } from "react";
import { saveCourier } from "../lib/couriers";

interface CourierFormProps {
  onSaved: () => void;
  onCancel: () => void;
}

export default function CourierForm({ onSaved, onCancel }: CourierFormProps) {
  const [name, setName] = useState("");
  const [identification, setIdentification] = useState("");
  const [contact, setContact] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [preferredZone, setPreferredZone] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Nome é obrigatório";
    if (!identification.trim()) newErrors.identification = "Identificação é obrigatória";
    if (!contact.trim()) newErrors.contact = "Contacto é obrigatório";
    if (!vehicle.trim()) newErrors.vehicle = "Veículo é obrigatório";
    if (!preferredZone.trim()) newErrors.preferredZone = "Zona preferida é obrigatória";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    saveCourier({
      name: name.trim(),
      identification: identification.trim(),
      contact: contact.trim(),
      vehicle: vehicle.trim(),
      preferredZone: preferredZone.trim(),
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
            Identificação <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <input
            className="input-field"
            value={identification}
            onChange={(e) => setIdentification(e.target.value)}
            placeholder="Ex: NIF, CC ou Passaporte"
          />
          {errors.identification && (
            <p className="text-xs mt-1.5" style={{ color: 'var(--danger)' }}>{errors.identification}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground-secondary)' }}>
            Contacto <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <input
            className="input-field"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="912 345 678"
          />
          {errors.contact && (
            <p className="text-xs mt-1.5" style={{ color: 'var(--danger)' }}>{errors.contact}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground-secondary)' }}>
            Veículo Atribuído <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <input
            className="input-field"
            value={vehicle}
            onChange={(e) => setVehicle(e.target.value)}
            placeholder="Ex: Mota, Ligeiro, Bicicleta"
          />
          {errors.vehicle && (
            <p className="text-xs mt-1.5" style={{ color: 'var(--danger)' }}>{errors.vehicle}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground-secondary)' }}>
            Zona Preferida <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <input
            className="input-field"
            value={preferredZone}
            onChange={(e) => setPreferredZone(e.target.value)}
            placeholder="Ex: Centro, Lisboa Norte"
          />
          {errors.preferredZone && (
            <p className="text-xs mt-1.5" style={{ color: 'var(--danger)' }}>{errors.preferredZone}</p>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-3">
        <button type="submit" className="btn btn-primary">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.5 4L5.5 10L2.5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Registar Estafeta
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
