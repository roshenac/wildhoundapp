window.WH_BACKUP_SERVICE = (function () {
  function bytesToBase64(bytes) {
    var bin = "";
    bytes.forEach(function (b) { bin += String.fromCharCode(b); });
    return btoa(bin);
  }

  function base64ToBytes(base64) {
    var bin = atob(base64);
    var out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
    return out;
  }

  async function deriveBackupKey(passphrase, saltBytes) {
    var enc = new TextEncoder();
    var baseKey = await crypto.subtle.importKey("raw", enc.encode(passphrase), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey(
      { name: "PBKDF2", salt: saltBytes, iterations: 120000, hash: "SHA-256" },
      baseKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  async function encryptJson(plainJson, passphrase) {
    var enc = new TextEncoder();
    var iv = crypto.getRandomValues(new Uint8Array(12));
    var salt = crypto.getRandomValues(new Uint8Array(16));
    var key = await deriveBackupKey(passphrase, salt);
    var cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, enc.encode(plainJson));
    return {
      encrypted: true,
      kdf: "PBKDF2-SHA256",
      cipher: "AES-GCM-256",
      salt: bytesToBase64(salt),
      iv: bytesToBase64(iv),
      data: bytesToBase64(new Uint8Array(cipher))
    };
  }

  async function decryptJson(encryptedPayload, passphrase) {
    var salt = base64ToBytes(String(encryptedPayload.salt || ""));
    var iv = base64ToBytes(String(encryptedPayload.iv || ""));
    var data = base64ToBytes(String(encryptedPayload.data || ""));
    var key = await deriveBackupKey(passphrase, salt);
    var plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, data);
    return new TextDecoder().decode(new Uint8Array(plain));
  }

  return {
    encryptJson: encryptJson,
    decryptJson: decryptJson
  };
})();
