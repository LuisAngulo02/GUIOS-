import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { MOCK_FACTORES, MOCK_SUBFACTORES } from "../data/mockCatalog";
import { apiService } from "../services/apiService";

const EvaluationContext = createContext();

const MAPA_NUMERO_A_TEXTO_IR = {
  1: "Irrelevante",
  2: "Opcional",
  3: "Importante",
  4: "Fundamental",
};

export const EvaluationProvider = ({ children }) => {
  // 1. Estado de Usuario y Sesión
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("guios_user");
    return saved
      ? JSON.parse(saved)
      : {
          id: 1,
          nombre: "Admin Usuario",
          email: "admin@guiosplus.org",
          rol: "administrador",
          avatar: "AU",
        };
  });

  // 2. Identificador de Evaluación en Base de Datos PostgreSQL
  const [evaluacionId, setEvaluacionId] = useState(() => {
    return localStorage.getItem("guios_evaluacion_id") || "1";
  });

  const [isBackendConnected, setIsBackendConnected] = useState(false);

  // 3. Indicador de Guardado
  const [saveStatus, setSaveStatus] = useState("Guardado");

  // 4. Estado de la Evaluación Activa
  const [softwareActivo, setSoftwareActivo] = useState("Moodle");
  const [contextoActivo, setContextoActivo] = useState("Educación · Plataforma de aprendizaje virtual");
  const [descripcionCaso, setDescripcionCaso] = useState(
    "Evaluación de viabilidad para migrar el campus virtual institucional hacia Moodle 4.x garantizando interoperabilidad con LDAP y Office 365."
  );

  // 5. Lista de Factores con sus Importancias y Evidencia
  const [factores, setFactores] = useState(() => {
    const saved = localStorage.getItem("guios_factores");
    if (!saved) return MOCK_FACTORES;
    try {
      const parsed = JSON.parse(saved);
      return MOCK_FACTORES.map((mf) => {
        const found = parsed.find((p) => p.id === mf.id);
        if (!found) return mf;
        const idVal = found.ID !== undefined ? found.ID : mf.ID;
        const irNum = Math.floor((mf.IS + idVal) / 2);
        const irTexto = MAPA_NUMERO_A_TEXTO_IR[irNum] || "Irrelevante";
        return {
          ...mf,
          ...found,
          IL_dec: mf.IL_dec,
          IE_dec: mf.IE_dec,
          evidencia_count: mf.evidencia_count,
          citas_acumuladas: mf.citas_acumuladas,
          articulos: mf.articulos,
          ID: idVal,
          IR: `${irNum} · ${irTexto}`,
          relevante: irNum > 1,
        };
      });
    } catch {
      return MOCK_FACTORES;
    }
  });

  // 6. Calificaciones de Subfactores por cada Factor
  const [subfactoresState, setSubfactoresState] = useState(() => {
    const saved = localStorage.getItem("guios_subfactores");
    return saved ? JSON.parse(saved) : MOCK_SUBFACTORES;
  });

  // Persistir en LocalStorage
  useEffect(() => {
    localStorage.setItem("guios_factores", JSON.stringify(factores));
  }, [factores]);

  useEffect(() => {
    localStorage.setItem("guios_subfactores", JSON.stringify(subfactoresState));
  }, [subfactoresState]);

  useEffect(() => {
    if (evaluacionId) {
      localStorage.setItem("guios_evaluacion_id", evaluacionId.toString());
    }
  }, [evaluacionId]);

  // Sincronizar Paso 1 con Backend DRF
  const sincronizarPaso1ConBackend = useCallback(async (factoresParaGuardar) => {
    setSaveStatus("Sincronizando con base de datos...");
    try {
      const resp = await apiService.savePaso1(evaluacionId, factoresParaGuardar || factores);
      if (resp && resp.isLiveApi) {
        setIsBackendConnected(true);
        setSaveStatus("Guardado en PostgreSQL");
      } else {
        setSaveStatus("Guardado localmente");
      }
    } catch (e) {
      console.warn("Fallo persistencia paso 1:", e);
      setSaveStatus("Guardado local");
    } finally {
      setTimeout(() => setSaveStatus("Guardado"), 2500);
    }
  }, [evaluacionId, factores]);

  // Sincronizar Paso 2 con Backend DRF
  const sincronizarPaso2ConBackend = useCallback(async (factorIdOpcional) => {
    setSaveStatus("Sincronizando con base de datos...");
    try {
      // Aplanar todos los subfactores calificados
      let lista = [];
      if (factorIdOpcional) {
        lista = subfactoresState[factorIdOpcional] || [];
      } else {
        Object.values(subfactoresState).forEach((subList) => {
          lista = lista.concat(subList);
        });
      }

      // Solo enviar los que tienen id y calificacion
      const subfactoresAEnviar = lista
        .filter((s) => s.id && s.calificacion !== undefined)
        .map((s) => ({
          id: s.id,
          calificacion: s.calificacion,
          observacion: s.observacion || "",
        }));

      if (subfactoresAEnviar.length > 0) {
        const resp = await apiService.savePaso2(evaluacionId, subfactoresAEnviar);
        if (resp && resp.isLiveApi) {
          setIsBackendConnected(true);
          setSaveStatus("Guardado en PostgreSQL");
        } else {
          setSaveStatus("Guardado localmente");
        }
      } else {
        setSaveStatus("Guardado");
      }
    } catch (e) {
      console.warn("Fallo persistencia paso 2:", e);
      setSaveStatus("Guardado local");
    } finally {
      setTimeout(() => setSaveStatus("Guardado"), 2500);
    }
  }, [evaluacionId, subfactoresState]);

  // Actualizar "Tu importancia" (ID) de un factor con recálculo en vivo
  const updateFactorID = (factorId, nuevoID) => {
    setFactores((prev) =>
      prev.map((f) => {
        if (f.id !== factorId) return f;
        const idVal = Number(nuevoID);
        const irNum = Math.floor((f.IS + idVal) / 2);
        const irTexto = MAPA_NUMERO_A_TEXTO_IR[irNum] || "Irrelevante";
        const relevante = irNum > 1;

        return {
          ...f,
          ID: idVal,
          IR: `${irNum} · ${irTexto}`,
          relevante: relevante,
          alcance: f.nombre === "Soporte" && !relevante ? "" : f.alcance,
        };
      })
    );
  };

  // Actualizar alcance de Soporte (Interno / Externo)
  const updateFactorAlcance = (factorId, nuevoAlcance) => {
    setFactores((prev) =>
      prev.map((f) => (f.id === factorId ? { ...f, alcance: nuevoAlcance } : f))
    );
  };

  // Actualizar calificación de un subfactor
  const updateSubfactorScore = (factorId, sfCodigo, nota, observacion = null) => {
    setSubfactoresState((prev) => {
      const list = prev[factorId] || [];
      const updated = list.map((item) => {
        if (item.codigo !== sfCodigo) return item;
        return {
          ...item,
          calificacion: Number(nota),
          observacion: observacion !== null ? observacion : item.observacion,
        };
      });
      return { ...prev, [factorId]: updated };
    });
  };

  // 7. Cálculos en tiempo real según la Regla de Oro
  const calculationSummary = useMemo(() => {
    const relevantes = factores.filter((f) => f.relevante);
    const irrelevantes = factores.filter((f) => !f.relevante);

    // Calcular ponderación media por factor relevante evaluado
    let factoresEvaluados = [];
    let strengths = 0;
    let opportunities = 0;
    let weaknesses = 0;
    let threats = 0;
    let totalCriticos = 0;

    relevantes.forEach((factor) => {
      const sfs = subfactoresState[factor.id] || [];
      const calificados = sfs.filter((s) => s.calificacion !== undefined);
      const pm =
        calificados.length > 0
          ? calificados.reduce((acc, s) => acc + s.calificacion, 0) / calificados.length
          : 0;

      const alcanceEfectivo = factor.alcance || "Externo";
      const isPositive = pm >= 3.0;

      let foda = "";
      if (alcanceEfectivo === "Interno") {
        foda = isPositive ? "Fortaleza" : "Debilidad";
      } else {
        foda = isPositive ? "Oportunidad" : "Amenaza";
      }

      if (foda === "Fortaleza") strengths++;
      if (foda === "Oportunidad") opportunities++;
      if (foda === "Debilidad") weaknesses++;
      if (foda === "Amenaza") threats++;

      // Es Crítico si es Debilidad o Amenaza y la Importancia Relativa es Importante o Fundamental
      const isCritical =
        (foda === "Debilidad" || foda === "Amenaza") &&
        (factor.IR?.includes("Importante") || factor.IR?.includes("Fundamental"));

      if (isCritical) totalCriticos++;

      factoresEvaluados.push({
        ...factor,
        PM: pm,
        PM_str: pm.toFixed(1).replace(".", ","),
        foda,
        isCritical,
        completado: calificados.length === sfs.length,
      });
    });

    // Dictamen: A si todo F u O; B si D o A solo en Opcionales; C si al menos un Crítico
    let recomendacion = "C";
    let dictamenTitulo = "Requiere recursos antes de adoptar";
    if (totalCriticos > 0) {
      recomendacion = "C";
      dictamenTitulo = "Requiere recursos antes de adoptar";
    } else if (weaknesses > 0 || threats > 0) {
      recomendacion = "B";
      dictamenTitulo = "Es posible adoptar con sugerencias por revisar";
    } else if (relevantes.length > 0) {
      recomendacion = "A";
      dictamenTitulo = "Adoptar sin observaciones";
    }

    // Índice de Viabilidad = (F + O / Relevantes evaluados) * 100
    const viabilidad =
      relevantes.length > 0
        ? Math.round(((strengths + opportunities) / relevantes.length) * 100)
        : 0;

    // Nivel de Confianza: % de respuestas distintas de 2 (Desconozco)
    let totalSubfactoresRelevantes = 0;
    let respuestasConocidas = 0;
    relevantes.forEach((factor) => {
      const sfs = subfactoresState[factor.id] || [];
      totalSubfactoresRelevantes += sfs.length;
      respuestasConocidas += sfs.filter((s) => s.calificacion !== 2).length;
    });

    const ratioConfianza =
      totalSubfactoresRelevantes > 0
        ? (respuestasConocidas / totalSubfactoresRelevantes) * 100
        : 100;

    let nivelConfianza = "Alta";
    if (ratioConfianza < 60) nivelConfianza = "Baja";
    else if (ratioConfianza < 90) nivelConfianza = "Media";

    // Validar si todos los subfactores relevantes están calificados
    const todosSubfactoresCalificados =
      relevantes.length > 0 &&
      relevantes.every((f) => {
        const sfs = subfactoresState[f.id] || [];
        return sfs.length > 0 && sfs.every((s) => s.calificacion >= 1);
      });

    return {
      totalFactores: factores.length,
      totalRelevantes: relevantes.length,
      totalIrrelevantes: irrelevantes.length,
      factoresEvaluados,
      strengths,
      opportunities,
      weaknesses,
      threats,
      totalCriticos,
      recomendacion,
      dictamenTitulo,
      viabilidad,
      nivelConfianza,
      todosSubfactoresCalificados,
      puedeAvanzarPaso2: relevantes.length > 0,
      puedeAvanzarPaso3: todosSubfactoresCalificados,
    };
  }, [factores, subfactoresState]);

  // Login handler
  const login = async (email, password, remember) => {
    const data = await apiService.login(email, password, remember);
    setCurrentUser(data.user);
    if (data.isLiveApi) setIsBackendConnected(true);
    return data;
  };

  const logout = () => {
    apiService.logout();
    setCurrentUser(null);
  };

  return (
    <EvaluationContext.Provider
      value={{
        currentUser,
        login,
        logout,
        evaluacionId,
        setEvaluacionId,
        isBackendConnected,
        saveStatus,
        setSaveStatus,
        softwareActivo,
        setSoftwareActivo,
        contextoActivo,
        setContextoActivo,
        descripcionCaso,
        setDescripcionCaso,
        factores,
        setFactores,
        subfactoresState,
        setSubfactoresState,
        updateFactorID,
        updateFactorAlcance,
        updateSubfactorScore,
        sincronizarPaso1ConBackend,
        sincronizarPaso2ConBackend,
        ...calculationSummary,
      }}
    >
      {children}
    </EvaluationContext.Provider>
  );
};

export const useEvaluation = () => {
  const context = useContext(EvaluationContext);
  if (!context) {
    throw new Error("useEvaluation debe ser usado dentro de un EvaluationProvider");
  }
  return context;
};
