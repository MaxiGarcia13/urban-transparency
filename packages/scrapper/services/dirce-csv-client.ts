import { USER_AGENT } from '../utils/user-agent';

export const DIRCE_TABLE_4721_CSV_URL
  = 'https://www.ine.es/jaxiT3/files/t/csv_bdsc/4721.csv';

export async function fetchDirceTable4721Csv(
  url: string = DIRCE_TABLE_4721_CSV_URL,
): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'Accept': 'text/csv,text/plain,*/*',
      'User-Agent': USER_AGENT,
    },
  });
  if (!response.ok) {
    throw new Error(
      `Failed to download DIRCE table 4721 CSV: HTTP ${response.status}`,
    );
  }

  // Decode as UTF-8 regardless of Content-Type (often claims ISO-8859-15).
  return new TextDecoder('utf-8').decode(await response.arrayBuffer());
}
