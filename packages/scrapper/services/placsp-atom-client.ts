import { Buffer } from 'node:buffer';
import https from 'node:https';
import { URL } from 'node:url';

import packageJson from '../package.json' with { type: 'json' };

const PLACSP_ATOM_FEED_URL
  = 'https://contrataciondelestado.es/sindicacion/sindicacion_643/licitacionesPerfilesContratanteCompleto3.atom';

const USER_AGENT = `${packageJson.name}/${packageJson.version}`;
const FETCH_TIMEOUT_MS = 60_000;

export function getPlacspAtomFeedUrl(): string {
  return PLACSP_ATOM_FEED_URL;
}

/** Fetch one Atom page. TLS verification disabled for known gov self-signed chain. */
export function fetchPlacspAtomPage(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const request = https.get(
      url,
      {
        rejectUnauthorized: false,
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'application/atom+xml, application/xml, text/xml, */*',
        },
        timeout: FETCH_TIMEOUT_MS,
      },
      (response) => {
        const statusCode = response.statusCode ?? 0;
        if (statusCode >= 300 && statusCode < 400 && response.headers.location) {
          response.resume();
          const redirectUrl = new URL(response.headers.location, url).toString();
          fetchPlacspAtomPage(redirectUrl).then(resolve, reject);
          return;
        }

        if (statusCode !== 200) {
          response.resume();
          reject(new Error(`PLACSP Atom fetch failed: HTTP ${statusCode} for ${url}`));
          return;
        }

        const chunks: Buffer[] = [];
        response.on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });
        response.on('end', () => {
          resolve(Buffer.concat(chunks).toString('utf8'));
        });
      },
    );

    request.on('error', reject);
    request.on('timeout', () => {
      request.destroy();
      reject(new Error(`PLACSP Atom fetch timed out for ${url}`));
    });
  });
}
