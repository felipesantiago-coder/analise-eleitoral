"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ExternalLink,
  FileText,
  Scale,
  Landmark,
  Users,
  Vote,
  Trees,
  ShieldCheck,
  Cpu,
  Eye,
  TrendingUp,
  AlertTriangle,
  XCircle,
  BookOpen,
  ChevronRight,
  ArrowUp,
} from "lucide-react";
import {
  CRITERIOS,
  NIVEL_INFO,
  corNota,
  dados,
  iniciais,
  type Candidato,
  type Cargo,
  type ChaveCriterio,
} from "@/lib/analise";

const ICONES_CRITERIO: Record<ChaveCriterio, React.ElementType> = {
  transparencia: Eye,
  desenvolvimento: TrendingUp,
  honestidade: Scale,
  ambiental: Trees,
  soberania: ShieldCheck,
  tecnologia: Cpu,
};

const ICONE_CARGO: Record<string, React.ElementType> = {
  presidente: Landmark,
  governador: Vote,
  senador: Scale,
  dep_federal: Users,
  dep_distrital: BookOpen,
};

// Escala de notas com rótulo textual (não depende apenas de cor: acessível
// para daltônicos, seguindo a prática de guias eleitorais como o Wahl-O-Mat).
const FAIXAS_NOTA = [
  { min: 8, label: "Alta", faixa: "8 a 10", barra: "bg-emerald-500", dot: "bg-emerald-500" },
  { min: 6, label: "Boa", faixa: "6 a 8", barra: "bg-lime-500", dot: "bg-lime-500" },
  { min: 4, label: "Média", faixa: "4 a 6", barra: "bg-amber-500", dot: "bg-amber-500" },
  { min: 0, label: "Baixa", faixa: "0 a 4", barra: "bg-rose-500", dot: "bg-rose-500" },
];

const barraNota = (n: number) => FAIXAS_NOTA.find((f) => n >= f.min)!.barra;

// Formato decimal brasileiro (vírgula) para todas as notas exibidas
const fmt = (n: number, d = 1) => n.toFixed(d).replace(".", ",");

function Donut({ nota }: { nota: number }) {
  const pct = Math.max(0, Math.min(100, nota * 10));
  const raio = 30;
  const circ = 2 * Math.PI * raio;
  const cor = nota >= 8 ? "#059669" : nota >= 6 ? "#65a30d" : nota >= 4 ? "#d97706" : "#e11d48";
  return (
    <div
      className="relative h-20 w-20 shrink-0"
      role="img"
      aria-label={`Nota final ${nota.toFixed(2)} de 10`}
    >
      <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
        <circle cx="40" cy="40" r={raio} fill="none" stroke="#e4e4e7" strokeWidth="8" />
        <circle
          cx="40"
          cy="40"
          r={raio}
          fill="none"
          stroke={cor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * circ} ${circ}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-lg font-bold leading-none ${corNota(nota)}`}>{fmt(nota)}</span>
        <span className="text-[10px] text-muted-foreground">de 10</span>
      </div>
    </div>
  );
}

function Foto({ cand, size }: { cand: Candidato; size: "sm" | "lg" }) {
  const cls = size === "lg" ? "h-24 w-24 text-2xl" : "h-14 w-14 text-sm";
  if (cand.foto_url) {
    return (
      <Image
        src={cand.foto_url}
        alt={`Foto de ${cand.nome_urna}`}
        width={size === "lg" ? 96 : 56}
        height={size === "lg" ? 96 : 56}
        className={`${cls} shrink-0 rounded-full object-cover ring-2 ring-emerald-100`}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
    );
  }
  return (
    <div
      className={`${cls} flex shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-800 ring-2 ring-emerald-100`}
      aria-label={`Iniciais de ${cand.nome_urna}`}
    >
      {iniciais(cand.nome_urna)}
    </div>
  );
}

function BarraCriterio({ chave, nota }: { chave: ChaveCriterio; nota: number }) {
  const info = CRITERIOS.find((c) => c.chave === chave)!;
  return (
    <div className="flex items-center gap-2">
      <span className="w-28 shrink-0 text-xs text-muted-foreground sm:w-32">{info.curto}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100">
        <div
          className={`h-full rounded-full ${barraNota(nota)}`}
          style={{ width: `${nota * 10}%` }}
        />
      </div>
      <span className={`w-9 shrink-0 text-right text-xs font-semibold ${corNota(nota)}`}>
        {fmt(nota)}
      </span>
    </div>
  );
}

function LegendaNotas() {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1.5" aria-label="Escala de notas">
      <span className="text-xs font-medium text-zinc-500">Escala da nota:</span>
      {FAIXAS_NOTA.map((f) => (
        <span key={f.label} className="inline-flex items-center gap-1.5 text-xs text-zinc-600">
          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${f.dot}`} aria-hidden />
          {f.label} ({f.faixa})
        </span>
      ))}
    </div>
  );
}

