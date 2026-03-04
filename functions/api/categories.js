// functions/api/categories.js
import { neon } from '@neondatabase/serverless';

export async function onRequest(context) {
    try {
        const { env } = context;
        
        // Usar a connection string das env vars
        const sql = neon(env.NEON_DATABASE_URL);
        
        // Fazer a query
        const categories = await sql`
            SELECT id, name, description
            FROM categories
            WHERE active = true
            ORDER BY name
        `;
        
        // Retornar JSON
        return new Response(JSON.stringify(categories), {
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}