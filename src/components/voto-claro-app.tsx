"use client";

import { useEffect, useState } from "react";
import {
  CRITERIOS,
  type ChaveCriterio,
  type EscolhaCriterios,
} from "@/lib/analise";
import SelecaoCriterios from "@/components/selecao-criterios";
import Dashboard from "@/components/dashboard";

const CHAVE_STORAGE = "voto-claro:regua-v1";

const chavesValidas = new Set<string>(CRITERIOS.map((c) => c.chave));

const lerEscolhaSalva = (): EscolhaCriterios | null => {
  try {
    const bruto = localStorage.getItem(CHAVE_STORAGE);
    if (!bruto) return null;
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

const salvarEscolha = (escolha: EscolhaCriterios) => {
  try {
    const principais = (Object.keys(escolha) as ChaveCriterio[]).filter((k) => escolha[k]);
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(principais));
  } catch {
    /* armazenamento indisponível: a régua vale apenas nesta sessão */
  }
};

export default function VotoClaroApp() {
  const [pronto, setPronto] = useState(false);
  const [etapa, setEtapa] = useState<"escolha" | "ranking">("escolha");
  const [editando, setEditando] = useState(false);
  const [escolha, setEscolha] = useState<EscolhaCriterios>({});

  // Régua salva em acessos anteriores vai direto para o ranking; sem régua
  // salva, o usuário passa pela escolha de critérios antes do ranking.
  useEffect(() => {
    const salva = lerEscolhaSalva();
    if (salva) {
      setEscolha(salva);
      setEtapa("ranking");
    }
    setPronto(true);
  }, []);

  const confirmar = (nova: EscolhaCriterios) => {
    setEscolha(nova);
    salvarEscolha(nova);
    setEditando(false);
    setEtapa("ranking");
  };

  if (!pronto) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm font-medium text-muted-foreground" role="status">
          Carregando o Voto Claro...
        </p>
      </div>
    );
  }

  if (etapa === "escolha") {
    return (
      <SelecaoCriterios
        valor={escolha}
        aoConfirmar={confirmar}
        aoCancelar={editando ? () => setEtapa("ranking") : undefined}
      />
    );
  }

  return <Dashboard escolha={escolha} aoAbrirEscolha={() => { setEditando(true); setEtapa("escolha"); }} />;
}
