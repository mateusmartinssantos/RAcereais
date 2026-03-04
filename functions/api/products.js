// functions/api/products.js
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
            console.error('NEON_DATABASE_URL não configurada');
            return new Response(JSON.stringify({ 
                error: 'Configuração do banco de dados ausente' 
            }), { 
                status: 500, 
                headers 
            });
        }

        // Usar a API HTTP do Neon
        const response = await fetch(env.NEON_DATABASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: `
                    SELECT 
                        p.*, 
                        c.name AS category_name, 
                        c.id AS category_id
                    FROM products p
                    LEFT JOIN categories c ON p.category_id = c.id
                    WHERE p.active = true
                    ORDER BY p.created_at DESC
                `
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Erro Neon:', errorText);
            throw new Error(`Neon respondeu com status ${response.status}`);
        }

        const data = await response.json();
        
        return new Response(JSON.stringify(data.rows || []), { 
            status: 200, 
            headers 
        });

    } catch (err) {
        console.error('Erro detalhado:', err);
        
        return new Response(JSON.stringify({ 
            error: err.message,
            stack: err.stack 
        }), { 
            status: 500, 
            headers 
        });
    }
}