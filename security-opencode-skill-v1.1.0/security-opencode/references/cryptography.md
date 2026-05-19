# Cryptography Reference

Pragmatic crypto guidance for application code. When in doubt: **use a
high-level library that picks primitives for you** (libsodium, age, AWS
KMS, GCP KMS, Vault). Hand-rolled crypto is the second-most-common source
of cryptographic failures, after hand-rolled passwords.

---

## 1. Password storage

### Use (in order of preference)
1. **Argon2id** — `argon2-cffi` (Python), `argon2` (Node), `argon2`
   crate (Rust). Parameters: `time_cost=2, memory_cost=64*1024, parallelism=1`
   minimum; tune up to ~500ms per hash on your hardware.
2. **scrypt** — well-supported across languages. Parameters: `N=2^15,
   r=8, p=1` minimum.
3. **bcrypt** — `cost ≥ 12`. Note 72-byte input cap; pre-hash with SHA-256
   if you allow longer passphrases.

### Never use
- MD5, SHA-1, SHA-256 alone (no salt, no work factor)
- PBKDF2-SHA1 (broken; PBKDF2-SHA256 is OK but worse than the above)
- Plain encryption (passwords are hashed, never encrypted)
- Reversible obfuscation of any kind

### Verification
```python
import argon2
ph = argon2.PasswordHasher()
hashed = ph.hash("user-password")
try:
    ph.verify(hashed, "user-password")  # raises on mismatch
    if ph.check_needs_rehash(hashed):
        # parameters were upgraded; rehash and store
        hashed = ph.hash("user-password")
except argon2.exceptions.VerifyMismatchError:
    # bad password
    ...
```

---

## 2. Symmetric encryption

### Use
- **AES-256-GCM** for authenticated encryption with associated data
- **ChaCha20-Poly1305** when running on hardware without AES-NI

### Patterns (Python with `cryptography` library)
```python
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import os

key = AESGCM.generate_key(bit_length=256)
aesgcm = AESGCM(key)

nonce = os.urandom(12)        # 96 bits, MUST be unique per key
ciphertext = aesgcm.encrypt(nonce, plaintext, associated_data=b"context")
# Store: nonce || ciphertext (or both, separately)

# Decrypt
plaintext = aesgcm.decrypt(nonce, ciphertext, associated_data=b"context")
```

### Never
- AES-ECB (deterministic, leaks structure)
- AES-CBC without authentication (padding oracle attacks)
- Re-using a nonce with the same key (GCM nonce reuse is catastrophic)
- Hand-rolled CTR mode
- Storing the key alongside the ciphertext

---

## 3. Asymmetric / signatures

### Use
- **Ed25519** for signing (libsodium / `cryptography` library)
- **X25519** for key agreement
- **RSA-OAEP-SHA256** (≥2048 bit) for legacy compatibility
- **ECDSA P-256** with SHA-256 when Ed25519 isn't available

### Never
- RSA-PKCS1v1.5 (deprecated; uses prone to Bleichenbacher attacks)
- DSA (sensitive to RNG quality)
- Curves < P-256 / RSA < 2048

---

## 4. TLS

### Minimum config
- TLS 1.2 floor, TLS 1.3 preferred
- Disable: SSLv2, SSLv3, TLS 1.0, TLS 1.1, RC4, 3DES, DES, EXPORT ciphers
- Forward-secret cipher suites only (ECDHE-*, no plain RSA key exchange)

### Server cert validation
- Verify hostname against SAN/CN
- Verify against system or pinned CA bundle
- No `verify=False`, `rejectUnauthorized: false`, `InsecureSkipVerify`
- Certificate transparency: check SCT for public-facing services

