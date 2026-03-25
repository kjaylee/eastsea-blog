(function (root) {
  const PRODUCTS = [
    { name: 'Classic T-Shirt',  basePrice: 19.84 },
    { name: 'Pullover Hoodie',  basePrice: 44.00 },
    { name: 'Sticker (Small)',  basePrice: 2.44  },
    { name: 'Sticker (Large)',  basePrice: 3.92  },
    { name: 'Phone Case',       basePrice: 19.60 },
    { name: 'Art Print (A4)',   basePrice: 17.70 },
    { name: 'Tote Bag',         basePrice: 17.50 },
    { name: 'Mug (11oz)',       basePrice: 12.43 },
    { name: 'Spiral Notebook',  basePrice: 14.00 },
    { name: 'Poster (Medium)',  basePrice: 17.72 },
  ];

  const SWEEP_MARGINS = [5, 10, 15, 20, 25, 30, 40, 50];

  const DEFAULTS = {
    productIndex: 0,
    basePrice: 19.84,
    marginPct: 20,
    monthlySales: 5,
    activeDesigns: 10,
  };

  function round2(v) {
    return Math.round((v + Number.EPSILON) * 100) / 100;
  }

  function round1(v) {
    return Math.round((v + Number.EPSILON) * 10) / 10;
  }

  function computeRow(basePrice, marginPct) {
    const royaltyPerSale   = round2(basePrice * (marginPct / 100));
    const retailPrice      = round2(basePrice * (1 + marginPct / 100));
    const marginEfficiency = retailPrice > 0 ? round1((royaltyPerSale / retailPrice) * 100) : 0;
    return { marginPct, royaltyPerSale, retailPrice, marginEfficiency };
  }

  function compute({ basePrice, marginPct, monthlySales, activeDesigns }) {
    const bp = Number(basePrice);
    const mp = Number(marginPct);
    const ms = Number(monthlySales);
    const ad = Number(activeDesigns);

    if (!(bp > 0)) return { error: 'Base price must be greater than zero.' };
    if (mp < 0 || mp > 100) return { error: 'Margin must be between 0 and 100.' };
    if (!(ms >= 1)) return { error: 'Monthly sales must be at least 1.' };
    if (!(ad >= 1)) return { error: 'Active designs must be at least 1.' };

    const row          = computeRow(bp, mp);
    const monthlyIncome = round2(row.royaltyPerSale * ms * ad);
    const sweep        = SWEEP_MARGINS.map(m => computeRow(bp, m));

    return {
      error: '',
      royaltyPerSale:   row.royaltyPerSale,
      retailPrice:      row.retailPrice,
      marginEfficiency: row.marginEfficiency,
      monthlyIncome,
      sweep,
    };
  }

  const exports = { compute, PRODUCTS, SWEEP_MARGINS, DEFAULTS };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exports;
  } else {
    root.RedbubbleCalc = exports;
  }
}(typeof globalThis !== 'undefined' ? globalThis : this));
