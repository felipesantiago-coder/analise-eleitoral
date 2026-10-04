"use client";

import { useState, useSyncExternalStore } from "react";
import {
  CRITERIOS,
  type ChaveCriterio,
  type EscolhaCriterios,
} from "@/lib/analise";
import SelecaoCriterios from "@/components/selecao-criterios";
import Dashboard from "@/components/dashboard";

const CHAVE_STORAGE = "voto-claro:regua-v1";

const chavesValidas = new Set<string>(CRITERIOS.map((c) => c.chave));

/** Cache da leitura do armazenamento: mantém a referência do snapshot
 *  estável entre chamadas (exigência do useSyncExternalStore). */
const cache = { bruto: null as string | null, valor: null as EscolhaCriterios | null };

const interpretar = (bruto: string | null): EscolhaCriterios | null => {
  if (!bruto) return null;
  try {
    const arr = JSON.parse(bruto);
    if (!Array.isArray(arr)) return null;
    const escolha: EscolhaCriterios = {};
    for (const k of arr) {
      if (typeof k === "string" && chavesValidas.has(k)) escolha[k as ChaveCriterio] = true;
    }
    return escolha;
  } catch {
    return null;
  }
};

const lerRegua = (): EscolhaCriterios | null => {
  const bruto = localStorage.getItem(CHAVE_STORAGE);
  if (bruto !== cache.bruto) {
    cache.bruto = bruto;
    cache.valor = interpretar(bruto);
  }
  return cache.valor;
};

const lerReguaServidor = (): EscolhaCriterios | null => null;

const inscrever = (aoMudar: () => void) => {
  window.addEventListener("storage", aoMudar);
  return () => window.removeEventListener("storage", aoMudar);
};

const salvarEscolha = (escolha: EscolhaCriterios) => {
  try {
    const principais = (Object.keys(escolha) as ChaveCriterio[]).filter((k) => escolha[k]);
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(principais));
    cache.bruto = null; // força releitura da régua no próximo snapshot
  } catch {
    /* armazenamento indisponível: a régua vale apenas nesta sessão */
  }
};

export default function VotoClaroApp() {
  // Régua persistida: undefined = ainda desconhecida (render do servidor);
  // null = sem régua salva; objeto = régua de um acesso anterior.
  const reguaSalva = useSyncExternalStore(inscrever, lerRegua, lerReguaServidor);
  const [escolha, setEscolha] = useState<EscolhaCriterios | null>(null);
  const [editando, setEditando] = useState(false);

  const confirmar = (nova: EscolhaCriterios) => {
    salvarEscolha(nova);
    setEscolha(nova);
    setEditando(false);
  };

  if (reguaSalva === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm font-medium text-muted-foreground" role="status">
          Carregando o Voto Claro...
        </p>
      </div>
    );
  }

  const efetiva = escolha ?? reguaSalva ?? {};
  const temRegua = escolha !== null || reguaSalva !== null;

  // Sem régua salva (ou editando), o app abre na interface de escolha;
  // confirmada a régua, o ranking personalizado é exibido.
  if (!temRegua || editando) {
    return (
      <SelecaoCriterios
        valor={efetiva}
        aoConfirmar={confirmar}
        aoCancelar={editando ? () => setEditando(false) : undefined}
      />
    );
  }

  return <Dashboard escolha={efetiva} aoAbrirEscolha={() => setEditando(true)} />;
}
