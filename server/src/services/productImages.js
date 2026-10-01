import { randomUUID } from 'node:crypto';
import { lookup } from 'node:dns/promises';
import { mkdir, writeFile } from 'node:fs/promises';
import https from 'node:https';
import { BlockList, isIP } from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../uploads/products');
const MAX_BYTES = 5 * 1024 * 1024;
const blocked = new BlockList();
for (const [subnet, prefix] of [
  ['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8],
  ['169.254.0.0', 16], ['172.16.0.0', 12], ['192.0.0.0', 24], ['192.0.2.0', 24],
  ['192.168.0.0', 16], ['198.18.0.0', 15], ['198.51.100.0', 24],
  ['203.0.113.0', 24], ['224.0.0.0', 4], ['240.0.0.0', 4],
]) blocked.addSubnet(subnet, prefix, 'ipv4');
for (const [subnet, prefix] of [
  ['::', 128], ['::1', 128], ['fc00::', 7], ['fe80::', 10],
  ['ff00::', 8], ['::ffff:0:0', 96],
]) blocked.addSubnet(subnet, prefix, 'ipv6');

export const imageType = (buffer) => {
  if (buffer.length >= 3 && buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return 'jpg';
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return 'webp';
  return null;
};

export async function saveProductImage(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0 || buffer.length > MAX_BYTES) throw new Error('La imagen debe pesar menos de 5 MB');
  const type = imageType(buffer);
  if (!type) throw new Error('Usá una imagen JPG, PNG o WebP');
  await mkdir(directory, { recursive: true });
  const filename = `${randomUUID()}.${type}`;
  await writeFile(path.join(directory, filename), buffer, { flag: 'wx' });
  return `/uploads/products/${filename}`;
}

const safeAddress = async (hostname) => {
  if (isIP(hostname)) throw new Error('La imagen no proviene de un sitio público');
  const addresses = await lookup(hostname, { all: true });
  const publicAddress = addresses.find(({ address, family }) => !blocked.check(address, family === 4 ? 'ipv4' : 'ipv6'));
  if (!publicAddress) throw new Error('La imagen no proviene de un sitio público');
  return publicAddress;
};

const requestImage = async (address, redirects = 0) => {
  const url = new URL(address);
  if (url.protocol !== 'https:' || url.port && url.port !== '443' || url.username || url.password) {
    throw new Error('La imagen debe usar una URL HTTPS pública');
  }
  const resolved = await safeAddress(url.hostname);
  return new Promise((resolve, reject) => {
    const request = https.get(url, {
      timeout: 12000,
      headers: { Accept: 'image/jpeg,image/png,image/webp', 'User-Agent': 'GestlyProductImage/1.0' },
      lookup: (_hostname, options, callback) => options.all
        ? callback(null, [{ address: resolved.address, family: resolved.family }])
        : callback(null, resolved.address, resolved.family),
    }, async (response) => {
      if ([301, 302, 303, 307, 308].includes(response.statusCode)) {
        response.resume();
        if (redirects >= 3 || !response.headers.location) return reject(new Error('Demasiadas redirecciones de imagen'));
        try { resolve(await requestImage(new URL(response.headers.location, url).toString(), redirects + 1)); }
        catch (error) { reject(error); }
        return;
      }
      if (response.statusCode !== 200) { response.resume(); return reject(new Error('No se pudo descargar la imagen elegida')); }
      const chunks = [];
      let size = 0;
      response.on('data', (chunk) => {
        size += chunk.length;
        if (size > MAX_BYTES) { response.destroy(new Error('La imagen supera 5 MB')); return; }
        chunks.push(chunk);
      });
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    });
    request.on('timeout', () => request.destroy(new Error('La descarga tardó demasiado')));
    request.on('error', reject);
  });
};

export async function downloadProductImage(address) {
  return saveProductImage(await requestImage(address));
}
