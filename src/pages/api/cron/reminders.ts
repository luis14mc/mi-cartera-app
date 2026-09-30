import type { APIRoute } from 'astro';
import { db, schema } from '../../../db';
import { eq } from 'drizzle-orm';

export const prerender = false;

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
    const currentDay = now.getDate();

    // Consultar compromisos y pagos programados activos
    const activePayments = await db
      .select()
      .from(schema.scheduled_payments)
      .where(eq(schema.scheduled_payments.is_active, true));

    // Filtrar pagos que vencen en los próximos 3 días (incluyendo el día de hoy)
    const alerts = activePayments
      .map((payment) => {
        const dueDay = payment.due_day;
        let daysRemaining = dueDay - currentDay;

        // Si ya pasó en este mes, calcular para el próximo
        if (daysRemaining < 0) {
          const daysInCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
          daysRemaining = daysInCurrentMonth - currentDay + dueDay;
        }

        const isUrgent = daysRemaining <= 3;
        const isDay20 = dueDay === 20;

        let message = '';
        if (daysRemaining === 0) {
          message = `🚨 ¡URGENTE HOY! Pago obligatorio de "${payment.title}" por L. ${parseFloat(payment.amount).toFixed(2)}.`;
        } else if (daysRemaining === 1) {
          message = `⚠️ ¡Vence Mañana! Recuerda reservar L. ${parseFloat(payment.amount).toFixed(2)} para "${payment.title}".`;
        } else {
          message = `📅 Aviso: "${payment.title}" por L. ${parseFloat(payment.amount).toFixed(2)} vence en ${daysRemaining} días (Día ${dueDay}).`;
        }

        return {
          id: payment.id,
          title: payment.title,
          amount: parseFloat(payment.amount).toFixed(2),
          dueDay,
          daysRemaining,
          isUrgent,
          isDay20,
          message,
        };
      })
      .filter((p) => p.isUrgent);

    return new Response(
      JSON.stringify({
        success: true,
        executionDate: now.toISOString(),
        alertsFound: alerts.length,
        currentDayOfMonth: currentDay,
        alerts,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
      }
    );
  } catch (error: any) {
    console.error('Error en /api/cron/reminders:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error en cron de recordatorios' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
