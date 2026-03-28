// Simple API route to test if API routing is working
export async function GET(request: Request): Promise<Response> {
  try {
    console.log('🔍 Debug API route hit:', request.url);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'API routing is working!',
      url: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
      headers: Object.fromEntries(request.headers.entries())
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  } catch (error) {
    console.error('❌ Debug API error:', error);
    return new Response(JSON.stringify({ 
      error: 'Debug API error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST(request: Request): Promise<Response> {
  return GET(request);
}

export async function OPTIONS(request: Request): Promise<Response> {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}