import { useContent } from "../data/content";
import { dateFR, fcfa, type Quote } from "../data/quotes";
import BrandMark from "./BrandLogo";

/**
 * Feuille « facture pro forma » prête à imprimer / exporter en PDF.
 * Seule la feuille est imprimée grâce aux règles CSS @media print.
 */
export default function ProformaSheet({
  quote,
  mode = "proforma",
}: {
  quote: Quote;
  mode?: "proforma" | "final";
}) {
  const { contact } = useContent();
  const phone = contact.phones[0]?.display ?? "";
  const valid = quote.validUntil || dateFR(Date.now() + 30 * 86400000);
  const needs = quote.needs.length
    ? quote.needs
    : quote.prices.map((p) => p.label);

  return (
    <div
      id="proforma"
      className="rounded-xl bg-[#fdfdfb] p-6 text-[#17171b] shadow-2xl shadow-black/50 sm:p-10"
      style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}
    >
      {/* En-tête */}
      <div className="flex flex-wrap items-start justify-between gap-6 border-b-2 border-[#17171b] pb-6">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-[#0b0b0b]">
            <BrandMark className="h-9 w-9 text-white object-contain" />
          </span>
          <div>
            <p className="font-display text-2xl uppercase leading-none tracking-wide">
              Doxa<span className="text-rouge-deep"> Studio</span>
            </p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-[#55555c]">
              {contact.location}
              <br />
              {contact.email}
              {phone && <> · {phone}</>}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-display text-3xl uppercase leading-none text-rouge-deep">
            Facture
            <br />
            {mode === "final" ? "définitive" : "pro forma"}
          </p>
          <div className="mt-3 space-y-0.5 text-[11px] text-[#55555c]">
            <p>
              N° <span className="font-bold text-[#17171b]">{quote.number}</span>
            </p>
            <p>Émise le {dateFR(quote.createdAt)}</p>
            <p>Valable jusqu'au {valid}</p>
          </div>
        </div>
      </div>

      {/* Client + intention */}
      <div className="mt-6 grid gap-4 sm:grid-cols-[220px_1fr]">
        <div className="rounded-lg border border-[#e3e1dc] bg-[#f5f4f0] p-4">
          <p className="text-[9.5px] font-bold uppercase tracking-[0.22em] text-[#8a8880]">
            Client
          </p>
          <p className="mt-2 text-sm font-bold">{quote.name}</p>
          {quote.company && <p className="text-[12px] text-[#55555c]">{quote.company}</p>}
          <p className="mt-1 break-all text-[11px] text-[#55555c]">{quote.email}</p>
        </div>
        <div className="rounded-lg border border-[#e3e1dc] bg-[#f5f4f0] p-4">
          <p className="text-[9.5px] font-bold uppercase tracking-[0.22em] text-[#8a8880]">
            Intention du client
          </p>
          <p className="mt-2 whitespace-pre-wrap text-[12px] leading-relaxed text-[#3a3a40]">
            {quote.intention}
          </p>
        </div>
      </div>

      {/* Prestations */}
      <table className="mt-6 w-full border-collapse text-[12px]">
        <thead>
          <tr className="border-b-2 border-[#17171b] text-left">
            <th className="pb-2 pr-3 text-[9.5px] font-bold uppercase tracking-[0.18em]">
              Désignation
            </th>
            <th className="pb-2 pr-3 text-[9.5px] font-bold uppercase tracking-[0.18em]">
              Détail
            </th>
            <th className="pb-2 text-right text-[9.5px] font-bold uppercase tracking-[0.18em]">
              Montant
            </th>
          </tr>
        </thead>
        <tbody>
          {needs.map((label) => {
            const price = quote.prices.find((p) => p.label === label);
            return (
              <tr key={label} className="border-b border-[#e3e1dc] align-top">
                <td className="py-3 pr-3 font-bold">{label}</td>
                <td className="py-3 pr-3 text-[#55555c]">
                  {price?.description || "Prestation selon le brief validé"}
                </td>
                <td className="whitespace-nowrap py-3 text-right">
                  {price ? fcfa(price.amount) : <span className="text-[#8a8880]">À chiffrer</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={2} className="py-3 text-right text-[10px] uppercase tracking-[0.18em] text-[#8a8880]">
              Montant total {quote.status === "sent" ? "" : "estimé"}
            </td>
            <td className="py-3 text-right font-display text-lg uppercase text-rouge-deep">
              {quote.total ? fcfa(quote.total) : "À chiffrer"}
            </td>
          </tr>
        </tfoot>
      </table>

      <div className="mt-6 rounded-lg border border-[#e3e1dc] bg-[#f5f4f0] p-4 text-[10.5px] leading-relaxed text-[#55555c]">
        <p>
          <span className="font-bold text-[#17171b]">Conditions :</span>{" "}
          {mode === "final"
            ? "facture pro forma définitive émise après validation du chiffrage. Production lancée après accord sur les modalités de paiement."
            : "document pro forma — ne constitue pas une demande de paiement. Les montants seront confirmés après validation du cahier des charges."}
        </p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-6">
        <div className="border-t border-[#17171b] pt-2 text-[10.5px] text-[#55555c]">
          Pour Doxa Studio
          <p className="mt-1 font-bold text-[#17171b]">Le Directeur — Admin/Jaures</p>
        </div>
        <div className="border-t border-[#17171b] pt-2 text-[10.5px] text-[#55555c]">
          Bon pour accord — le client
          <p className="mt-1 font-bold text-[#17171b]">{quote.name}</p>
        </div>
      </div>

      <p className="mt-6 text-center text-[9.5px] uppercase tracking-[0.3em] text-[#b0aea6]">
        Doxa Studio — Donnez vie à vos projets visuels
      </p>
    </div>
  );
}
