import { useMemo } from 'react';
import { vehicleTypes } from '../data/products';

export const useTransportCalculator = () => {
  const calculateTransport = useMemo(() => {
    return (weightKg, distance) => {
      // Select appropriate vehicle based on weight
      let selectedVehicle = vehicleTypes[0]; // Default to mini truck
      
      for (const vehicle of vehicleTypes) {
        if (weightKg <= vehicle.maxCapacity) {
          selectedVehicle = vehicle;
          break;
        }
      }

      // If weight exceeds largest vehicle, use tipper
      if (weightKg > vehicleTypes[vehicleTypes.length - 1].maxCapacity) {
        selectedVehicle = vehicleTypes[vehicleTypes.length - 1];
      }

      // Calculate transport cost
      const baseCharge = selectedVehicle.baseCharge;
      const distanceCharge = distance * selectedVehicle.perKmRate;
      const totalTransportCost = baseCharge + distanceCharge;

      return {
        vehicle: selectedVehicle,
        baseCharge,
        distanceCharge,
        totalTransportCost: Math.round(totalTransportCost),
        breakdown: {
          vehicleName: selectedVehicle.name,
          baseCharge: baseCharge,
          perKmRate: selectedVehicle.perKmRate,
          distance: distance,
          distanceCharge: Math.round(distanceCharge),
        }
      };
    };
  }, []);

  return { calculateTransport };
};
