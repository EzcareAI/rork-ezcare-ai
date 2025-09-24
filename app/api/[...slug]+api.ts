import app from '@/backend/hono';

// Handle all HTTP methods by forwarding to Hono app
export async function GET(request: Request): Promise<Response> {
  try {
    console.log('API GET request:', request.url);
    // Strip /api prefix from the URL for Hono
    const url = new URL(request.url);
    const pathWithoutApi = url.pathname.replace(/^\/api/, '') || '/';
    const newUrl = new URL(pathWithoutApi + url.search, url.origin);
    
    const modifiedRequest = new Request(newUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });
    
    const response = await app.fetch(modifiedRequest, {});
    console.log('API GET response status:', response.status);
    return response;
  } catch (error) {
    console.error('API GET error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    console.log('API POST request:', request.url);
    const url = new URL(request.url);
    console.log('Original pathname:', url.pathname);
    
    // Strip /api prefix from the URL for Hono
    const pathWithoutApi = url.pathname.replace(/^\/api/, '') || '/';
    console.log('Path without /api:', pathWithoutApi);
    
    const newUrl = new URL(pathWithoutApi + url.search, url.origin);
    console.log('New URL for Hono:', newUrl.toString());
    
    const modifiedRequest = new Request(newUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });
    
    console.log('Calling Hono app with:', modifiedRequest.method, modifiedRequest.url);
    const response = await app.fetch(modifiedRequest, {});
    console.log('API POST response status:', response.status);
    console.log('API POST response headers:', Object.fromEntries(response.headers.entries()));
    return response;
  } catch (error) {
    console.error('API POST error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function PUT(request: Request): Promise<Response> {
  try {
    // Strip /api prefix from the URL for Hono
    const url = new URL(request.url);
    const pathWithoutApi = url.pathname.replace(/^\/api/, '') || '/';
    const newUrl = new URL(pathWithoutApi + url.search, url.origin);
    
    const modifiedRequest = new Request(newUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });
    
    return await app.fetch(modifiedRequest, {});
  } catch (error) {
    console.error('API PUT error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function DELETE(request: Request): Promise<Response> {
  try {
    // Strip /api prefix from the URL for Hono
    const url = new URL(request.url);
    const pathWithoutApi = url.pathname.replace(/^\/api/, '') || '/';
    const newUrl = new URL(pathWithoutApi + url.search, url.origin);
    
    const modifiedRequest = new Request(newUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });
    
    return await app.fetch(modifiedRequest, {});
  } catch (error) {
    console.error('API DELETE error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function PATCH(request: Request): Promise<Response> {
  try {
    // Strip /api prefix from the URL for Hono
    const url = new URL(request.url);
    const pathWithoutApi = url.pathname.replace(/^\/api/, '') || '/';
    const newUrl = new URL(pathWithoutApi + url.search, url.origin);
    
    const modifiedRequest = new Request(newUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });
    
    return await app.fetch(modifiedRequest, {});
  } catch (error) {
    console.error('API PATCH error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function HEAD(request: Request): Promise<Response> {
  try {
    // Strip /api prefix from the URL for Hono
    const url = new URL(request.url);
    const pathWithoutApi = url.pathname.replace(/^\/api/, '') || '/';
    const newUrl = new URL(pathWithoutApi + url.search, url.origin);
    
    const modifiedRequest = new Request(newUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });
    
    return await app.fetch(modifiedRequest, {});
  } catch (error) {
    console.error('API HEAD error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function OPTIONS(request: Request): Promise<Response> {
  try {
    // Strip /api prefix from the URL for Hono
    const url = new URL(request.url);
    const pathWithoutApi = url.pathname.replace(/^\/api/, '') || '/';
    const newUrl = new URL(pathWithoutApi + url.search, url.origin);
    
    const modifiedRequest = new Request(newUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });
    
    return await app.fetch(modifiedRequest, {});
  } catch (error) {
    console.error('API OPTIONS error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}