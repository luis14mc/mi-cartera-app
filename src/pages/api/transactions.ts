import type { APIRoute } from 'astro';
import { db, schema } from '../../db';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { getLiveUsdHnlRate } from './exchange-rate';

export const prerender = false;

// GET: Obtener transacciones recientes con desglose bimoneda
export const GET: APIRoute = async () => {
  try {
    const allTransactions = await db
      .select({
        id: schema.transactions.id,
        amount: schema.transactions.amount, // En Lempiras
        currency: schema.transactions.currency,
        originalAmount: schema.transactions.original_amount,
        exchangeRate: schema.transactions.exchange_rate,
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
      .limit(30);

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

// POST: Registrar nuevo gasto con conversión en tiempo real
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { amount, currency = 'HNL', exchange_rate, category_id, description, date } = body;

    const parsedAmount = Number(amount);
    const parsedCategoryId = Number(category_id);
    const selectedCurrency = currency === 'USD' ? 'USD' : 'HNL';

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

    // Obtener la tasa de cambio en vivo si la moneda es USD
    let appliedRate = 1.0;
    if (selectedCurrency === 'USD') {
      if (exchange_rate && !isNaN(Number(exchange_rate)) && Number(exchange_rate) > 0) {
        appliedRate = Number(exchange_rate);
      } else {
        const liveInfo = await getLiveUsdHnlRate();
        appliedRate = liveInfo.rate;
      }
    }

    // 1. Obtener la categoría y su límite mensual en Lempiras
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

    // 2. Convertir el gasto a Lempiras (HNL) con la tasa en tiempo real
    const amountInHnl = selectedCurrency === 'USD' ? parsedAmount * appliedRate : parsedAmount;

    const transactionDate = date ? new Date(date) : new Date();
    const currentYear = transactionDate.getFullYear();
    const currentMonth = transactionDate.getMonth();

    const startOfMonth = new Date(currentYear, currentMonth, 1, 0, 0, 0, 0);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);

    // 3. Sumar las transacciones del mes actual de esa categoría (en Lempiras)
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

    const currentSpentHnl = monthlyTransactions.reduce(
      (sum, item) => sum + parseFloat(item.amount),
      0
    );

    const monthlyLimitHnl = parseFloat(category.monthly_limit);
    const projectedTotalHnl = currentSpentHnl + amountInHnl;

    // 4. Validar si el nuevo gasto supera el monthly_limit en Lempiras
    if (projectedTotalHnl > monthlyLimitHnl) {
      const excessHnl = (projectedTotalHnl - monthlyLimitHnl).toFixed(2);
      return new Response(
        JSON.stringify({
          error: `Gasto rechazado: este registro excede el límite mensual de la categoría "${category.name}".`,
          details: {
            categoryName: category.name,
            currency: selectedCurrency,
            rateUsed: appliedRate.toFixed(4),
            monthlyLimit: `L. ${monthlyLimitHnl.toLocaleString('es-HN', { minimumFractionDigits: 2 })}`,
            currentSpent: `L. ${currentSpentHnl.toLocaleString('es-HN', { minimumFractionDigits: 2 })}`,
            attemptedAmount: selectedCurrency === 'USD'
              ? `$${parsedAmount.toFixed(2)} USD (convertido a L. ${amountInHnl.toFixed(2)} a tasa L. ${appliedRate.toFixed(2)})`
              : `L. ${parsedAmount.toFixed(2)}`,
            projectedTotal: `L. ${projectedTotalHnl.toLocaleString('es-HN', { minimumFractionDigits: 2 })}`,
            exceededBy: `L. ${excessHnl}`,
          },
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 5. Registrar la transacción con trazabilidad de la tasa de conversión
    const [newTransaction] = await db
      .insert(schema.transactions)
      .values({
        amount: amountInHnl.toFixed(2), // Consolidado en Lempiras
        currency: selectedCurrency,
        original_amount: parsedAmount.toFixed(2),
        exchange_rate: appliedRate.toFixed(4),
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
          currency: selectedCurrency,
          originalAmount: parsedAmount.toFixed(2),
          rateUsed: appliedRate.toFixed(4),
          amountInHnl: amountInHnl.toFixed(2),
          monthlyLimitHnl: monthlyLimitHnl.toFixed(2),
          newTotalSpentHnl: projectedTotalHnl.toFixed(2),
          remainingBudgetHnl: (monthlyLimitHnl - projectedTotalHnl).toFixed(2),
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
