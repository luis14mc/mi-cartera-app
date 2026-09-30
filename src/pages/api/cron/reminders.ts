import type { APIRoute } from 'astro';
import { db, schema } from '../../../db';
import { eq, and, gte, lte, asc } from 'drizzle-orm';

export const prerender = false;

const USD_RATE = 25.00; // Tasa de conversión de referencia Lps / USD

export const GET: APIRoute = async ({ request }) => {
  try {
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response(JSON.stringify({ error: 'No autorizado.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfThirdDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 23, 59, 59, 999);

    const upcomingPayments = await db
      .select()
      .from(schema.scheduled_payments)
      .where(
        and(
          eq(schema.scheduled_payments.is_paid, false),
          gte(schema.scheduled_payments.due_date, startOfToday),
          lte(schema.scheduled_payments.due_date, endOfThirdDay)
        )
      )
      .orderBy(asc(schema.scheduled_payments.due_date));

    const alerts = upcomingPayments.map((payment) => {
      const paymentDate = new Date(payment.due_date);
      const diffTime = paymentDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const isDay20 = paymentDate.getDate() === 20;
      const currency = payment.currency || 'HNL';
      const rawAmount = parseFloat(payment.amount);

      let formattedAmount = '';
      let amountInHnl = rawAmount;

      if (currency === 'USD') {
        amountInHnl = rawAmount * USD_RATE;
        formattedAmount = `$${rawAmount.toFixed(2)} USD (~L. ${amountInHnl.toLocaleString('es-HN', { minimumFractionDigits: 2 })})`;
      } else {
        formattedAmount = `L. ${rawAmount.toLocaleString('es-HN', { minimumFractionDigits: 2 })}`;
      }

      let urgency: 'HOY' | 'URGENTE' | 'PRÓXIMO' = 'PRÓXIMO';
      let message = '';

      if (diffDays <= 0) {
        urgency = 'HOY';
        message = `🚨 ¡URGENTE! El pago de "${payment.title}" por ${formattedAmount} vence HOY (${paymentDate.toLocaleDateString('es-HN')}).`;
      } else if (diffDays === 1) {
        urgency = 'URGENTE';
        message = `⚠️ El pago de "${payment.title}" por ${formattedAmount} vence MAÑANA.`;
      } else {
        message = `📅 Recordatorio: "${payment.title}" (${formattedAmount}) vence en ${diffDays} días (${paymentDate.toLocaleDateString('es-HN')}).`;
      }

      if (isDay20) {
        message += ' [Fecha de corte día 20]';
      }

      return {
        id: payment.id,
        title: payment.title,
        amount: rawAmount.toFixed(2),
        currency,
        amountInHnl: amountInHnl.toFixed(2),
        formattedAmount,
        dueDate: paymentDate.toISOString(),
        formattedDate: paymentDate.toLocaleDateString('es-HN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        daysRemaining: diffDays,
        isDay20,
        urgency,
        message,
      };
    });

    return new Response(
      JSON.stringify({
        success: true,
        executionTime: now.toISOString(),
        exchangeRateUsed: `1 USD = ${USD_RATE.toFixed(2)} HNL`,
        totalPendingAlerts: alerts.length,
        window: {
          from: startOfToday.toISOString(),
          to: endOfThirdDay.toISOString(),
        },
        alerts,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    console.error('Error en /api/cron/reminders:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Error al ejecutar cron job de recordatorios',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
