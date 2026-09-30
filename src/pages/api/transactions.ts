import type { APIRoute } from 'astro';
import { db, schema } from '../../db';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

export const prerender = false;

// GET: Obtener transacciones recientes y resumen mensual
export const GET: APIRoute = async () => {
  try {
    const allTransactions = await db
      .select({
        id: schema.transactions.id,
        amount: schema.transactions.amount,
        description: schema.transactions.description,
        date: schema.transactions.date,
        categoryId: schema.transactions.category_id,
        categoryName: schema.categories.name,
      })
      .from(schema.transactions)
      .leftJoin(
        schema.categories,
        eq(schema.transactions.category_id, schema.categories.id)
      )
      .orderBy(desc(schema.transactions.date))
      .limit(20);

    return new Response(JSON.stringify({ success: true, data: allTransactions }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Error al obtener transacciones' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// POST: Registrar nuevo gasto con validación de límite mensual
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { amount, category_id, description, date } = body;

    const parsedAmount = Number(amount);
    const parsedCategoryId = Number(category_id);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return new Response(
        JSON.stringify({ error: 'El monto ingresado debe ser un número mayor a cero.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!parsedCategoryId || isNaN(parsedCategoryId)) {
      return new Response(
        JSON.stringify({ error: 'Debe especificar una categoría válida.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

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

    // 2. Sumar las transacciones del mes actual de esa categoría
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

    // 3. Validar si el nuevo gasto supera el monthly_limit
    if (projectedTotal > monthlyLimit) {
      const excess = (projectedTotal - monthlyLimit).toFixed(2);
      return new Response(
        JSON.stringify({
          error: `Gasto rechazado: este registro excede el límite mensual de la categoría "${category.name}".`,
          details: {
            categoryName: category.name,
            monthlyLimit: monthlyLimit.toFixed(2),
            currentSpent: currentSpent.toFixed(2),
            attemptedAmount: parsedAmount.toFixed(2),
            projectedTotal: projectedTotal.toFixed(2),
            exceededBy: excess,
          },
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 4. Si no supera el límite, registrar la transacción
    const [newTransaction] = await db
      .insert(schema.transactions)
      .values({
        amount: parsedAmount.toFixed(2),
        category_id: parsedCategoryId,
        description: description ? String(description).trim() : null,
        date: transactionDate,
      })
      .returning();

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Gasto registrado con éxito.',
        data: newTransaction,
        summary: {
          categoryName: category.name,
          monthlyLimit: monthlyLimit.toFixed(2),
          newTotalSpent: projectedTotal.toFixed(2),
          remainingBudget: (monthlyLimit - projectedTotal).toFixed(2),
        },
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error en POST /api/transactions:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error interno al procesar la transacción.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
