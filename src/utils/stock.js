export const checkStockLimit = (product, newUnitKg, cartItems) => {
  if (!product.autoStockManagement) return true;

  // Calculate total Kg of this product already in cart
  let currentCartKg = 0;
  cartItems.forEach(item => {
    // Match by name because _id might be missing or different depending on collection format
    if (item.name === product.name) {
      let itemUnitKg = 1;
      const wLabel = item.weight ? item.weight.toLowerCase() : '1kg';
      if (wLabel.includes('500g')) itemUnitKg = 0.5;
      else if (wLabel.includes('2kg')) itemUnitKg = 2;
      else if (wLabel.includes('3kg')) itemUnitKg = 3;
      else if (wLabel.includes('5kg')) itemUnitKg = 5;
      currentCartKg += (itemUnitKg * item.quantity);
    }
  });

  const totalRequestedKg = currentCartKg + newUnitKg;
  if (totalRequestedKg > product.totalStockKg) {
    alert(`Stock Limit Reached: We only have ${product.totalStockKg} Kg of ${product.name} left in stock.`);
    return false;
  }
  return true;
};

export const getUnitKg = (weightLabel) => {
  const w = weightLabel ? weightLabel.toLowerCase() : '1kg';
  if (w.includes('500g')) return 0.5;
  if (w.includes('2kg')) return 2;
  if (w.includes('3kg')) return 3;
  if (w.includes('5kg')) return 5;
  return 1;
};