function CardCandidato({ cand, cargo, onAbrir }: { cand: Candidato; cargo: Cargo; onAbrir: () => void }) {
  const Icone = ICONE_CARGO[cargo.cargo] ?? Vote;
  return (
    <button
      onClick={onAbrir}
      className="group w-full rounded-xl border bg-card p-4 text-left shadow-sm transition-all hover:border-emerald-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 active:scale-[0.995] motion-reduce:transition-none motion-reduce:active:scale-100 sm:p-5"
      aria-label={`Ver análise de ${cand.nome_urna}, ${cand.ranking}º colocado`}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
            cand.ranking === 1
              ? "bg-emerald-600 text-white"
              : cand.ranking === 2
                ? "bg-emerald-100 text-emerald-800"
                : "bg-zinc-100 text-zinc-600"
          }`}
          aria-label={`${cand.ranking}º colocado`}
        >
          {cand.ranking}º
        </div>
        <Foto cand={cand} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 font-semibold leading-tight group-hover:text-emerald-700">
            {cand.nome_urna}
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span className="truncate">{cand.partido}</span>
            <Badge variant="outline" className="h-5 gap-1 px-1.5 font-mono text-[11px]">
              <Icone className="h-3 w-3" aria-hidden />
              Nº {cand.numero}
            </Badge>
          </p>
        </div>
        <div className="text-right">
          <p className={`text-xl font-bold leading-none ${corNota(cand.score_total)}`}>
            {fmt(cand.score_total, 2)}
          </p>
          <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">nota</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-1.5">
        {CRITERIOS.map((c) => (
          <BarraCriterio key={c.chave} chave={c.chave} nota={cand.criterios[c.chave].nota} />
        ))}
      </div>
      <div className="mt-3 flex items-center justify-end gap-1 border-t border-zinc-100 pt-2.5 text-xs font-medium text-emerald-700">
        Ver análise completa
        <ChevronRight
          className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
          aria-hidden
        />
      </div>
    </button>
  );
}

function DetalheCandidato({ cand }: { cand: Candidato }) {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-4">
        <Foto cand={cand} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="text-lg font-bold leading-tight">{cand.nome_urna}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{cand.partido}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge className="gap-1 bg-emerald-600 font-mono hover:bg-emerald-600">
              <Vote className="h-3 w-3" aria-hidden /> Urna: {cand.numero}
            </Badge>
            {cand.vice && (
              <Badge variant="secondary" className="text-xs">
                Vice: {cand.vice}
              </Badge>
            )}
          </div>
        </div>
        <Donut nota={cand.score_total} />
      </div>

      <div className="rounded-lg bg-zinc-50 p-4 text-sm leading-relaxed text-zinc-700">
        {cand.resumo}
      </div>

      <Separator />

      <div className="grid grid-cols-1 gap-1.5">
        {CRITERIOS.map((c) => {
          const cr = cand.criterios[c.chave];
          const Icone = ICONES_CRITERIO[c.chave];
          const nivel = NIVEL_INFO[cr.nivel];
          return (
            <div key={c.chave} className="rounded-lg border p-3.5">
              <div className="flex items-center justify-between gap-2">
                <p className="flex min-w-0 flex-1 items-start gap-1.5 text-sm font-semibold">
                  <Icone className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                  <span className="leading-snug">{c.nome}</span>
                  <span className="shrink-0 text-xs font-normal text-muted-foreground">
                    ({Math.round(c.peso * 100)}%)
                  </span>
                </p>
                <span className={`shrink-0 text-sm font-bold ${corNota(cr.nota)}`}>
                  {fmt(cr.nota)}
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-100">
                <div
                  className={`h-full rounded-full ${barraNota(cr.nota)}`}
                  style={{ width: `${cr.nota * 10}%` }}
                />
              </div>
              <p className="mt-2.5 text-sm leading-relaxed text-zinc-600">{cr.texto}</p>
              <Badge
                variant="outline"
                className={`mt-2.5 h-auto whitespace-normal text-[11px] leading-relaxed ${nivel.cor}`}
              >
                {nivel.label}: {nivel.desc}
              </Badge>
            </div>
          );
        })}
      </div>

      {cand.fontes.length > 0 && (
        <>
          <Separator />
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
              <FileText className="h-4 w-4 text-emerald-600" aria-hidden />
              Fontes consultadas ({cand.fontes.length})
            </p>
            <ul className="grid gap-2">
              {cand.fontes.map((f, i) => (
                <li key={i}>
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-1.5 text-sm text-emerald-700 hover:underline"
                  >
                    <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0" aria-hidden />
                    {f.titulo}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      <p className="rounded-lg bg-amber-50 p-4 text-[13px] leading-relaxed text-amber-900">
        Notas refletem aderência aos seis critérios definidos no documento de origem, não
        qualidade geral. Investigações sem condenação não equivalem a culpabilidade. Confirme
        a situação da candidatura no TSE antes de votar.
      </p>
    </div>
  );
}

export default function Dashboard() {
  const [cargoAtivo, setCargoAtivo] = useState(dados.cargos[0].cargo);
  const [selecionado, setSelecionado] = useState<Candidato | null>(null);
  const [noTopo, setNoTopo] = useState(true);
  const painelRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onScroll = () => setNoTopo(window.scrollY <= 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const cargo = dados.cargos.find((c) => c.cargo === cargoAtivo)!;

  const selecionarCargo = (novo: string) => {
    if (novo === cargoAtivo) return;
    setCargoAtivo(novo);
    // Se o usuário já rolou para baixo, traz o painel de volta para o topo visível.
    requestAnimationFrame(() => {
      const el = painelRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const offsetSticky = 120;
      if (rect.top < offsetSticky || rect.top > window.innerHeight * 0.6) {
        window.scrollTo({ top: rect.top + window.scrollY - offsetSticky, behavior: "smooth" });
      }
    });
  };

  const navegarTabs = (e: React.KeyboardEvent, idx: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const total = dados.cargos.length;
    const next = e.key === "ArrowRight" ? (idx + 1) % total : (idx - 1 + total) % total;
    const novo = dados.cargos[next].cargo;
    setCargoAtivo(novo);
    requestAnimationFrame(() => {
      document.getElementById(`tab-${novo}`)?.focus();
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      {/* Cabeçalho */}
      <header
        className={`sticky top-0 z-40 border-b bg-white/90 backdrop-blur transition-shadow motion-reduce:transition-none ${
          noTopo ? "" : "shadow-sm"
        }`}
      >
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <Vote className="h-4 w-4" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold leading-tight">Guia Eleitoral DF 2026</p>
              <p className="truncate text-[11px] leading-tight text-muted-foreground">
                Compatibilidade com seus valores
              </p>
            </div>
          </div>
          <a
            href="/analise-eleitoral-df-2026.md"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium text-zinc-700 transition-colors hover:border-emerald-300 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 motion-reduce:transition-none"
          >
            <FileText className="h-3.5 w-3.5" aria-hidden />
            <span className="hidden sm:inline">Documento completo</span>
            <span className="sm:hidden">Doc</span>
          </a>
        </div>
      </header>

      {/* Abas de cargo (fixas ao rolar, com indicação de continuação) */}
      <nav
        aria-label="Cargos em disputa"
        className="sticky top-14 z-30 border-b bg-white/90 backdrop-blur"
      >
        <div className="mx-auto max-w-5xl px-4">
          <div className="relative">
            <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div role="tablist" aria-label="Selecionar cargo" className="flex w-max gap-2 py-2">
                {dados.cargos.map((c, i) => {
                  const Icone = ICONE_CARGO[c.cargo] ?? Vote;
                  const ativo = c.cargo === cargoAtivo;
                  const rotulo = c.titulo
                    .replace(" da República", "")
                    .replace(" do Distrito Federal", "")
                    .replace(/\s*\(\d+ vagas?\)/, "");
                  return (
                    <button
                      key={c.cargo}
                      id={`tab-${c.cargo}`}
                      role="tab"
                      aria-selected={ativo}
                      aria-controls={`painel-${c.cargo}`}
                      tabIndex={ativo ? 0 : -1}
                      onClick={() => selecionarCargo(c.cargo)}
                      onKeyDown={(e) => navegarTabs(e, i)}
                      className={`flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 motion-reduce:transition-none ${
                        ativo
                          ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                          : "border-zinc-200 bg-white text-zinc-700 hover:border-emerald-300 hover:text-emerald-700"
                      }`}
                    >
                      <Icone className="h-4 w-4" aria-hidden />
                      {rotulo}
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                          ativo ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-500"
                        }`}
                      >
                        {c.vagas} vaga{c.vagas > 1 ? "s" : ""}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Degrade lateral indica que há mais abas fora da tela */}
            <div
              className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white via-white/70 to-transparent"
              aria-hidden
            />
          </div>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-10">
        {/* Hero */}
        <section className="py-6 sm:py-8">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
            <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
            Eleição em 04/10/2026, 1º turno
          </div>
          <h1 className="mt-3 text-2xl font-bold leading-tight text-balance sm:text-3xl">
            Ranking de compatibilidade{" "}
            <span className="text-emerald-600">no Distrito Federal</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground text-pretty sm:text-base">
            Os 5 candidatos mais aderentes aos seus seis valores em cada cargo votado em
            Brasília, ranqueados por notas de 0 a 10 com níveis de evidência (A, B e C) e
            links para todas as fontes. Base oficial do TSE de 03/10/2026.
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              ["5", "cargos em disputa"],
              ["25", "candidatos analisados"],
              ["631", "candidaturas no DF"],
              ["6", "critérios ponderados"],
            ].map(([n, t]) => (
              <div key={t} className="rounded-lg border bg-card px-3 py-2">
                <dt className="sr-only">{t}</dt>
                <dd className="text-lg font-bold text-emerald-700">{n}</dd>
                <dd className="text-[11px] leading-tight text-muted-foreground">{t}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Aviso resumido */}
        <section
          aria-label="Aviso importante"
          className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-[13px] leading-relaxed text-amber-900"
        >
          <strong className="font-semibold">Ferramenta de apoio, não recomendação de voto.</strong>{" "}
          Notas são juízos editoriais informados com fontes abertas; investigações sem condenação
          não provam culpa (presunção de inocência). Candidaturas podem mudar de situação até o
          dia da votação. Confirme no{" "}
          <a
            href="https://divulgacandcontas.tse.jus.br/divulga/#/candidatos"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-amber-400 underline-offset-2 hover:text-amber-700"
          >
            DivulgaCandContas
          </a>{" "}
          antes de votar.
        </section>

        {/* Conteúdo do cargo */}
        <section
          ref={painelRef}
          role="tabpanel"
          id={`painel-${cargo.cargo}`}
          aria-labelledby={`tab-${cargo.cargo}`}
          className="scroll-mt-28"
        >
          <p className="mb-4 text-[13px] leading-relaxed text-muted-foreground text-pretty sm:text-sm">
            {cargo.intro}
          </p>

          <LegendaNotas />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {cargo.candidatos.map((cand) => (
              <CardCandidato
                key={cand.numero + cand.nome_urna}
                cand={cand}
                cargo={cargo}
                onAbrir={() => setSelecionado(cand)}
              />
            ))}
          </div>

          {cargo.excluidos.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-zinc-700">
                <XCircle className="h-4 w-4 text-amber-600" aria-hidden />
                Fora do ranking (com motivo documentado)
              </h2>
              <div className="grid gap-2">
                {cargo.excluidos.map((ex) => (
                  <div
                    key={ex.nome}
                    className="rounded-xl border border-amber-200 bg-white p-3.5 text-[13px]"
                  >
                    <p className="font-semibold text-zinc-800">{ex.nome}</p>
                    <p className="mt-1 leading-relaxed text-zinc-600">{ex.motivo}</p>
                    {ex.fontes.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                        {ex.fontes.slice(0, 3).map((f, i) => (
                          <a
                            key={i}
                            href={f.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" aria-hidden />
                            {f.titulo}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Metodologia */}
        <section id="metodologia" aria-label="Metodologia" className="mt-10 scroll-mt-28">
          <h2 className="text-xl font-bold text-balance">Como o ranking foi calculado</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
            Nota final = soma de (nota do critério × peso), em escala de 0 a 10. Os pesos seguem
            a ordem de prioridade dos seis valores, com honestidade reforçada a 25% conforme
            solicitado. Cada nota considera evidências em três níveis.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {CRITERIOS.map((c, i) => (
              <div key={c.chave} className="rounded-xl border bg-card p-3.5">
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-1.5 text-sm font-semibold">
                    {(() => {
                      const Icone = ICONES_CRITERIO[c.chave];
                      return <Icone className="h-4 w-4 text-emerald-600" aria-hidden />;
                    })()}
                    {c.curto}
                  </p>
                  <Badge variant="secondary" className="font-mono text-[11px]">
                    peso {Math.round(c.peso * 100)}%
                  </Badge>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Critério {i + 1} da sua lista: {c.nome}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {(Object.keys(NIVEL_INFO) as (keyof typeof NIVEL_INFO)[]).map((n) => {
              const info = NIVEL_INFO[n];
              return (
                <div key={n} className={`rounded-xl border p-3.5 ${info.cor}`}>
                  <p className="text-sm font-bold">Nível {n}</p>
                  <p className="mt-1 text-xs leading-relaxed opacity-90">{info.desc}</p>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Rodapé */}
      <footer className="mt-auto border-t bg-white">
        <div className="mx-auto max-w-5xl px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <p className="text-xs leading-relaxed text-muted-foreground text-pretty">
            Guia eleitoral independente, sem vínculo partidário e sem propaganda eleitoral.
            Dados: TSE (dados abertos, 03/10/2026), Senado Federal, Câmara dos Deputados e
            reportagens de imprensa citadas em cada ficha. O documento completo, com a
            metodologia detalhada, está disponível no botão Documento completo, no topo.
          </p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
            <a
              href="https://dadosabertos.tse.jus.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 hover:underline"
            >
              Dados abertos do TSE
            </a>
            <a
              href="https://divulgacandcontas.tse.jus.br/divulga/#/candidatos"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 hover:underline"
            >
              DivulgaCandContas
            </a>
            <a
              href="https://www12.senado.leg.br/noticias/candidatos-2026/distrito-federal"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 hover:underline"
            >
              Candidatos ao Senado DF
            </a>
          </div>
        </div>
      </footer>

      {/* Voltar ao topo (aparece após rolar) */}
      {!noTopo && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Voltar ao topo"
          className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-lg transition-colors hover:border-emerald-300 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 motion-reduce:transition-none"
        >
          <ArrowUp className="h-5 w-5" aria-hidden />
        </button>
      )}

      {/* Diálogo de detalhe */}
      <Dialog open={!!selecionado} onOpenChange={(open) => !open && setSelecionado(null)}>
        <DialogContent className="max-h-[92dvh] w-[calc(100vw-1.5rem)] grid-cols-1 gap-0 overflow-hidden p-0 sm:max-w-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>{selecionado?.nome_urna}</DialogTitle>
            <DialogDescription>
              Análise detalhada por critério com fontes
            </DialogDescription>
          </DialogHeader>
          {selecionado && (
            <div className="max-h-[calc(92dvh-1px)] overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]">
              <div className="p-4 sm:p-6">
                <DetalheCandidato cand={selecionado} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
