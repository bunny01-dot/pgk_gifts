import { NextRequest, NextResponse } from 'next/server';

// Proxy Firebase Storage videos to avoid CORS restrictions in browsers.
// The browser requests /api/video-proxy?url=<encoded firebase url>
// This server-side route fetches the video and streams it back with proper headers.

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawUrl = searchParams.get('url');

  if (!rawUrl) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  // Only allow Firebase Storage URLs for security
  let videoUrl: string;
  try {
    // searchParams.get() already decodes once — do NOT call decodeURIComponent again
    // Firebase Storage URLs contain intentional %2F in the path; double-decoding breaks them
    videoUrl = rawUrl;
    const parsed = new URL(videoUrl);
    if (!parsed.hostname.endsWith('firebasestorage.googleapis.com') &&
        !parsed.hostname.endsWith('storage.googleapis.com')) {
      return new NextResponse('Forbidden: only Firebase Storage URLs are allowed', { status: 403 });
    }
  } catch {
    return new NextResponse('Invalid URL', { status: 400 });
  }

  // Forward Range header so video seeking works
  const rangeHeader = req.headers.get('range');
  const fetchHeaders: Record<string, string> = {};
  if (rangeHeader) {
    fetchHeaders['Range'] = rangeHeader;
  }

  try {
    const upstream = await fetch(videoUrl, { headers: fetchHeaders });

    if (!upstream.ok && upstream.status !== 206) {
      return new NextResponse(`Upstream error: ${upstream.status}`, { status: upstream.status });
    }

    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', upstream.headers.get('content-type') || 'video/mp4');
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Cache-Control', 'public, max-age=86400, immutable');
    responseHeaders.set('Accept-Ranges', 'bytes');

    const contentLength = upstream.headers.get('content-length');
    if (contentLength) responseHeaders.set('Content-Length', contentLength);

    const contentRange = upstream.headers.get('content-range');
    if (contentRange) responseHeaders.set('Content-Range', contentRange);

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (err: any) {
    return new NextResponse(`Proxy error: ${err.message}`, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Type',
    },
  });
}
