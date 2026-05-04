"use client";

import { useEffect } from "react";
import { saveCustomer } from "../lib/customers";
import { addAddress } from "../lib/addresses";
import { saveCourier } from "../lib/couriers";
import { saveVehicle } from "../lib/vehicles";
import { saveOrder, assignCourier, updateOrderStatus } from "../lib/orders";

export default function SeedData() {
  useEffect(() => {
    // Only seed once per session or if storage is empty
    if (localStorage.getItem("seeded_v5") === "true") return;

    // Reset storage to avoid duplication
    localStorage.clear();
    localStorage.setItem("seeded_v5", "true");

    const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);
    const randomEl = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    
    const firstNames = ["João", "Maria", "Carlos", "Ana", "Pedro", "Sofia", "Miguel", "Beatriz", "Rui", "Catarina"];
    const lastNames = ["Silva", "Costa", "Santos", "Oliveira", "Martins", "Pereira", "Fernandes", "Gomes", "Rodrigues", "Lopes"];
    
    const customers = [];
    for (let i = 0; i < 8; i++) {
      const isEmpresa = Math.random() > 0.7;
      const name = isEmpresa 
        ? `${randomEl(lastNames)} & ${randomEl(lastNames)} Lda` 
        : `${randomEl(firstNames)} ${randomEl(lastNames)}`;
      
      const emailDomain = isEmpresa ? name.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '') + '.pt' : 'exemplo.pt';
      
      customers.push(saveCustomer({
        name,
        nif: isEmpresa ? `5${randomInt(0, 99999999).toString().padStart(8, '0')}` : `2${randomInt(0, 99999999).toString().padStart(8, '0')}`,
        type: isEmpresa ? "empresa" : "particular",
        email: `${name.split(' ')[0].toLowerCase()}@${emailDomain}`,
        phone: `9${randomInt(1, 6)}${randomInt(0, 9999999).toString().padStart(7, '0')}`,
        communicationPreferences: { email: Math.random() > 0.2, sms: Math.random() > 0.3 }
      }));
    }

    const zones = ["Baixa", "Saldanha", "Parque das Nações", "Benfica", "Alvalade", "Belém", "Campo Grande", "Lumiar"];
    const streets = ["Rua Augusta", "Av. da República", "Av. D. João II", "Estrada de Benfica", "Av. de Roma", "Rua de Belém", "Campo Grande", "Alameda das Linhas de Torres"];
    
    const addresses = [];
    for (let i = 0; i < 15; i++) {
      const customerId = randomEl(customers).id;
      const zoneIdx = randomInt(0, zones.length - 1);
      addresses.push(addAddress({
        customerId,
        street: `${streets[zoneIdx]}, ${randomInt(1, 200)}`,
        city: "Lisboa",
        postalCode: `1${randomInt(0, 9)}00-${randomInt(100, 999)}`,
        zone: zones[zoneIdx],
        isDefault: i < 8
      }));
    }

    const vTypes = ["motorizada", "carrinha", "bicicleta", "carrinha"] as const;
    const vehicles = [];
    for (let i = 0; i < 8; i++) {
      vehicles.push(saveVehicle({
        plate: `${String.fromCharCode(65+i)}${String.fromCharCode(65+i)}-${randomInt(10,99)}-${String.fromCharCode(70+i)}${String.fromCharCode(70+i)}`,
        type: vTypes[i % vTypes.length],
        capacity: vTypes[i % vTypes.length] === 'carrinha' ? 500 : (vTypes[i % vTypes.length] === 'motorizada' ? 20 : 5),
        status: Math.random() > 0.8 ? "em manutenção" : "ativo",
        currentMileage: randomInt(1000, 50000),
        maintenanceMileageLimit: randomInt(40000, 60000),
        nextMaintenanceDate: new Date(Date.now() + randomInt(-5, 60) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }));
    }

    const couriers = [];
    for (let i = 0; i < 12; i++) {
      couriers.push(saveCourier({
        name: `${randomEl(firstNames)} ${randomEl(lastNames)}`,
        identification: `CC ${randomInt(10000000, 99999999)}`,
        contact: `9${randomInt(1, 6)}${randomInt(0, 9999999).toString().padStart(7, '0')}`,
        vehicle: i < vehicles.length ? vehicles[i].id : vehicles[0].id,
        preferredZone: randomEl(zones),
        isAvailable: Math.random() > 0.15
      }));
    }

    const items = ["Computador Portátil", "Rato Wireless", "Monitor 24'", "Teclado Mecânico", "Cabo USB-C", "Auscultadores Bluetooth", "Cadeira", "Secretária", "Smartphone", "Tablet", "Impressora", "Tinteiros", "Disco Externo 1TB", "Pen Drive 64GB"];
    
    const ordersToSave = [];

    // Seed 150 orders spanning the last 6 months with clear separation
    for (let i = 0; i < 150; i++) {
      const address = randomEl(addresses);
      
      let daysOffset = 0;
      if (i < 40) {
        // 40 orders in the last 5 days
        daysOffset = -randomInt(0, 4);
      } else if (i < 90) {
        // 50 orders in the last 4 weeks
        daysOffset = -randomInt(5, 27);
      } else {
        // 60 orders in the last 6 months
        daysOffset = -randomInt(28, 180);
      }
      
      const numItems = randomInt(1, 3);
      const articles = Array.from({length: numItems}).map(() => `${randomInt(1,3)}x ${randomEl(items)}`).join(', ');

      const createdTime = new Date(Date.now() + daysOffset * 24 * 60 * 60 * 1000).getTime();
      
      // Determine if on time (95% chance)
      const isOnTime = Math.random() < 0.95;
      
      // Expected date is slightly after created date
      const expectedTime = createdTime + randomInt(1, 3) * 24 * 60 * 60 * 1000;
      
      const order: any = {
        id: crypto.randomUUID(),
        customerId: address.customerId,
        addressId: address.id,
        articles,
        createdAt: new Date(createdTime).toISOString(),
        expectedDate: new Date(expectedTime).toISOString(),
        status: "pendente",
        statusHistory: [{ status: "pendente", changedAt: new Date(createdTime).toISOString() }] as any[]
      };

      const rand = Math.random();
      if (rand > 0.6) {
        // Leave pending
      } else if (rand > 0.25) {
        // Delivered
        order.courierId = randomEl(couriers).id;
        order.status = "entregue";
        
        const distTime = createdTime + randomInt(2, 10) * 60 * 60 * 1000;
        let deliveredTime = expectedTime;
        
        if (isOnTime) {
          // Deliver BEFORE expected
          deliveredTime = expectedTime - randomInt(1, 12) * 60 * 60 * 1000;
        } else {
          // Deliver AFTER expected
          deliveredTime = expectedTime + randomInt(1, 3) * 24 * 60 * 60 * 1000;
        }

        order.statusHistory.push({ status: "em distribuição", changedAt: new Date(distTime).toISOString() });
        order.statusHistory.push({ status: "entregue", changedAt: new Date(deliveredTime).toISOString() });
      } else if (rand > 0.1) {
        // Em distribuicao
        order.courierId = randomEl(couriers).id;
        order.status = "em distribuição";
        const distTime = createdTime + randomInt(2, 10) * 60 * 60 * 1000;
        order.statusHistory.push({ status: "em distribuição", changedAt: new Date(distTime).toISOString() });
      } else if (rand > 0.05) {
        // Falhou
        order.courierId = randomEl(couriers).id;
        order.status = "falhou";
        const distTime = createdTime + randomInt(2, 10) * 60 * 60 * 1000;
        const failTime = distTime + randomInt(1, 3) * 60 * 60 * 1000;
        order.statusHistory.push({ status: "em distribuição", changedAt: new Date(distTime).toISOString() });
        order.statusHistory.push({ status: "falhou", changedAt: new Date(failTime).toISOString() });
      } else {
        // Cancelada
        order.status = "cancelada";
        const cancelTime = createdTime + randomInt(1, 5) * 60 * 60 * 1000;
        order.statusHistory.push({ status: "cancelada", changedAt: new Date(cancelTime).toISOString(), note: "Cancelado pelo cliente" });
      }

      ordersToSave.push(order);
    }
    
    localStorage.setItem("urbandelivery_orders", JSON.stringify(ordersToSave));
    
    window.location.reload();
  }, []);

  return null;
}
