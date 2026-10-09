// Minecraft "server list ping": the same request the multiplayer menu makes.
// It answers with the player count without logging in or touching the
// server's files. Used by the metrics agent and the free plan worker.

import net from "node:net";

function varint(n) {
  const out = [];
  do {
    let b = n & 0x7f;
    n >>>= 7;
    if (n) b |= 0x80;
    out.push(b);
  } while (n);
  return Buffer.from(out);
}

function readVarint(buf, offset) {
  let value = 0;
  for (let i = 0; i < 5; i++) {
    if (offset + i >= buf.length) return null;
    const b = buf[offset + i];
    value |= (b & 0x7f) << (7 * i);
    if (!(b & 0x80)) return [value, offset + i + 1];
  }
  return null;
}

const packet = (...parts) => {
  const body = Buffer.concat(parts);
  return Buffer.concat([varint(body.length), body]);
};

// Resolves to { online, max } or null when the server doesn't answer (still
// booting, stopped, or not a Minecraft server).
export function pingPlayers(port, host = "127.0.0.1") {
  return new Promise((resolve) => {
    const sock = net.connect({ host, port });
    let buf = Buffer.alloc(0);
    let done = false;
    const finish = (v) => {
      if (done) return;
      done = true;
      sock.destroy();
      resolve(v);
    };
    sock.setTimeout(3000, () => finish(null));
    sock.on("error", () => finish(null));
    sock.on("connect", () => {
      const hostBuf = Buffer.from(host);
      const portBuf = Buffer.alloc(2);
      portBuf.writeUInt16BE(port);
      // Handshake (protocol 47 is fine for a status request) + status request.
      sock.write(packet(varint(0), varint(47), varint(hostBuf.length), hostBuf, portBuf, varint(1)));
      sock.write(packet(varint(0)));
    });
    sock.on("data", (chunk) => {
      buf = Buffer.concat([buf, chunk]);
      const len = readVarint(buf, 0);
      if (!len || buf.length < len[1] + len[0]) return;
      const id = readVarint(buf, len[1]);
      const strLen = id && readVarint(buf, id[1]);
      if (!strLen) return finish(null);
      try {
        const status = JSON.parse(buf.subarray(strLen[1], strLen[1] + strLen[0]).toString("utf8"));
        finish({ online: status.players?.online ?? 0, max: status.players?.max ?? null });
      } catch {
        finish(null);
      }
    });
  });
}
