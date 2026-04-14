# My Prompt:

Review this PR as a senior engineer. The task was to add a /webhook endpoint that receives vendor events, verifies an X-Signature header, parses JSON, upserts user data, and stores raw payloads for audit.
Expected input shape:
{"email":"a@b.com","role":"admin","metadata":{"source":"vendor"}}
Review for these categories, in priority order:

Security: signature verification correctness (timing attacks, algorithm choice, key handling), injection risks, input trust boundaries
Correctness: does the code actually fulfill all 5 requirements? Are there logic bugs, race conditions, or silent failures?
Error handling: what happens on malformed input, missing headers, DB failures, duplicate events? Does it fail loudly or silently?
Data integrity: is the upsert safe? Can it corrupt or lose data? Is the raw payload actually stored reliably for audit?
Production readiness: logging, idempotency, status codes, input validation/sanitization, missing edge cases

For each issue found, output:

The specific lines
What the problem is (be concrete, not vague)
Why it matters (what could go wrong in practice)
A suggested fix (one sentence)

Focus on things that would break, lose data, or create vulnerabilities. Flag anything where the code looks right but is subtly wrong, those are the most important catches.

The code is in pr-review.py

# AI Response:

## PR Review: `/webhook` endpoint

### SECURITY

**1. SQL Injection — Critical**
Lines 41-43, 46-48

**Problem:** `email`, `role`, and `raw` are interpolated directly into SQL via f-strings. An attacker who passes the signature check (or if signature verification is broken — see below) can execute arbitrary SQL through the `email`, `role`, or any field in the raw payload.

**Why it matters:** Full database compromise — data exfiltration, table drops, privilege escalation. This is textbook SQLi.

**Fix:** Use parameterized queries: `cur.execute("INSERT INTO ... VALUES (?, ?)", (email, raw))`.

---

**2. Timing attack on signature comparison**
Line 20

**Problem:** `expected == sig` is a standard string equality check, which short-circuits on the first differing byte. An attacker can brute-force the signature one character at a time by measuring response times.

**Why it matters:** Defeats the entire purpose of signature verification. An attacker can forge valid signatures without knowing the secret.

**Fix:** Use `hmac.compare_digest(expected, sig)` for constant-time comparison.

---

**3. Signature scheme is SHA256(secret + body) — vulnerable to length-extension attacks**
Lines 17-19

**Problem:** `SHA256(secret || message)` is susceptible to length-extension attacks. An attacker who sees a valid signature for payload A can compute a valid signature for `A || attacker_controlled_suffix` without knowing the secret.

**Why it matters:** Attacker can append arbitrary data to a legitimate webhook payload and produce a valid signature.

**Fix:** Use HMAC: `hmac.new(WEBHOOK_SECRET.encode(), body, hashlib.sha256).hexdigest()`. (Confirm with vendor docs whether they actually use HMAC — if they do, this code is also just wrong.)

---

**4. Hardcoded fallback secret**
Line 10

**Problem:** `WEBHOOK_SECRET` defaults to `"dev-secret"` if the env var is unset. If deployment misconfigures the environment, production runs with a known secret.

