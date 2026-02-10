import { useMemo } from 'react';

export const useGSTCalculator = () => {
  const calculateGST = useMemo(() => {
    return (basePrice, quantity, gstPercentage) => {
      const materialCost = basePrice * quantity;
      const gstAmount = (materialCost * gstPercentage) / 100;
      const totalWithGST = materialCost + gstAmount;

      return {
        materialCost: Math.round(materialCost),
        gstAmount: Math.round(gstAmount),
        totalWithGST: Math.round(totalWithGST),
        gstPercentage,
      };
    };
  }, []);

  return { calculateGST };
};
