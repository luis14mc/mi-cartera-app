import type { APIRoute } from 'astro';

export const prerender = false;

// Cache en memoria para optimizar velocidad y no exceder llamadas externas
let cachedRate: { rate: number; timestamp: number; formattedDate: string } | null = null;
const CACHE_DURATION_MS = 15 * 60 * 1000; // 15 minutos de caché

export async function getLiveUsdHnlRate(): Promise<{ rate: number; source: string; lastUpdated: string }> {
  const now = Date.now();

  if (cachedRate && now - cachedRate.timestamp < CACHE_DURATION_MS) {
    return {
      rate: cachedRate.rate,
      source: 'cache',
      lastUpdated: cachedRate.formattedDate,
    };
  }

  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(4000), // Timeout de 4 segundos
    });

    if (res.ok) {
      const data = await res.json();
      const hnlRate = parseFloat(data.rates?.HNL);

      if (hnlRate && !isNaN(hnlRate)) {
        const roundedRate = Math.round(hnlRate * 100) / 100;
        const lastUpdated = data.time_last_update_utc || new Date().toISOString();
        cachedRate = {
          rate: roundedRate,
          timestamp: now,
          formattedDate: lastUpdated,
        };

        return {
          rate: roundedRate,
          source: 'live-api',
          lastUpdated,
        };
      }
    }
  } catch (error) {
    console.warn('⚠️ No se pudo obtener la tasa en vivo, usando última conocida o fallback:', error);
  }

  // Fallback seguro si falla la conexión externa
  const fallbackRate = cachedRate?.rate || 25.50;
  return {
    rate: fallbackRate,
    source: cachedRate ? 'stale-cache' : 'fallback',
    lastUpdated: cachedRate?.formattedDate || new Date().toISOString(),
  };
}

export const GET: APIRoute = async () => {
  try {
    const result = await getLiveUsdHnlRate();

    return new Response(
      JSON.stringify({
        success: true,
        base: 'USD',
        target: 'HNL',
        rate: result.rate,
        rateFormatted: `L. ${result.rate.toFixed(2)}`,
        source: result.source,
        lastUpdated: result.lastUpdated,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Error al obtener la tasa' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