**Why it matters:** Anyone who reads this source code (it's in the PR) can forge signatures against a misconfigured production instance.

**Fix:** Remove the default; fail fast on startup if `WEBHOOK_SECRET` is not set.

---

### CORRECTNESS

**5. Upsert is not an upsert — it's a plain INSERT**
Lines 46-48

**Problem:** This is `INSERT INTO users(email, role) VALUES(...)`. If the user already exists (duplicate email), this will either raise an `IntegrityError` (if there's a unique constraint) or create duplicate rows (if there isn't). Neither is an upsert.

**Why it matters:** Requirement says "upserts user data." Duplicate events will either crash or create duplicate users. Role updates for existing users are silently lost.

**Fix:** Use `INSERT ... ON CONFLICT(email) DO UPDATE SET role = excluded.role` (SQLite upsert syntax).

---

**6. No connection cleanup — db connections leak on every request**
Lines 37, 50

**Problem:** `get_db()` opens a new SQLite connection. It is never closed — not in the happy path, not on exceptions. There's no `try/finally`, no context manager, no Flask teardown hook.

**Why it matters:** File descriptor exhaustion under load. SQLite has a limited number of concurrent connections; leaked connections will eventually cause `OperationalError: database is locked`.

**Fix:** Use `with get_db() as db:` or register a Flask `teardown_appcontext` to close the connection.

---

### ERROR HANDLING

**7. Unhandled `json.loads` failure**
Line 30

**Problem:** If the body is not valid JSON, `json.loads` raises `json.JSONDecodeError`. There's no try/except, so Flask returns a 500 with a stack trace.

**Why it matters:** A vendor retry on 500 will keep retrying, creating noise. The stack trace may leak internal paths. The request already passed signature verification, so this is a legitimate (but malformed) event — it should be logged and rejected cleanly.

**Fix:** Wrap in try/except, return 400 with a message, log the raw payload for debugging.

---

**8. No validation on `email`**
Line 34

**Problem:** `email` defaults to `""` if missing. An empty string is silently inserted into both the audit and users tables. There's no format validation either.

**Why it matters:** You'll end up with ghost rows with empty-string emails, and the upsert (once fixed) will keep "upserting" into the same empty-email row for every payload missing an email field.

**Fix:** Return 400 if `email` is missing or doesn't match a basic format check.

---

**9. DB errors are unhandled**
Lines 41-50

**Problem:** If either INSERT fails (constraint violation, disk full, locked DB), the exception propagates as a 500. The audit row may be written but the user row not (or vice versa) since there's no transaction management beyond the implicit one.

**Why it matters:** Partial writes — audit record exists but user wasn't upserted, or vice versa. No way to tell what succeeded.

**Fix:** Wrap both operations in an explicit transaction with rollback on failure, return 500 with a safe error message, and log the details.

---

### DATA INTEGRITY

**10. Audit and upsert are not atomic**
Lines 41-48

**Problem:** The audit INSERT and user INSERT are two separate statements. If the second fails, the first is already executed. `db.commit()` commits both or neither only if no error occurs between them — but an IntegrityError on line 47 means line 42's INSERT is also rolled back (uncommitted), so you **lose the audit record** for the event that caused the error.

**Why it matters:** The audit table is supposed to be the reliable record. Failing to store the audit row for the exact events that cause problems is the worst possible outcome.

**Fix:** Insert the audit row in its own transaction (or use a separate write path like appending to a file) so it's never lost, regardless of upsert outcome.

---

### PRODUCTION READINESS

**11. Zero logging**
Entire file

**Problem:** No logging anywhere — not on signature failure, not on successful processing, not on errors. `print()` isn't even used.

**Why it matters:** When something goes wrong in production, there's no trail. You can't tell if events are arriving, being rejected, or failing silently.

**Fix:** Add `logging` with at minimum: signature failures (WARN), successful upserts (INFO), and exceptions (ERROR).

---

**12. No idempotency handling**
Entire handler

**Problem:** If the vendor retries a webhook (which they will on timeouts/5xx), the same event is re-processed. The audit table gets duplicate rows. If the upsert is fixed, the user row is fine, but the audit trail shows phantom duplicates.

**Why it matters:** Audit data is unreliable — you can't distinguish a real event from a retry. Under failure conditions, you could see 5-10x duplicate audit rows per event.

**Fix:** Accept an event ID from the payload (or compute a hash), deduplicate in the audit table with a unique constraint, and return 200 on duplicates.

---

**13. `host="0.0.0.0"` with Flask dev server in production**
Line 55

**Problem:** This runs the Flask development server bound to all interfaces. The dev server is single-threaded, not hardened, and not suitable for production.

**Why it matters:** Under any real load this will queue/drop requests. Flask's own docs warn against this.

**Fix:** Use gunicorn/uwsgi in production; keep this only for local dev behind an `if __name__` guard (which it is, but document that this must not be the production entrypoint).

---

### Summary

| Severity     | Count | Key items                                                                           |
| ------------ | ----- | ----------------------------------------------------------------------------------- |
| **Critical** | 2     | SQL injection (lines 41-48), timing attack on signature (line 20)                   |
| **High**     | 3     | Length-extension vulnerability, hardcoded secret fallback, upsert is not an upsert  |
| **Medium**   | 5     | No connection cleanup, unhandled JSON errors, no email validation, non-atomic audit |
| **Low**      | 3     | No logging, no idempotency, dev server in entrypoint                                |

**Verdict:** This PR should not merge. The SQL injection alone is a blocker, and the signature verification has three independent flaws. The core requirement (upsert) isn't implemented. I'd recommend fixing the two critical issues and the broken upsert first, then addressing the rest in a follow-up before going live.
