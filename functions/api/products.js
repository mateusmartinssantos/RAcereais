// functions/api/products.js
import { neon } from '@neondatabase/serverless';

export async function onRequest(context) {
  // Configurar CORS e headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  // Responder a preflight requests (OPTIONS)
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  try {
    const { env } = context;

    // Verificar se a variável de ambiente existe
    if (!env.NEON_DATABASE_URL) {
      return new Response(JSON.stringify({ error: 'Configuração do banco de dados ausente' }), { status: 500, headers });
    }

    // Usar o cliente 'neon' da biblioteca correta
    const sql = neon(env.NEON_DATABASE_URL);

    // Fazer a query SQL
    const products = await sql`
      SELECT 
        p.*, 
        c.name AS category_name, 
        c.id AS category_id
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.active = true
      ORDER BY p.created_at DESC
    `;

    return new Response(JSON.stringify(products), { status: 200, headers });

  } catch (err) {
    console.error('Erro detalhado na API de produtos:', err);
    return new Response(JSON.stringify({ error: err.message, stack: err.stack }), { status: 500, headers });
  }
}