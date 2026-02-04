import PDFDocument from "pdfkit";

const formatCurrency = (value) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const buildPdf = (plan, summary, res) => {
  const doc = new PDFDocument({ margin: 40 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=plano-${plan.id}.pdf`);
  doc.pipe(res);

  doc.fontSize(20).text("Relatório de Plano de Corte", { align: "center" });
  doc.moveDown();
  doc.fontSize(12).text(`Cliente: ${plan.cliente_nome}`);
  doc.text(`Ambiente: ${plan.ambiente}`);
  doc.text(`Status: ${plan.status}`);
  doc.moveDown();

  doc.fontSize(14).text("Resumo MDF", { underline: true });
  summary.mdf.forEach((item) => {
    doc
      .fontSize(11)
      .text(`${item.marca} | ${item.cor} | ${item.espessura_mm}mm`, { continued: true })
      .text(` - Chapas: ${item.quantidade_chapas} - Total: ${formatCurrency(item.custo_total)}`);
  });
  doc.moveDown();

  doc.fontSize(14).text("Resumo Fitas", { underline: true });
  summary.fitas.forEach((item) => {
    doc
      .fontSize(11)
      .text(`${item.cor} | ${item.espessura_mm}mm`, { continued: true })
      .text(` - ${item.metros}m - Rolos: ${item.rolos} - ${formatCurrency(item.custo_total)}`);
  });
  doc.moveDown();

  doc.fontSize(14).text("Peças", { underline: true });
  summary.pecas.forEach((piece) => {
    doc
      .fontSize(10)
      .text(`${piece.quantidade}x ${piece.descricao} ${piece.largura_mm}x${piece.altura_mm}mm - ${piece.marca_mdf}/${piece.cor_mdf}`);
  });
  doc.moveDown();

  doc.fontSize(14).text("Totais", { underline: true });
  doc.fontSize(11).text(`Área utilizada: ${summary.totais.area_utilizada_m2} m²`);
  doc.text(`Área perdida: ${summary.totais.area_perdida_m2} m²`);
  doc.text(`Total MDF: ${formatCurrency(summary.totais.custo_mdf)}`);
  doc.text(`Total Fitas: ${formatCurrency(summary.totais.custo_fitas)}`);
  doc.text(`Valor final: ${formatCurrency(summary.totais.custo_total)}`);

  doc.end();
};
