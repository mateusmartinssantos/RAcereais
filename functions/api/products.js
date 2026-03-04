// functions/api/products.js
import { neon } from '@neondatabase/serverless';

export async function onRequest(context) {
    try {
        const { env } = context;
        
        // Usar a connection string das env vars com o cliente Neon
        const sql = neon(env.NEON_DATABASE_URL);
        
        // Fazer a query SQL diretamente
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
        
        // Retornar os dados como JSON
        return new Response(JSON.stringify(products), {
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
        });
        
    } catch (err) {
        console.error('Erro na API de produtos:', err);
        
        return new Response(JSON.stringify({ 
            error: err.message,
            details: 'Erro ao buscar produtos do banco de dados'
        }), { 
            status: 500,
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        });
    }
}