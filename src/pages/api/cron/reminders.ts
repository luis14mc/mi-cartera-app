import type { APIRoute } from 'astro';
import { db, schema } from '../../../db';
import { eq, and, gte, lte, asc } from 'drizzle-orm';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  try {
    // Validación opcional de seguridad con CRON_SECRET de Vercel
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response(JSON.stringify({ error: 'No autorizado.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const now = new Date();
    // Inicio del día actual
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    // Ventana de 3 días completos hacia adelante
    const endOfThirdDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 23, 59, 59, 999);

    // Consultar pagos pendientes entre hoy y los próximos 3 días (is_paid = false)
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

    // Mapear alertas detalladas
    const alerts = upcomingPayments.map((payment) => {
      const paymentDate = new Date(payment.due_date);
      const diffTime = paymentDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const isDay20 = paymentDate.getDate() === 20;

      let urgency: 'HOY' | 'URGENTE' | 'PRÓXIMO' = 'PRÓXIMO';
      let message = '';

      if (diffDays <= 0) {
        urgency = 'HOY';
        message = `🚨 ¡URGENTE! El pago de "${payment.title}" por $${payment.amount} vence HOY (${paymentDate.toLocaleDateString('es-ES')}).`;
      } else if (diffDays === 1) {
        urgency = 'URGENTE';
        message = `⚠️ El pago de "${payment.title}" por $${payment.amount} vence MAÑANA.`;
      } else {
        message = `📅 Recordatorio: "${payment.title}" ($${payment.amount}) vence en ${diffDays} días (${paymentDate.toLocaleDateString('es-ES')}).`;
      }

      if (isDay20) {
        message += ' [Corte / Pago del día 20]';
      }

      return {
        id: payment.id,
        title: payment.title,
        amount: payment.amount,
        dueDate: paymentDate.toISOString(),
        formattedDate: paymentDate.toLocaleDateString('es-ES', {
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
