import type { APIRoute } from 'astro';
import { db, schema } from '../../db';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

export const prerender = false;

interface CreateTransactionPayload {
  amount?: number | string;
  category_id?: number | string;
  description?: string | null;
  date?: string | null;
  payment_method?: string;
}

// GET: Consultar transacciones recientes
export const GET: APIRoute = async () => {
  try {
    const list = await db
      .select({
        id: schema.transactions.id,
        amount: schema.transactions.amount,
        description: schema.transactions.description,
        paymentMethod: schema.transactions.payment_method,
        date: schema.transactions.date,
        categoryId: schema.transactions.category_id,
        categoryName: schema.categories.name,
        categoryIcon: schema.categories.icon,
      })
      .from(schema.transactions)
      .leftJoin(schema.categories, eq(schema.transactions.category_id, schema.categories.id))
      .orderBy(desc(schema.transactions.date))
      .limit(30);

    return new Response(JSON.stringify({ success: true, data: list }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error al obtener transacciones';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// POST: Registrar gasto con Bloqueo Duro (Hard Stop) si supera el límite
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = (await request.json()) as CreateTransactionPayload;
    const { amount, category_id, description, date, payment_method } = body;

    const parsedAmount = Number(amount);
    const parsedCategoryId = Number(category_id);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Monto inválido. Debe ingresar un valor mayor a cero.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!parsedCategoryId || isNaN(parsedCategoryId)) {
      return new Response(
        JSON.stringify({ error: 'Debe seleccionar una categoría válida.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validar método de pago (Modo Supervivencia: DEBITO_EFECTIVO o TARJETA_CREDITO)
    const validPaymentMethods = ['DEBITO_EFECTIVO', 'TARJETA_CREDITO'];
    const validatedPaymentMethod = validPaymentMethods.includes(payment_method)
      ? payment_method
      : 'DEBITO_EFECTIVO';

    // 1. Obtener la categoría y su límite mensual
    const [category] = await db
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.id, parsedCategoryId))
      .limit(1);

    if (!category) {
      return new Response(
        JSON.stringify({ error: 'La categoría especificada no existe.' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const transactionDate = date ? new Date(date) : new Date();
    const currentYear = transactionDate.getFullYear();
    const currentMonth = transactionDate.getMonth();

    const startOfMonth = new Date(currentYear, currentMonth, 1, 0, 0, 0, 0);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);

    // 2. Sumar transacciones del mes actual para la categoría
    const monthlyTransactions = await db
      .select({ amount: schema.transactions.amount })
      .from(schema.transactions)
      .where(
        and(
          eq(schema.transactions.category_id, parsedCategoryId),
          gte(schema.transactions.date, startOfMonth),
          lte(schema.transactions.date, endOfMonth)
        )
      );

    const currentSpent = monthlyTransactions.reduce(
      (sum, item) => sum + parseFloat(item.amount),
      0
    );

    const monthlyLimit = parseFloat(category.monthly_limit);
    const projectedTotal = currentSpent + parsedAmount;

    // Determinar si es compromiso intocable fijo predefinido
    const isUntouchableCommitment =
      category.name.toLowerCase().includes('maestr') ||
      category.name.toLowerCase().includes('deuda') ||
      category.name.toLowerCase().includes('préstamo');

    // 🛑 REGLA DE NEGOCIO CRÍTICA (Hard Stop):
    // No aplica Hard Stop para compromisos fijos predefinidos (Maestría y Deudas fijas)
    if (!isUntouchableCommitment && projectedTotal > monthlyLimit) {
      const isOcio =
        category.name.toLowerCase().includes('ocio') ||
        category.name.toLowerCase().includes('hormiga');

      const errorMessage = isOcio
        ? 'Límite de Ocio superado. Regla de Hard Stop activa, compra bloqueada.'
        : 'Límite excedido. Transacción bloqueada.';

      return new Response(
        JSON.stringify({
          error: errorMessage,
          details: {
            categoryName: category.name,
            monthlyLimit: monthlyLimit.toFixed(2),
            currentSpent: currentSpent.toFixed(2),
            attemptedAmount: parsedAmount.toFixed(2),
            projectedTotal: projectedTotal.toFixed(2),
            exceededBy: (projectedTotal - monthlyLimit).toFixed(2),
          },
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 3. Si es válido, insertar en Neon y retornar HTTP 200
    const [newTransaction] = await db
      .insert(schema.transactions)
      .values({
        amount: parsedAmount.toFixed(2),
        category_id: parsedCategoryId,
        description: description ? String(description).trim() : null,
        payment_method: validatedPaymentMethod,
        date: transactionDate,
      })
      .returning();

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Transacción registrada exitosamente.',
        data: newTransaction,
        summary: {
          categoryName: category.name,
          paymentMethod: validatedPaymentMethod,
          monthlyLimit: monthlyLimit.toFixed(2),
          newTotalSpent: projectedTotal.toFixed(2),
          remaining: (monthlyLimit - projectedTotal).toFixed(2),
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    console.error('Error en POST /api/transactions:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor.';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
