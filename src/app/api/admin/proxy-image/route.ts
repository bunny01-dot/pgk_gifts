import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');

    if (!targetUrl) {
      return new Response('URL parameter is required', { status: 400 });
    }

    // SSRF Prevention: Restrict proxying to trusted Firebase Storage endpoints
    try {
      const parsedUrl = new URL(targetUrl);
      const allowedHosts = [
        'firebasestorage.googleapis.com',
      ];
      if (!allowedHosts.includes(parsedUrl.host)) {
        return new Response('Forbidden: Target URL domain is not allowed.', { status: 403 });
      }
    } catch (e) {
      return new Response('Invalid URL format', { status: 400 });
    }

    const response = await fetch(targetUrl);
    if (!response.ok) {
      return new Response(`Failed to fetch target URL: ${response.statusText}`, { status: response.status });
    }

    const blob = await response.blob();
    const contentType = response.headers.get('content-type') || 'application/octet-stream';

    return new Response(blob, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    console.error('Error in proxy-image route:', error);
    return new Response(`Proxy error: ${error.message}`, { status: 500 });
  }
}
