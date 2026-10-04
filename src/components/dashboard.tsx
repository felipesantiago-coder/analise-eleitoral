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
  MapPin,
  Search,
  SearchX,
  CheckCircle2,
  Award,
  ListOrdered,
  BadgeCheck,
} from "lucide-react";
import {
  CRITERIOS,
  NIVEL_INFO,
  corNota,
  dados,
  iniciais,
  type Candidato,
  type ChaveCriterio,
  type Nivel,
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

// Tiles pastel por cargo, no estilo das categorias do DocSpot
const PASTEL_CARGO: Record<string, string> = {
  presidente: "bg-sky-100 text-sky-600",
  governador: "bg-violet-100 text-violet-600",
  senador: "bg-amber-100 text-amber-600",
  dep_federal: "bg-rose-100 text-rose-600",
  dep_distrital: "bg-teal-100 text-teal-600",
};

// Rótulos curtos para a navegação inferior no mobile
const ROTULO_NAV: Record<string, string> = {
  presidente: "Presidente",
  governador: "Governador",
  senador: "Senador",
  dep_federal: "Dep. Federal",
  dep_distrital: "Dep. Distrital",
};

// Escala de notas com rótulo textual (não depende apenas de cor: acessível
// para daltônicos, seguindo a prática de guias eleitorais como o Wahl-O-Mat).
const FAIXAS_NOTA = [
  {
    min: 8,
    label: "Alta",
    faixa: "8 a 10",
    barra: "bg-emerald-500",
    dot: "bg-emerald-500",
    chip: "bg-emerald-100 text-emerald-800",
  },
  {
    min: 6,
    label: "Boa",
    faixa: "6 a 8",
    barra: "bg-lime-500",
    dot: "bg-lime-500",
    chip: "bg-lime-100 text-lime-800",
  },
  {
    min: 4,
    label: "Média",
    faixa: "4 a 6",
    barra: "bg-amber-500",
    dot: "bg-amber-500",
    chip: "bg-amber-100 text-amber-800",
  },
  {
    min: 0,
    label: "Baixa",
    faixa: "0 a 4",
    barra: "bg-rose-500",
    dot: "bg-rose-500",
    chip: "bg-rose-100 text-rose-800",
  },
];

const barraNota = (n: number) => FAIXAS_NOTA.find((f) => n >= f.min)!.barra;
const faixaDe = (n: number) => FAIXAS_NOTA.find((f) => n >= f.min)!;

// Formato decimal brasileiro (vírgula) para todas as notas exibidas
const fmt = (n: number, d = 1) => n.toFixed(d).replace(".", ",");

// Nível de evidência predominante entre os seis critérios. Em caso de empate
// prevalece o nível mais fraco, por transparência com o eleitor.
const nivelPredominante = (cand: Candidato): Nivel => {
  const contagem: Record<Nivel, number> = { A: 0, B: 0, C: 0 };
  for (const c of CRITERIOS) contagem[cand.criterios[c.chave].nivel] += 1;
  let nivel: Nivel = "A";
  let max = 0;
  (["A", "B", "C"] as Nivel[]).forEach((n) => {
    if (contagem[n] >= max) {
      max = contagem[n];
      nivel = n;
    }
  });
  return nivel;
};

const rotuloCurto = (titulo: string) =>
  titulo
    .replace(" da República", "")
    .replace(" do Distrito Federal", "")
    .replace(/\s*\(\d+ vagas?\)/, "");

function Foto({ cand, size }: { cand: Candidato; size: "sm" | "lg" }) {
  const cls = size === "lg" ? "h-24 w-24 text-2xl" : "h-14 w-14 text-sm";
  if (cand.foto_url) {
    return (
      <Image
        src={cand.foto_url}
        alt={`Foto de ${cand.nome_urna}`}
        width={size === "lg" ? 96 : 56}
        height={size === "lg" ? 96 : 56}
        className={`${cls} shrink-0 rounded-full object-cover ${
          size === "lg" ? "ring-4 ring-emerald-100" : "ring-2 ring-zinc-100"
        }`}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
    );
  }
  return (
    <div
      className={`${cls} flex shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-800 ${
        size === "lg" ? "ring-4 ring-emerald-100" : "ring-2 ring-zinc-100"
      }`}
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
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100">
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
    <div
      className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-2"
      aria-label="Escala de notas"
    >
      <span className="text-xs font-medium text-zinc-500">Escala da nota:</span>
      {FAIXAS_NOTA.map((f) => (
        <span
          key={f.label}
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-600 shadow-soft ring-1 ring-zinc-100"
        >
          <span className={`h-2 w-2 shrink-0 rounded-full ${f.dot}`} aria-hidden />
          {f.label} ({f.faixa})
        </span>
      ))}
    </div>
  );
}

function CardCandidato({ cand, onAbrir }: { cand: Candidato; onAbrir: () => void }) {
  const faixa = faixaDe(cand.score_total);
  return (
    <button
      onClick={onAbrir}
      className="group w-full rounded-3xl bg-white p-4 text-left shadow-soft ring-1 ring-zinc-100 transition-all hover:-translate-y-0.5 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 active:scale-[0.995] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100 sm:p-5"
      aria-label={`Ver análise de ${cand.nome_urna}, ${cand.ranking}º colocado`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-8 min-w-8 shrink-0 items-center justify-center rounded-full px-1 text-xs font-bold ${
            cand.ranking === 1
              ? "bg-emerald-600 text-white shadow-sm"
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
          <p className="line-clamp-2 font-semibold leading-tight text-zinc-900 group-hover:text-emerald-700">
            {cand.nome_urna}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span className="truncate">{cand.partido}</span>
            <span className="rounded-md border border-zinc-200 px-1.5 py-0.5 font-mono text-[11px] text-zinc-600">
              Nº {cand.numero}
            </span>
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className={`text-2xl font-bold leading-none tracking-tight ${corNota(cand.score_total)}`}>
            {fmt(cand.score_total, 2)}
          </p>
          <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">de 10</p>
        </div>
      </div>
      <div className="mt-3.5">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${faixa.chip}`}
        >
          <CheckCircle2 className="h-3 w-3" aria-hidden />
          Compatibilidade {faixa.label.toLowerCase()}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-1.5">
        {CRITERIOS.map((c) => (
          <BarraCriterio key={c.chave} chave={c.chave} nota={cand.criterios[c.chave].nota} />
        ))}
      </div>
      <div className="mt-4 flex items-center justify-end gap-1 border-t border-zinc-100 pt-3 text-xs font-semibold text-emerald-700">
        Ver análise completa
        <ChevronRight
          className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
          aria-hidden
        />
      </div>
    </button>
  );
}

function DetalheCandidato({ cand, cargoTitulo }: { cand: Candidato; cargoTitulo: string }) {
  const faixa = faixaDe(cand.score_total);
  return (
    <div>
      {/* Perfil centralizado, como a ficha do médico no DocSpot */}
      <div className="flex flex-col items-center text-center">
        <Foto cand={cand} size="lg" />
        <p className="mt-3 text-xl font-bold leading-tight text-zinc-900">{cand.nome_urna}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {cargoTitulo} · {cand.partido}
        </p>
        <div className="mt-2.5 flex flex-wrap justify-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 font-mono text-[11px] font-semibold text-white">
            <Vote className="h-3 w-3" aria-hidden />
            Urna: {cand.numero}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${faixa.chip}`}
          >
            <CheckCircle2 className="h-3 w-3" aria-hidden />
            Compatibilidade {faixa.label.toLowerCase()}
          </span>
          {cand.vice && (
            <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-700">
              Vice: {cand.vice}
            </span>
          )}
        </div>
      </div>

      {/* Linha de estatísticas (nota, posição, evidência) */}
      <div className="mt-5 grid grid-cols-3 gap-2">
        <div className="rounded-2xl bg-zinc-50 px-2 py-3 text-center">
          <p aria-hidden className={`text-lg font-bold leading-none ${corNota(cand.score_total)}`}>
            {fmt(cand.score_total, 2)}
          </p>
          <p className="mt-1 text-[10px] leading-tight text-muted-foreground">
            Nota geral de 10<span className="sr-only">: {fmt(cand.score_total, 2)}</span>
          </p>
        </div>
        <div className="rounded-2xl bg-zinc-50 px-2 py-3 text-center">
          <p className="flex items-center justify-center gap-1 text-lg font-bold leading-none text-zinc-900">
            <ListOrdered className="h-4 w-4 text-emerald-600" aria-hidden />
            {cand.ranking}º
          </p>
          <p className="mt-1 text-[10px] leading-tight text-muted-foreground">
            Posição no cargo
          </p>
        </div>
        <div className="rounded-2xl bg-zinc-50 px-2 py-3 text-center">
          <p className="flex items-center justify-center gap-1 text-sm font-bold leading-none text-zinc-900">
            <BadgeCheck className="h-4 w-4 text-emerald-600" aria-hidden />
            Nível {nivelPredominante(cand)}
          </p>
          <p className="mt-1 text-[10px] leading-tight text-muted-foreground">
            Evidência predominante
          </p>
        </div>
      </div>

      {/* Resumo */}
      <div className="mt-4 rounded-2xl bg-zinc-50 p-4 text-sm leading-relaxed text-zinc-700">
        {cand.resumo}
      </div>

      {/* Notas por critério */}
      <h3 className="mt-6 flex items-center gap-1.5 text-sm font-bold text-zinc-900">
        <Award className="h-4 w-4 text-emerald-600" aria-hidden />
        Notas por critério
      </h3>
      <div className="mt-3 grid gap-2.5">
        {CRITERIOS.map((c) => {
          const cr = cand.criterios[c.chave];
          const Icone = ICONES_CRITERIO[c.chave];
          const niv = NIVEL_INFO[cr.nivel];
          return (
            <div key={c.chave} className="rounded-2xl bg-zinc-50 p-3.5">
              <div className="flex items-center justify-between gap-2">
                <p className="flex min-w-0 flex-1 items-center gap-2.5 text-sm font-semibold text-zinc-900">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                    <Icone className="h-4 w-4 text-emerald-600" aria-hidden />
                  </span>
                  <span className="leading-tight">{c.nome}</span>
                </p>
                <div className="flex shrink-0 items-center gap-1.5">
                  <span className="text-[11px] text-muted-foreground">
                    {Math.round(c.peso * 100)}%
                  </span>
                  <span className={`text-sm font-bold ${corNota(cr.nota)}`}>{fmt(cr.nota)}</span>
                </div>
              </div>
              <div className="mt-2.5 ml-0 sm:ml-[46px]">
                <div className="h-1.5 overflow-hidden rounded-full bg-white">
                  <div
                    className={`h-full rounded-full ${barraNota(cr.nota)}`}
                    style={{ width: `${cr.nota * 10}%` }}
                  />
                </div>
                <p className="mt-2.5 text-[13px] leading-relaxed text-zinc-600">{cr.texto}</p>
                <span
                  className={`mt-2.5 inline-flex whitespace-normal rounded-2xl px-2.5 py-1 text-[11px] leading-relaxed ${niv.cor}`}
                >
                  {niv.label}: {niv.desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Fontes */}
      {cand.fontes.length > 0 && (
        <>
          <h3 className="mt-6 flex items-center gap-1.5 text-sm font-bold text-zinc-900">
            <FileText className="h-4 w-4 text-emerald-600" aria-hidden />
            Fontes consultadas ({cand.fontes.length})
          </h3>
          <ul className="mt-3 grid gap-2">
            {cand.fontes.map((f, i) => (
              <li key={i}>
                <a
                  href={f.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start justify-between gap-2 rounded-2xl bg-zinc-50 px-3.5 py-3 text-[13px] font-medium text-zinc-700 transition-colors hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  <span className="leading-snug">{f.titulo}</span>
                  <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </>
      )}

      <p className="mt-5 rounded-2xl bg-amber-50 p-4 text-[13px] leading-relaxed text-amber-900">
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
  const [busca, setBusca] = useState("");
  const [noTopo, setNoTopo] = useState(true);
  const painelRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onScroll = () => setNoTopo(window.scrollY <= 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const cargo = dados.cargos.find((c) => c.cargo === cargoAtivo)!;

  const consulta = busca.trim().toLowerCase();
  const corresponde = (cand: Candidato) =>
    !consulta ||
    cand.nome_urna.toLowerCase().includes(consulta) ||
    cand.partido.toLowerCase().includes(consulta) ||
    cand.numero.includes(consulta);
  const candFiltrados = cargo.candidatos.filter(corresponde);
  const outrosComMatch = consulta
    ? dados.cargos
        .filter((cc) => cc.cargo !== cargoAtivo)
        .map((cc) => ({ cargo: cc, total: cc.candidatos.filter(corresponde).length }))
        .filter((x) => x.total > 0)
    : [];

  const selecionarCargo = (novo: string) => {
    if (novo === cargoAtivo) return;
    setCargoAtivo(novo);
    const suave = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    requestAnimationFrame(() => {
      // Centraliza a categoria ativa na faixa rolável do mobile
      document
        .getElementById(`tab-${novo}`)
        ?.scrollIntoView({ block: "nearest", inline: "center", behavior: suave ? "smooth" : "auto" });
      // Se o usuário já rolou para baixo, traz o painel de volta para o topo visível.
      const el = painelRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const offsetCabecalho = 88;
      if (rect.top < offsetCabecalho || rect.top > window.innerHeight * 0.6) {
        window.scrollTo({
          top: rect.top + window.scrollY - offsetCabecalho,
          behavior: suave ? "smooth" : "auto",
        });
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
    <div className="flex min-h-screen flex-col">
      {/* Cabeçalho */}
      <header
        className={`sticky top-0 z-40 border-b bg-white/85 backdrop-blur-md transition-all motion-reduce:transition-none ${
          noTopo ? "border-transparent" : "border-zinc-100 shadow-sm"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-soft">
              <Vote className="h-4 w-4" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold leading-tight text-zinc-900">
                Guia Eleitoral DF 2026
              </p>
              <p className="truncate text-[11px] leading-tight text-muted-foreground">
                Compatibilidade com seus valores
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-800 ring-1 ring-emerald-100 sm:inline-flex">
              <AlertTriangle className="h-3 w-3" aria-hidden />
              04 OUT 2026
            </span>
            <a
              href="/analise-eleitoral-df-2026.md"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Abrir documento completo da análise"
              title="Documento completo"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-zinc-700 shadow-soft ring-1 ring-zinc-100 transition-colors hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 motion-reduce:transition-none"
            >
              <FileText className="h-4 w-4" aria-hidden />
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-10">
        {/* Saudação e hero */}
        <section className="pt-6 sm:pt-8">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-zinc-500">Olá, eleitor</p>
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-medium text-zinc-600 shadow-soft ring-1 ring-zinc-100">
              <MapPin className="h-3 w-3 text-emerald-600" aria-hidden />
              Brasília, DF
            </span>
          </div>
          <h1 className="mt-2.5 text-2xl font-bold leading-tight text-zinc-900 text-balance sm:text-3xl">
            Ranking de compatibilidade <span className="text-emerald-600">com os seus valores</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground text-pretty sm:text-base">
            Os 5 candidatos mais aderentes aos seus seis valores em cada cargo votado em
            Brasília, ranqueados por notas de 0 a 10 com níveis de evidência (A, B e C) e
            links para todas as fontes. Base oficial do TSE de 03/10/2026.
          </p>

          {/* Cartões de destaque: data da eleição e números do pleito */}
          <div className="mt-5 grid gap-3 sm:grid-cols-2" aria-label="Resumo da eleição">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-5 text-white shadow-lift">
              <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10" aria-hidden />
              <div className="absolute -bottom-10 -right-2 h-20 w-20 rounded-full bg-white/10" aria-hidden />
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-100">
                Eleição 2026 · 1º turno
              </p>
              <p className="mt-2 text-4xl font-bold tracking-tight">04 OUT</p>
              <p className="mt-1 text-sm text-emerald-50">Domingo, das 8h às 17h</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["5", "cargos em disputa"],
                ["25", "candidatos no ranking"],
                ["631", "candidaturas no DF"],
                ["6", "critérios ponderados"],
              ].map(([n, t]) => (
                <div
                  key={t}
                  className="rounded-3xl bg-white p-3.5 shadow-soft ring-1 ring-zinc-100"
                >
                  <p className="text-xl font-bold text-zinc-900">{n}</p>
                  <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">{t}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Busca */}
        <section className="mt-5" aria-label="Buscar candidato">
          <label htmlFor="busca-candidato" className="sr-only">
            Buscar candidato por nome, partido ou número
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
              aria-hidden
            />
            <input
              id="busca-candidato"
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Busque por nome, partido ou número"
              className="h-12 w-full rounded-full bg-white pl-11 pr-4 text-sm text-zinc-900 shadow-soft ring-1 ring-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </section>

        {/* Categorias de cargo (abas no estilo cartões do DocSpot) */}
        <nav aria-label="Cargos em disputa" className="mt-5">
          <div className="relative">
            <div className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div
                role="tablist"
                aria-label="Selecionar cargo"
                className="grid w-max auto-cols-[10.5rem] grid-flow-col gap-2.5 sm:w-full sm:auto-cols-auto sm:grid-flow-row sm:grid-cols-5"
              >
                {dados.cargos.map((c, i) => {
                  const Icone = ICONE_CARGO[c.cargo] ?? Vote;
                  const ativo = c.cargo === cargoAtivo;
                  const rotulo = rotuloCurto(c.titulo);
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
                      className={`relative flex min-h-[5.75rem] w-full flex-col items-start gap-1.5 rounded-3xl bg-white p-3.5 text-left shadow-soft transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 motion-reduce:transition-none ${
                        ativo ? "ring-2 ring-emerald-600" : "ring-1 ring-zinc-100 hover:ring-emerald-300"
                      }`}
                    >
                      {ativo && (
                        <CheckCircle2
                          className="absolute right-3 top-3 h-4 w-4 text-emerald-600"
                          aria-hidden
                        />
                      )}
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-2xl ${PASTEL_CARGO[c.cargo] ?? "bg-emerald-100 text-emerald-600"}`}
                        aria-hidden
                      >
                        <Icone className="h-5 w-5" />
                      </span>
                      <span className="text-[13px] font-bold leading-tight text-zinc-900">
                        {rotulo}
                      </span>
                      <span className="text-[11px] leading-tight text-muted-foreground">
                        5 no ranking · {c.vagas} vaga{c.vagas > 1 ? "s" : ""}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Degrade lateral indica que há mais categorias fora da tela no mobile */}
            <div
              className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[oklch(0.9702_0_0)] via-[oklch(0.9702_0_0)]/70 to-transparent sm:hidden"
              aria-hidden
            />
          </div>
        </nav>

        {/* Aviso resumido */}
        <section
          aria-label="Aviso importante"
          className="mt-5 rounded-3xl bg-amber-50 p-4 text-[13px] leading-relaxed text-amber-900 sm:p-5"
        >
          <p className="flex items-start gap-3">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-700" aria-hidden />
            </span>
            <span className="text-pretty">
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
            </span>
          </p>
        </section>

        {/* Conteúdo do cargo */}
        <section
          ref={painelRef}
          role="tabpanel"
          id={`painel-${cargo.cargo}`}
          aria-labelledby={`tab-${cargo.cargo}`}
          className="mt-6 scroll-mt-24"
        >
          <p className="text-[13px] leading-relaxed text-muted-foreground text-pretty sm:text-sm">
            {cargo.intro}
          </p>

          <div className="mt-4">
            <LegendaNotas />
          </div>

          {consulta && candFiltrados.length > 0 && (
            <p className="mb-3 text-xs font-medium text-zinc-500" role="status">
              Exibindo {candFiltrados.length} de {cargo.candidatos.length} candidatos para "
              {busca.trim()}"
            </p>
          )}

          {candFiltrados.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {candFiltrados.map((cand) => (
                <CardCandidato
                  key={cand.numero + cand.nome_urna}
                  cand={cand}
                  onAbrir={() => setSelecionado(cand)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl bg-white p-6 text-center shadow-soft ring-1 ring-zinc-100">
              <SearchX className="mx-auto h-8 w-8 text-zinc-300" aria-hidden />
              <p className="mt-2 text-sm font-semibold text-zinc-900">
                Nenhum candidato em {rotuloCurto(cargo.titulo)} para "{busca.trim()}"
              </p>
              {outrosComMatch.length > 0 ? (
                <>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    A busca encontrou correspondências em outros cargos:
                  </p>
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    {outrosComMatch.map(({ cargo: cc, total }) => (
                      <button
                        key={cc.cargo}
                        onClick={() => selecionarCargo(cc.cargo)}
                        className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200 transition-colors hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 motion-reduce:transition-none"
                      >
                        {rotuloCurto(cc.titulo)} ({total})
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Tente outro termo, como o nome, a sigla do partido ou o número da urna.
                </p>
              )}
            </div>
          )}

          {cargo.excluidos.length > 0 && (
            <div className="mt-7">
              <h2 className="flex items-center gap-1.5 text-sm font-bold text-zinc-900">
                <XCircle className="h-4 w-4 text-amber-600" aria-hidden />
                Fora do ranking (com motivo documentado)
              </h2>
              <div className="mt-3 grid gap-2.5">
                {cargo.excluidos.map((ex) => (
                  <div
                    key={ex.nome}
                    className="rounded-3xl bg-white p-4 text-[13px] shadow-soft ring-1 ring-zinc-100"
                  >
                    <p className="font-semibold text-zinc-900">{ex.nome}</p>
                    <p className="mt-1 leading-relaxed text-zinc-600">{ex.motivo}</p>
                    {ex.fontes.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                        {ex.fontes.slice(0, 3).map((f, i) => (
                          <a
                            key={i}
                            href={f.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:underline"
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
        <section id="metodologia" aria-label="Metodologia" className="mt-10 scroll-mt-24">
          <h2 className="text-xl font-bold text-zinc-900 text-balance">
            Como o ranking foi calculado
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
            Nota final = soma de (nota do critério × peso), em escala de 0 a 10. Os pesos seguem
            a ordem de prioridade dos seis valores, com honestidade reforçada a 25% conforme
            solicitado. Cada nota considera evidências em três níveis.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {CRITERIOS.map((c, i) => {
              const Icone = ICONES_CRITERIO[c.chave];
              return (
                <div
                  key={c.chave}
                  className="rounded-3xl bg-white p-4 shadow-soft ring-1 ring-zinc-100"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="flex items-center gap-2.5 text-sm font-semibold text-zinc-900">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-50">
                        <Icone className="h-4 w-4 text-emerald-600" aria-hidden />
                      </span>
                      {c.curto}
                    </p>
                    <span className="rounded-full bg-zinc-100 px-2.5 py-1 font-mono text-[11px] font-semibold text-zinc-600">
                      peso {Math.round(c.peso * 100)}%
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    Critério {i + 1} da sua lista: {c.nome}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {(Object.keys(NIVEL_INFO) as (keyof typeof NIVEL_INFO)[]).map((n) => {
              const info = NIVEL_INFO[n];
              return (
                <div key={n} className={`rounded-3xl p-4 ${info.cor}`}>
                  <p className="text-sm font-bold">Nível {n}</p>
                  <p className="mt-1 text-xs leading-relaxed opacity-90">{info.desc}</p>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Rodapé */}
      <footer className="mt-auto border-t border-zinc-100 bg-white">
        <div className="mx-auto max-w-5xl px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-6 sm:pb-6">
          <p className="text-xs leading-relaxed text-muted-foreground text-pretty">
            Guia eleitoral independente, sem vínculo partidário e sem propaganda eleitoral.
            Dados: TSE (dados abertos, 03/10/2026), Senado Federal, Câmara dos Deputados e
            reportagens de imprensa citadas em cada ficha. O documento completo está disponível
            no botão de documento, no topo, e no rodapé de cada ficha de candidato.
          </p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
            <a
              href="https://dadosabertos.tse.jus.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-emerald-700 hover:underline"
            >
              Dados abertos do TSE
            </a>
            <a
              href="https://divulgacandcontas.tse.jus.br/divulga/#/candidatos"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-emerald-700 hover:underline"
            >
              DivulgaCandContas
            </a>
            <a
              href="https://www12.senado.leg.br/noticias/candidatos-2026/distrito-federal"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-emerald-700 hover:underline"
            >
              Candidatos ao Senado DF
            </a>
          </div>
        </div>
      </footer>

      {/* Navegação inferior flutuante por cargo (mobile), estilo DocSpot */}
      <nav
        aria-label="Ir para um cargo"
        className="fixed inset-x-0 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 flex justify-center px-3 sm:hidden"
      >
        <div className="flex items-center gap-0.5 rounded-full bg-zinc-900 p-1.5 shadow-lift">
          {dados.cargos.map((c) => {
            const Icone = ICONE_CARGO[c.cargo] ?? Vote;
            const ativo = c.cargo === cargoAtivo;
            return (
              <button
                key={c.cargo}
                onClick={() => selecionarCargo(c.cargo)}
                aria-label={`Ir para ${rotuloCurto(c.titulo)}`}
                aria-current={ativo ? "true" : undefined}
                className={`flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-full px-2.5 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white motion-reduce:transition-none ${
                  ativo ? "bg-white text-zinc-900" : "text-zinc-400 hover:text-white"
                }`}
              >
                <Icone className="h-4 w-4" aria-hidden />
                <span className="whitespace-nowrap text-[9px] font-semibold leading-none">
                  {ROTULO_NAV[c.cargo]}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Voltar ao topo (aparece após rolar) */}
      {!noTopo && (
        <button
          onClick={() => {
            const suave = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            window.scrollTo({ top: 0, behavior: suave ? "smooth" : "auto" });
          }}
          aria-label="Voltar ao topo"
          className="fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-white text-zinc-700 shadow-lift ring-1 ring-zinc-100 transition-colors hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 motion-reduce:transition-none sm:bottom-6"
        >
          <ArrowUp className="h-5 w-5" aria-hidden />
        </button>
      )}

      {/* Diálogo de detalhe, no estilo da ficha do profissional do DocSpot */}
      <Dialog open={!!selecionado} onOpenChange={(open) => !open && setSelecionado(null)}>
        <DialogContent className="max-h-[92dvh] w-[calc(100vw-1.5rem)] grid-cols-1 gap-0 overflow-hidden rounded-3xl border-0 bg-white p-0 shadow-lift ring-1 ring-zinc-200/70 sm:max-w-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>{selecionado?.nome_urna}</DialogTitle>
            <DialogDescription>
              Análise detalhada por critério com fontes
            </DialogDescription>
          </DialogHeader>
          {selecionado && (
            <div className="max-h-[calc(92dvh-1px)] overflow-y-auto overscroll-contain">
              <div className="px-4 pb-3 pt-6 sm:px-6">
                <DetalheCandidato cand={selecionado} cargoTitulo={rotuloCurto(cargo.titulo)} />
              </div>
              {/* CTA fixa no rodapé do diálogo, como o botão de agendar do DocSpot */}
              <div className="sticky bottom-0 border-t border-zinc-100 bg-white/95 px-4 pb-[max(0.875rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur sm:px-6">
                <a
                  href="/analise-eleitoral-df-2026.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-zinc-900 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 motion-reduce:transition-none"
                >
                  <FileText className="h-4 w-4" aria-hidden />
                  Abrir documento completo
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


