import hdb from 'hdb';

let client;

function getClient() {
  if (client && client.readyState === 'connected') return Promise.resolve(client);
  return new Promise((resolve, reject) => {
    client = hdb.createClient({
      host:                   process.env.HANA_HOST,
      port:                   Number(process.env.HANA_PORT) || 443,
      user:                   process.env.HANA_USER,
      password:               process.env.HANA_PASSWORD,
      useTLS:                 true,
      rejectUnauthorized:     false,
    });
    client.connect((err) => {
      if (err) return reject(err);
      console.log('  ✓ HANA connected (hdb)');
      resolve(client);
    });
  });
}

export async function query(sql, params = []) {
  const c = await getClient();
  return new Promise((resolve, reject) => {
    c.exec(sql, params, (err, rows) => {
      if (err) {
        // force reconnect on next call
        client = null;
        return reject(err);
      }
      resolve(rows);
    });
  });
}

export const SCHEMA = '"PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"';
