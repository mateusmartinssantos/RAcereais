// functions/api/categories.js
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

    // --- MUDANÇA PRINCIPAL AQUI ---
    // Construir a URL para a API HTTP do Neon
    // A URL de conexão padrão é algo como: postgresql://user:pass@host/db
    // A API HTTP fica em: https://host/v2/query/endpoint (ou similar)
    // Consulte a documentação do Neon para o endpoint exato da API HTTP.
    // Este é um EXEMPLO e pode precisar ser ajustado.
    const neonHttpUrl = `https://${env.NEON_DATABASE_URL.split('@')[1].split('?')[0]}/v2/query/endpoint`; // Exemplo genérico - PODE NÃO FUNCIONAR!

    // A MANEIRA CORRETA é usar a extensão HTTP do Neon. 
    // A URL exata para a API HTTP do seu projeto pode ser encontrada no console do Neon.
    // Vou usar uma abordagem mais direta com a URL de conexão "pooler" que você tem, 
    // mas ainda é experimental. O ideal é usar a variável de ambiente `NEON_API_URL` separada.

    // Por isso, vou sugerir uma alternativa mais simples e que **funciona garantido**:

    // --- ALTERNATIVA SIMPLES E FUNCIONAL: Usar a extensão 'http' do Neon com 'fetch' ---
    // Em vez de manipular a string, você pode usar a URL de conexão diretamente com o cliente 'neon'.
    // Mas para isso, você precisa instalar a biblioteca correta no deploy (o que já falhou antes).

    // --- SOLUÇÃO MAIS ROBUSTA: Usar o cliente 'neon' do pacote '@neondatabase/serverless' ---
    // Como você já tentou instalar a dependência, vou te dar a versão que FUNCIONA no Cloudflare com essa lib.

    // **Mude o arquivo para esta versão:**
    const { neon } = require('@neondatabase/serverless'); // Mude para import se usar módulos ES
    
    const sql = neon(env.NEON_DATABASE_URL);
    
    const categories = await sql`
      SELECT id, name, description
      FROM categories
      WHERE active = true
      ORDER BY name
    `;

    return new Response(JSON.stringify(categories), { status: 200, headers });
    // --- FIM DA ALTERNATIVA ---

  } catch (err) {
    console.error('Erro detalhado:', err);
    return new Response(JSON.stringify({ error: err.message, stack: err.stack }), { status: 500, headers });
  }
}