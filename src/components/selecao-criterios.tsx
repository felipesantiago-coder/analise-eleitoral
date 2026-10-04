"use client";

import { useState } from "react";
import {
  Briefcase,
  Bus,
  Check,
  Cpu,
  Eye,
  Gavel,
  HeartHandshake,
  Landmark,
  Scale,
  ShieldCheck,
  SlidersHorizontal,
  Trees,
  TrendingUp,
  Vote,
  Wallet,
} from "lucide-react";
import {
  APLICAVEIS_DF,
  APLICAVEIS_PRESIDENTE,
  CHAVES_SUGESTAO,
  CRITERIOS,
  pesoGrupo,
  type ChaveCriterio,
  type EscolhaCriterios,
} from "@/lib/analise";
import { ThemeToggle } from "@/components/theme-toggle";

const ICONES: Record<ChaveCriterio, React.ElementType> = {
  transparencia: Eye,
  desenvolvimento: TrendingUp,
  honestidade: Scale,
  ambiental: Trees,
  soberania: ShieldCheck,
  tecnologia: Cpu,
  democracia: Gavel,
  gestao: Briefcase,
  fiscal: Wallet,
  social: HeartHandshake,
  mobilidade: Bus,
};

const pct = (p: number) => {
  const v = Math.round(p * 1000) / 10;
  return (Number.isInteger(v) ? String(v) : v.toFixed(1).replace(".", ",")) + "%";
};

const abrangencia = (chave: ChaveCriterio): string =>
  chave === "soberania" || chave === "tecnologia"
    ? "Avalia somente o Presidente"
    : chave === "mobilidade"
      ? "Avalia somente os cargos do DF"
      : "Avalia todos os cargos";

interface Props {
  valor: EscolhaCriterios;
  aoConfirmar: (escolha: EscolhaCriterios) => void;
  aoCancelar?: () => void;
}

