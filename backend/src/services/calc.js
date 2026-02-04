const FITA_MAP = {
  "1x_menor": { menor: 1, maior: 0 },
  "1x_maior": { menor: 0, maior: 1 },
  "1x_menor_1x_maior": { menor: 1, maior: 1 },
  "2x_menor": { menor: 2, maior: 0 },
  "2x_maior": { menor: 0, maior: 2 },
  "1x_menor_2x_maior": { menor: 1, maior: 2 },
  "2x_maior_1x_menor": { menor: 1, maior: 2 },
  "nenhum": { menor: 0, maior: 0 }
};

const round = (value, decimals = 4) => Number.parseFloat(value.toFixed(decimals));

const expandPieces = (pieces) => pieces.flatMap((piece) => {
  const expanded = [];
  for (let i = 0; i < piece.quantidade; i += 1) {
    expanded.push({
      largura_mm: piece.largura_mm,
      altura_mm: piece.altura_mm,
      marca_mdf: piece.marca_mdf,
      cor_mdf: piece.cor_mdf,
      espessura_mm: piece.espessura_mm,
      descricao: piece.descricao,
      ambiente: piece.ambiente,
      fita_selecao: piece.fita_selecao
    });
  }
  return expanded;
});

const calculateEdgeBands = (pieces) => {
  const totals = {};

  pieces.forEach((piece) => {
    const selection = FITA_MAP[piece.fita_selecao] || FITA_MAP.nenhum;
    const menor = Math.min(piece.largura_mm, piece.altura_mm);
    const maior = Math.max(piece.largura_mm, piece.altura_mm);
    const mmTotal = selection.menor * menor + selection.maior * maior;
    if (mmTotal === 0) return;

    const key = `${piece.marca_mdf}|${piece.cor_mdf}|${piece.espessura_mm}`;
    if (!totals[key]) {
      totals[key] = {
        marca: piece.marca_mdf,
        cor: piece.cor_mdf,
        espessura_mm: piece.espessura_mm,
        metros: 0
      };
    }
    totals[key].metros += mmTotal / 1000;
  });

  return Object.values(totals).map((item) => ({
    ...item,
    metros: round(item.metros, 2)
  }));
};

const normalizeRect = (sheetWidth, sheetHeight, rect) => {
  let { largura_mm, altura_mm } = rect;
  const fitsAsIs = largura_mm <= sheetWidth && altura_mm <= sheetHeight;
  const fitsRotated = altura_mm <= sheetWidth && largura_mm <= sheetHeight;
  if (!fitsAsIs && fitsRotated) {
    [largura_mm, altura_mm] = [altura_mm, largura_mm];
  }
  return { largura_mm, altura_mm };
};

const ffdh = (sheetWidth, sheetHeight, rectangles) => {
  const sorted = [...rectangles]
    .map((rect) => normalizeRect(sheetWidth, sheetHeight, rect))
    .sort((a, b) => b.altura_mm - a.altura_mm);
  let sheets = 1;
  let currentY = 0;
  let shelfHeight = 0;
  let currentX = 0;
  let usedArea = 0;

  sorted.forEach((rect) => {
    const fitsCurrentShelf = currentX + rect.largura_mm <= sheetWidth;
    const fitsHeight = rect.altura_mm <= sheetHeight;
    if (!fitsHeight) return;

    if (!fitsCurrentShelf) {
      currentY += shelfHeight;
      currentX = 0;
      shelfHeight = 0;
    }

    if (currentY + rect.altura_mm > sheetHeight) {
      sheets += 1;
      currentY = 0;
      currentX = 0;
      shelfHeight = 0;
    }

    currentX += rect.largura_mm;
    shelfHeight = Math.max(shelfHeight, rect.altura_mm);
    usedArea += rect.largura_mm * rect.altura_mm;
  });

  const totalArea = sheets * sheetWidth * sheetHeight;
  const wasteArea = totalArea - usedArea;
  return { sheets, usedArea, wasteArea };
};

export const calculatePlan = (pieces, mdfCatalog, fitaCatalog) => {
  const expanded = expandPieces(pieces);
  const byMdf = expanded.reduce((acc, piece) => {
    const key = `${piece.marca_mdf}|${piece.cor_mdf}|${piece.espessura_mm}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(piece);
    return acc;
  }, {});

  const mdfSummary = [];
  let totalMdfCost = 0;
  let totalAreaUsed = 0;
  let totalAreaWaste = 0;

  const wasteMargin = 0.03;

  Object.entries(byMdf).forEach(([key, group]) => {
    const [marca, cor, espessura] = key.split("|");
    const mdf = mdfCatalog.find((item) => item.marca === marca && item.cor === cor && item.espessura_mm === Number(espessura));
    if (!mdf) return;

    const rectangles = group.map((piece) => ({
      largura_mm: piece.largura_mm,
      altura_mm: piece.altura_mm
    }));

    const packing = ffdh(mdf.largura_mm, mdf.altura_mm, rectangles);
    const areaUsed = packing.usedArea / 1_000_000;
    const areaWaste = packing.wasteArea / 1_000_000;
    const sheetsNeeded = packing.sheets;
    const cost = sheetsNeeded * mdf.preco_chapa;

    totalMdfCost += cost;
    totalAreaUsed += areaUsed;
    totalAreaWaste += areaWaste + areaUsed * wasteMargin;

    mdfSummary.push({
      marca,
      cor,
      espessura_mm: Number(espessura),
      preco_chapa: mdf.preco_chapa,
      largura_mm: mdf.largura_mm,
      altura_mm: mdf.altura_mm,
      quantidade_chapas: sheetsNeeded,
      area_utilizada_m2: round(areaUsed, 3),
      area_perdida_m2: round(areaWaste + areaUsed * wasteMargin, 3),
      custo_total: round(cost, 2)
    });
  });

  const fitasCalculadas = calculateEdgeBands(expanded);
  const fitasSummary = fitasCalculadas.map((item) => {
    const fita = fitaCatalog.find((f) => f.cor === item.cor && f.espessura_compativel_mm === item.espessura_mm);
    const metrosPorRolo = fita ? fita.metros_por_rolo : 100;
    const precoPorRolo = fita ? fita.preco_por_rolo : 0;
    const rolos = Math.ceil(item.metros / metrosPorRolo);
    return {
      ...item,
      largura_fita_mm: fita ? fita.largura_fita_mm : 22,
      metros_por_rolo: metrosPorRolo,
      preco_por_rolo: precoPorRolo,
      rolos,
      custo_total: round(rolos * precoPorRolo, 2)
    };
  });

  const totalFitasCost = fitasSummary.reduce((sum, item) => sum + item.custo_total, 0);

  return {
    mdf: mdfSummary,
    fitas: fitasSummary,
    pecas: pieces,
    totais: {
      area_utilizada_m2: round(totalAreaUsed, 3),
      area_perdida_m2: round(totalAreaWaste, 3),
      custo_mdf: round(totalMdfCost, 2),
      custo_fitas: round(totalFitasCost, 2),
      custo_total: round(totalMdfCost + totalFitasCost, 2)
    }
  };
};
