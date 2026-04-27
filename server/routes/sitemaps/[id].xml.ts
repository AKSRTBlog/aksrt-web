import { getHeader, getRouterParam } from 'h3';
import { buildSitemapPayload, renderSitemap, splitSitemapEntries } from '../../utils/sitemap';

const XML_HEADERS = {
  'content-type': 'application/xml; charset=utf-8',
  'cache-control': 'max-age=3600',
};

export default defineEventHandler(async (event) => {
  const id = Number.parseInt(getRouterParam(event, 'id') || '', 10);
  if (!Number.isInteger(id) || id < 1) {
    return new Response('Not found', { status: 404 });
  }

  const { baseUrl, entries } = await buildSitemapPayload();
  if (!baseUrl) {
    return new Response('<!-- sitemap disabled: canonical URL not configured -->', {
      headers: { 'content-type': 'text/xml; charset=utf-8' },
    });
  }

  const chunk = splitSitemapEntries(entries)[id - 1];
  if (!chunk) {
    return new Response('Not found', { status: 404 });
  }

  const body = renderSitemap(chunk);
  const acceptEncoding = getHeader(event, 'accept-encoding') || '';
  if (acceptEncoding.includes('gzip')) {
    const zlib = await import('node:zlib');
    const compressed = zlib.gzipSync(Buffer.from(body, 'utf-8'));
    return new Response(compressed, {
      headers: {
        ...XML_HEADERS,
        'content-encoding': 'gzip',
      },
    });
  }

  return new Response(body, { headers: XML_HEADERS });
});
