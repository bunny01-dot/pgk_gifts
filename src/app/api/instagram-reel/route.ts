import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const reelUrl = searchParams.get('url');

  if (!reelUrl) {
    return NextResponse.json({ error: 'Missing reel URL' }, { status: 400 });
  }

  const instaMatch = reelUrl.match(/(?:instagram\.com|instagr\.am)\/(?:reel|p)\/([A-Za-z0-9_-]+)/);
  if (!instaMatch || !instaMatch[1]) {
    return NextResponse.json({ error: 'Invalid Instagram Reel URL' }, { status: 400 });
  }

  const shortcode = instaMatch[1];
  const targetUrl = `https://www.instagram.com/reel/${shortcode}/`;

  try {
    // Fetch Instagram HTML using bot user agents that Instagram serves OpenGraph meta tags to
    const userAgents = [
      'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Twitterbot/1.0'
    ];

    let directVideoUrl: string | null = null;
    let thumbnailUrl: string | null = null;

    for (const ua of userAgents) {
      const res = await fetch(targetUrl, {
        headers: {
          'User-Agent': ua,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        cache: 'no-store'
      });

      if (!res.ok) continue;

      const html = await res.text();

      // Extract og:video / og:video:secure_url
      const videoMatch = html.match(/property="og:video(?::secure_url)?"\s+content="([^"]+)"/) ||
                         html.match(/content="([^"]+)"\s+property="og:video(?::secure_url)?"/) ||
                         html.match(/"video_url":"([^"]+)"/);

      if (videoMatch && videoMatch[1]) {
        directVideoUrl = videoMatch[1].replace(/\\u0026/g, '&').replace(/&amp;/g, '&');
      }

      const imgMatch = html.match(/property="og:image"\s+content="([^"]+)"/) ||
                       html.match(/content="([^"]+)"\s+property="og:image"/) ||
                       html.match(/"display_url":"([^"]+)"/);

      if (imgMatch && imgMatch[1]) {
        thumbnailUrl = imgMatch[1].replace(/\\u0026/g, '&').replace(/&amp;/g, '&');
      }

      if (directVideoUrl) break;
    }

    if (directVideoUrl) {
      if (searchParams.get('format') === 'json') {
        return NextResponse.json({ videoUrl: directVideoUrl, thumbnailUrl });
      }

      // Proxy the MP4 video stream directly with CORS headers so browser <video> plays it natively
      const videoRes = await fetch(directVideoUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://www.instagram.com/'
        }
      });

      if (videoRes.ok) {
        const headers = new Headers();
        headers.set('Content-Type', videoRes.headers.get('content-type') || 'video/mp4');
        const contentLength = videoRes.headers.get('content-length');
        if (contentLength) headers.set('Content-Length', contentLength);
        headers.set('Access-Control-Allow-Origin', '*');
        headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');

        return new NextResponse(videoRes.body, {
          status: 200,
          headers
        });
      }

      return NextResponse.redirect(directVideoUrl, { status: 302 });
    }

    return NextResponse.json({ error: 'Direct video stream unavailable' }, { status: 404 });
  } catch (err: any) {
    console.error('Failed to resolve Instagram Reel video URL:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