export default function SelecaoCriterios({ valor, aoConfirmar, aoCancelar }: Props) {
  const [escolha, setEscolha] = useState<EscolhaCriterios>(valor);

  const alternar = (chave: ChaveCriterio) =>
    setEscolha((atual) => ({ ...atual, [chave]: !atual[chave] }));

  const usarSugestao = () => {
    const nova: EscolhaCriterios = {};
    for (const c of CRITERIOS) nova[c.chave] = CHAVES_SUGESTAO.includes(c.chave);
    setEscolha(nova);
  };

  const totalPrincipais = CRITERIOS.filter((c) => escolha[c.chave]).length;
  const kPres = APLICAVEIS_PRESIDENTE.filter((c) => escolha[c]).length;
  const kDf = APLICAVEIS_DF.filter((c) => escolha[c]).length;
  const gPres = pesoGrupo(APLICAVEIS_PRESIDENTE.length, kPres);
  const gDf = pesoGrupo(APLICAVEIS_DF.length, kDf);

  const nomes = (chaves: ChaveCriterio[]) =>
    chaves.filter((c) => escolha[c]).map((c) => CRITERIOS.find((x) => x.chave === c)!.curto);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Cabeçalho */}
      <header className="sticky top-0 z-40 border-b border-zinc-100 bg-white/95 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/95">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-2 px-4">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-soft">
              <Vote className="h-4 w-4" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-bold leading-tight text-zinc-900 dark:text-zinc-50">
                Voto Claro
              </p>
              <p className="hidden min-[400px]:block truncate text-[0.75rem] leading-tight text-muted-foreground">
                Sua régua, seus critérios
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-40">
        {/* Hero */}
        <section className="pt-7 sm:pt-10">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-900">
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
            Antes do ranking, a sua escolha
          </p>
          <h1 className="mt-3 text-2xl font-bold leading-tight text-zinc-900 dark:text-zinc-50 text-balance sm:text-3xl">
            Quais critérios são <span className="text-emerald-600 dark:text-emerald-400">mais importantes</span> para você?
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground text-pretty sm:text-base">
            Para cada critério, escolha se ele é <strong className="font-semibold text-zinc-700 dark:text-zinc-200">principal</strong> ou{" "}
            <strong className="font-semibold text-zinc-700 dark:text-zinc-200">comum</strong> na sua avaliação. Cada critério
            principal pesa o dobro de um critério comum na nota de cada candidato, e dentro de cada grupo todos têm o
            mesmo peso. O Voto Claro não impõe valores: a classificação de todos os cargos segue a régua que você
            montar aqui, respeitando os critérios aplicáveis a cada disputa.
          </p>
        </section>

        {/* Cartões de critérios */}
        <section className="mt-6" aria-label="Escolha dos critérios">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {CRITERIOS.map((c) => {
              const Icone = ICONES[c.chave];
              const principal = !!escolha[c.chave];
              return (
                <div
                  key={c.chave}
                  className={`rounded-3xl bg-white dark:bg-card p-4 shadow-soft ring-1 transition-colors ${
                    principal
                      ? "ring-2 ring-emerald-500 dark:ring-emerald-500"
                      : "ring-zinc-100 dark:ring-zinc-800"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="flex min-w-0 items-center gap-2.5 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60">
                        <Icone className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden />
                      </span>
                      <span className="leading-tight">{c.curto}</span>
                    </p>
                    <div
                      role="group"
                      aria-label={`Papel do critério ${c.curto} na sua régua`}
                      className="flex shrink-0 rounded-full bg-zinc-100 p-0.5 dark:bg-zinc-800"
                    >
                      <button
                        type="button"
                        onClick={() => !principal && alternar(c.chave)}
                        aria-pressed={principal}
                        className={`rounded-full px-2.5 py-1 text-[0.6875rem] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                          principal
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                        }`}
                      >
                        Principal
                      </button>
                      <button
                        type="button"
                        onClick={() => principal && alternar(c.chave)}
                        aria-pressed={!principal}
                        className={`rounded-full px-2.5 py-1 text-[0.6875rem] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                          !principal
                            ? "bg-white text-zinc-700 shadow-sm dark:bg-zinc-900 dark:text-zinc-200"
                            : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                        }`}
                      >
                        Comum
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {principal ? "Critério principal na sua régua: " : "Critério comum na sua régua: "}
                    {c.nome}
                  </p>
                  <p className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[0.6875rem] font-medium text-zinc-600 dark:text-zinc-400">
                    {abrangencia(c.chave)}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Resumo da régua escolhida */}
        <section className="mt-6 rounded-3xl bg-emerald-50 p-5 ring-1 ring-emerald-100 dark:bg-emerald-950/50 dark:ring-emerald-900" aria-live="polite">
          <h2 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
            Sua régua até agora: {totalPrincipais} principal{totalPrincipais === 1 ? "" : "es"} de 11 critérios
          </h2>
          <div className="mt-3 grid gap-3 text-[0.8125rem] leading-relaxed text-emerald-900 dark:text-emerald-200 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/70 p-3.5 dark:bg-zinc-900/60">
              <p className="font-semibold">No Presidente (10 critérios)</p>
              <p className="mt-1">
                Principais: {nomes(APLICAVEIS_PRESIDENTE).join(", ") || "nenhum (todos com peso igual)"} ·{" "}
                {kPres > 0 && kPres < APLICAVEIS_PRESIDENTE.length
                  ? `peso ${pct(gPres.principal)} cada`
                  : `todos com ${pct(gPres.principal)}`}
              </p>
              <p className="mt-1">
                Comuns: peso {pct(gPres.comum)} cada
              </p>
            </div>
            <div className="rounded-2xl bg-white/70 p-3.5 dark:bg-zinc-900/60">
              <p className="font-semibold">Nos cargos do DF (9 critérios)</p>
              <p className="mt-1">
                Principais: {nomes(APLICAVEIS_DF).join(", ") || "nenhum (todos com peso igual)"} ·{" "}
                {kDf > 0 && kDf < APLICAVEIS_DF.length
                  ? `peso ${pct(gDf.principal)} cada`
                  : `todos com ${pct(gDf.principal)}`}
              </p>
              <p className="mt-1">
                Comuns: peso {pct(gDf.comum)} cada
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-emerald-800 dark:text-emerald-300">
            A defesa dos interesses nacionais e a fronteira tecnológica avaliam somente o Presidente; a mobilidade
            avalia somente os cargos do DF. A régua é aplicada a todos os candidatos aptos de cada cargo.
          </p>
        </section>
      </main>

      {/* Barra de confirmação */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-100 bg-white/95 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/95">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="min-w-0">
            <p className="text-[0.8125rem] font-semibold text-zinc-900 dark:text-zinc-50">
              {totalPrincipais} principal{totalPrincipais === 1 ? "" : "es"} · {11 - totalPrincipais} comum
              {11 - totalPrincipais === 1 ? "" : "ns"}
            </p>
            <p className="text-[0.6875rem] leading-tight text-muted-foreground">
              Você pode alterar essa escolha a qualquer momento no ranking.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {aoCancelar && (
              <button
                type="button"
                onClick={aoCancelar}
                className="rounded-full px-4 py-2.5 text-[0.8125rem] font-semibold text-zinc-600 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 motion-reduce:transition-none dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Cancelar
              </button>
            )}
            <button
              type="button"
              onClick={usarSugestao}
              className="rounded-full bg-white dark:bg-card px-4 py-2.5 text-[0.8125rem] font-semibold text-emerald-700 shadow-soft ring-1 ring-zinc-100 transition-colors hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 motion-reduce:transition-none dark:text-emerald-400 dark:ring-zinc-800 dark:hover:bg-emerald-950/40"
            >
              Usar sugestão da redação
            </button>
            <button
              type="button"
              onClick={() => aoConfirmar(escolha)}
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2.5 text-[0.8125rem] font-bold text-white shadow-soft transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 motion-reduce:transition-none"
            >
              <Check className="h-4 w-4" aria-hidden />
              Ver meu ranking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
