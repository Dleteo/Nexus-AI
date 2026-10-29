import type { FileMap } from './core';
// ZIP "store": bounded UTF-8 text files, CRC-32, no third-party dependency.
export function zipFiles(files: FileMap): Uint8Array<ArrayBuffer> {
  const enc = new TextEncoder();
  const chunks: Uint8Array[] = [], central: Uint8Array[] = [];
  let offset = 0;
  const crc32 = (data: Uint8Array) => { let crc = 0xffffffff; for (const b of data) { crc ^= b; for (let k = 0; k < 8; k++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1)); } return (crc ^ 0xffffffff) >>> 0; };
  for (const [path, text] of Object.entries(files)) {
    if (path.startsWith('/') || path.split('/').includes('..') || !/^[\w./-]+$/.test(path)) throw new Error('Ruta ZIP no válida.');
    const name = enc.encode(path), data = enc.encode(text);
    if (data.length > 100000 || name.length > 200) throw new Error('Archivo demasiado grande.');
    const crc = crc32(data);
    const h = new Uint8Array(30 + name.length), v = new DataView(h.buffer);
    v.setUint32(0, 0x04034b50, true); v.setUint16(4, 20, true); v.setUint16(6, 0x800, true); v.setUint16(12, 33, true);
    v.setUint32(14, crc, true); v.setUint32(18, data.length, true); v.setUint32(22, data.length, true); v.setUint16(26, name.length, true); h.set(name, 30);
    chunks.push(h, data);
    const c = new Uint8Array(46 + name.length), cv = new DataView(c.buffer);
    cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 20, true); cv.setUint16(8, 0x800, true); cv.setUint16(14, 33, true);
    cv.setUint32(16, crc, true); cv.setUint32(20, data.length, true); cv.setUint32(24, data.length, true); cv.setUint16(28, name.length, true); cv.setUint32(42, offset, true); c.set(name, 46); central.push(c);
    offset += h.length + data.length;
  }
  const size = central.reduce((n, c) => n + c.length, 0), end = new Uint8Array(22), ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true); ev.setUint16(8, central.length, true); ev.setUint16(10, central.length, true); ev.setUint32(12, size, true); ev.setUint32(16, offset, true);
  const result = new Uint8Array(offset + size + 22); let at = 0;
  for (const chunk of [...chunks, ...central, end]) { result.set(chunk, at); at += chunk.length; }
  return result;
}