### HSTS
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```
Preload only after you've verified all subdomains are HTTPS.

### mTLS for internal services
Pair with short-lived certs from an internal CA (cert-manager + step-ca,
or AWS Private CA, or HashiCorp Vault PKI).

---

## 5. Random numbers

### Use (per language)
| Language | Function |
|---|---|
| Python | `secrets.token_bytes(n)`, `secrets.token_urlsafe(n)`, `secrets.SystemRandom()` |
| Node.js | `crypto.randomBytes(n)`, `crypto.randomUUID()` |
| Go | `crypto/rand.Read`, `crypto/rand.Int` |
| Rust | `rand::rngs::OsRng` or `getrandom` crate |
| Java | `java.security.SecureRandom` (the no-arg constructor) |
| C# | `RandomNumberGenerator.Create()` |
| PHP | `random_bytes(n)`, `random_int($min, $max)` |
| Ruby | `SecureRandom.bytes(n)`, `SecureRandom.urlsafe_base64(n)` |

### Never use for security
- `Math.random()` (JS), `random.random()` (Python), `rand()` (C), `Random`
  class without `Secure` prefix

---

## 6. Token formats

### Session IDs
- ≥128 bits entropy (16 random bytes → base64url → 22 chars min)
- Stored server-side with the user binding
- Rotated on login + privilege change
- Invalidated server-side on logout

### API tokens
- ≥256 bits entropy
- Hashed at rest (SHA-256 is fine for token storage since they're already
  high-entropy random — same pattern as Eddie's StormAtlas refresh tokens)
- Prefixed for type detection (`sk_live_`, `pat_`, etc.) to aid
  gitleaks / GitGuardian / scanners
- Display once at creation, never readable again

### JWT (use sparingly)
- Pin `alg` server-side; reject `none`; reject mismatched alg
- Validate `iss`, `aud`, `exp`, `nbf`, `iat`
- Short lifetime (15 min); pair with rotating refresh token
- Don't put PII or secrets in the payload (it's only signed, not
  encrypted — by default)
- For higher security: JWE (encrypted JWT) or just opaque tokens with
  server-side state

### One-time tokens (password reset, email verify)
- Single-use (delete from DB on use)
- Time-limited (15 min for password reset, 24h for email verify)
- Cryptographically random, never sequential

---

## 7. Key management

### Where keys live (in order of preference)
1. Hardware security module (HSM) — YubiHSM, CloudHSM, on-prem
2. KMS — AWS KMS, GCP KMS, Azure Key Vault, HashiCorp Vault Transit
3. Secrets manager — Vault KV, AWS Secrets Manager, GCP Secret Manager,
   sealed-secrets in k8s
4. Environment variables — only for dev, or for bootstrapping a load
   from #2/#3

### Never
- Source code (anywhere, including private repos)
- Container images
- ConfigMaps / unencrypted k8s Secrets
- `.env` files committed to git (gitignore them and put in a vault)

### Rotation cadence
- Symmetric encryption keys: annually + on suspected compromise
- Signing keys: annually + on key-holder change
- API tokens / OAuth client secrets: per regulatory requirement (90 days
  for PCI; otherwise 6–12 months); immediately on suspected leak

---

## 8. Common findings (Eddie's review patterns)

Map these to OWASP A04:2025 findings:

| Pattern | Severity | Fix |
|---|---|---|
| `bcrypt(password, salt, 10)` | MEDIUM | Bump cost to 12+ |
| `hashlib.md5(password)` | CRITICAL | Switch to Argon2id |
| `requests.get(url, verify=False)` | HIGH | Verify; pin CA bundle if needed |
| `jwt.decode(token, key, algorithms=['HS256','RS256'])` | CRITICAL | Pin to one algorithm |
| `os.urandom(8)` for token IDs | HIGH | 16+ bytes |
| `random.choice` for password reset codes | CRITICAL | `secrets.choice` |
| Hardcoded AES key in source | CRITICAL | Move to KMS/vault |
| AES-CBC without HMAC | HIGH | Switch to AES-GCM |
| Reusing nonce/IV | CRITICAL | Generate fresh per encryption |

---

## 9. References

- NIST SP 800-63B (digital identity / passwords)
- NIST SP 800-131A (transitioning crypto algorithms)
- NIST SP 800-57 (key management)
- BSI TR-02102 (German equivalent; sometimes stricter)
- IETF RFC 9325 (TLS BCP)
- OWASP Cryptographic Storage Cheat Sheet
- Cryptographic Right Answers — Latacora
