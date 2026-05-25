# Debugging Playbook
## GODMYTHOS v9 Reference

> Stack-specific debugging techniques. Load when entering DEBUG mode.

---

## Universal Debugging Protocol

```
1. REPRODUCE — Get consistent repro steps. "It sometimes fails" is not a repro.
2. ISOLATE   — Binary search: disable half, test, narrow.
3. HYPOTHESIZE — State: "I believe X causes Y because Z"
4. VERIFY    — Test the hypothesis with one targeted change.
5. FIX       — Fix root cause, not symptom. Add regression test.
6. COMPOUND  — Document the failure class in docs/knowledge/.
```

---

## Runtime Truth Checklist (before blaming code)

Check in this order. Most "code bugs" are actually environment issues:

1. **Prompt/command syntax** — typo? wrong flag? quoting issue?
2. **Model/provider selection** — correct model name? provider available?
3. **Base URL / endpoint** — hitting the right server? staging vs production?
4. **API key / auth wiring** — key present? not expired? correct scope?
5. **Network reachability** — DNS resolving? firewall blocking? proxy in the way?
6. **Tool adapter / bridge behavior** — adapter version? known adapter bugs?
7. **Runtime logs** — what does the actual error say?
8. **Only then: application logic** — now look at the code.

---

## Node.js / TypeScript

| Symptom | Common Cause | Debug Approach |
|---------|-------------|----------------|
| `fetch failed` / `ECONNREFUSED` | Wrong URL, service not running, DNS issue | Check `curl` to same endpoint, verify service is up |
| `Cannot find module` | Path issue, missing dep, ESM/CJS mismatch | Check `node_modules/`, verify import syntax matches module type |
| `ERR_MODULE_NOT_FOUND` with ESM | File extension missing in import | ESM requires `.js` extension even for `.ts` source |
| Memory leak / OOM | Unclosed streams, growing arrays, event listener leak | `--inspect` + Chrome DevTools Memory tab, heap snapshots |
| Stack overflow | Circular dependency, infinite recursion | `--stack-trace-limit=50`, check import graph |
| `EPERM` / `EACCES` | File permissions, port < 1024 | Check `ls -la`, use port > 1024, or `setcap` |
| Slow startup | Heavy synchronous imports, large dependency tree | `node --prof`, check import time with `--experimental-loader` |
| TypeScript type error vs runtime mismatch | `as` assertion hiding real type | Remove assertions, let compiler find the real issue |

### Node.js Debug Commands
```bash
# Start with inspector
node --inspect src/index.js

# Profile startup
node --prof src/index.js && node --prof-process isolate-*.log

# Check ESM resolution
node --experimental-import-meta-resolve -e "import.meta.resolve('./module')"

# Memory snapshot
node --heapsnapshot-signal=SIGUSR2 src/index.js  # then kill -USR2 <pid>
```

---

## Python

| Symptom | Common Cause | Debug Approach |
|---------|-------------|----------------|
| `ModuleNotFoundError` | Wrong virtualenv, missing install | `which python`, `pip list`, check venv activation |
| `ImportError: circular import` | Module A imports B, B imports A | Restructure: move shared code to a third module |
| Slow response | N+1 queries, blocking I/O in async | `cProfile`, SQLAlchemy echo=True, `asyncio.gather` |
| `RuntimeError: Event loop is running` | Mixing sync/async incorrectly | Use `await` properly, don't call `asyncio.run()` inside async |
| Type errors at runtime despite mypy pass | `Any` propagation, missing stubs | `mypy --strict`, check for untyped dependencies |
| Memory growth | Large querysets loaded into memory | Generator/iterator pattern, `.yield_per()` for SQLAlchemy |

### Python Debug Commands
```bash
# Profile
python -m cProfile -s cumulative app.py

# Line-by-line profiling
pip install line_profiler && kernprof -l -v script.py

# Memory profiling
pip install memory_profiler && python -m memory_profiler script.py

# Interactive debugger
python -m pdb script.py  # or breakpoint() in code
```

---

## Go

| Symptom | Common Cause | Debug Approach |
|---------|-------------|----------------|
| `nil pointer dereference` | Unchecked error return, uninitialized pointer | `go vet`, check all error returns |
| Goroutine leak | Goroutine blocked on channel, no context cancellation | `pprof` goroutine profile, add `context.WithCancel` |
| Race condition | Shared state without mutex | `go test -race`, `go run -race` |
| High memory | Large allocations, no pooling | `pprof` heap profile, use `sync.Pool` |
| Slow JSON marshaling | Reflection overhead | Switch to `json-iterator` or code generation |

### Go Debug Commands
```bash
# Race detector
go test -race ./...

# CPU profile
go test -cpuprofile cpu.prof -bench . && go tool pprof cpu.prof

# Memory profile
go test -memprofile mem.prof -bench . && go tool pprof mem.prof

# Goroutine dump
curl http://localhost:6060/debug/pprof/goroutine?debug=2
```

---

## React / Next.js Frontend

| Symptom | Common Cause | Debug Approach |
|---------|-------------|----------------|
| Infinite re-render | Object/array in dependency array, missing memo | React DevTools Profiler, check useEffect deps |
| Hydration mismatch | Server/client render different output | Check for `Date.now()`, `Math.random()`, browser-only APIs |
| Layout shift (CLS) | Images without dimensions, dynamic content injection | Lighthouse, set explicit `width`/`height` |
| Slow page load | Large bundle, unoptimized images, no code splitting | `next/bundle-analyzer`, `next/image`, dynamic imports |
| State not updating | Stale closure, mutating state directly | New object/array reference, check closure scope |
| API route 500 | Unhandled error in route handler | Add try/catch, check server logs (`next dev` terminal) |

### Frontend Debug Commands
```bash
# Bundle analysis
ANALYZE=true next build  # with @next/bundle-analyzer configured

# Lighthouse
npx lighthouse http://localhost:3000 --output html

# React DevTools
# Install browser extension, use Profiler tab for render analysis
```

---

## Database (PostgreSQL)

| Symptom | Common Cause | Debug Approach |
|---------|-------------|----------------|
| Slow query | Missing index, full table scan | `EXPLAIN ANALYZE`, add index on WHERE/JOIN columns |
| Connection exhaustion | Pool too small, leaked connections | Check `pg_stat_activity`, increase pool size, add connection timeout |
| Lock contention | Long transactions, table-level locks | `pg_locks` + `pg_stat_activity`, reduce transaction scope |
| Data corruption | No constraints, missing foreign keys | Add CHECK constraints, foreign keys, NOT NULL where applicable |

### PostgreSQL Debug Queries
```sql
-- Active connections
SELECT * FROM pg_stat_activity WHERE state = 'active';

-- Slow queries
SELECT query, mean_exec_time, calls FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;

-- Table bloat
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC LIMIT 10;

-- Missing indexes
SELECT relname, seq_scan, idx_scan FROM pg_stat_user_tables WHERE seq_scan > idx_scan ORDER BY seq_scan DESC;

-- Lock analysis
SELECT blocked.pid, blocked.query, blocking.pid AS blocking_pid, blocking.query AS blocking_query
FROM pg_stat_activity blocked
JOIN pg_locks bl ON bl.pid = blocked.pid
JOIN pg_locks bkl ON bkl.locktype = bl.locktype AND bkl.relation = bl.relation AND bkl.pid != bl.pid
JOIN pg_stat_activity blocking ON blocking.pid = bkl.pid
WHERE NOT bl.granted;
```

---

## Docker / Deployment

| Symptom | Common Cause | Debug Approach |
|---------|-------------|----------------|
| Container exits immediately | Missing CMD, crash on startup | `docker logs <container>`, `docker run -it <image> sh` |
| Port not accessible | Wrong port mapping, firewall, bind to 127.0.0.1 | Check `-p` mapping, verify `0.0.0.0` bind, check `ufw`/iptables |
| Image too large | No multi-stage build, dev deps in prod | Multi-stage Dockerfile, `.dockerignore` |
| DNS resolution fails in container | Docker DNS config, network mode | Check `/etc/resolv.conf` in container, try `--network host` |
| Volume permissions | UID mismatch between host and container | Match UID in Dockerfile, or use named volumes |

### Docker Debug Commands
```bash
# Inspect running container
docker exec -it <container> sh

# Check logs
docker logs --tail 100 -f <container>

# Check resource usage
docker stats

# Network debugging
docker exec <container> nslookup <hostname>
docker exec <container> curl -v <url>

# Check OOMKill
docker inspect <container> | grep OOMKilled
```

---

## Homelab / self-hosted infra patterns

| Symptom | Check First |
|---------|-------------|
| DNS not resolving | Pi-hole / Unbound / local DNS — is it running? Check resolver status |
| SSL cert error | Caddy / Traefik / acme.sh — cert renewed? Check renewal logs |
| Service unreachable from LAN | Firewall rules + reverse proxy config |
| mDNS collision | Two devices advertising same `.local` name — check Bonjour config |
| Port conflict | Background service consuming UDP/TCP ports — `netstat -anob` (Windows) or `ss -tulpn` (Linux) |
| n8n webhook fails | Check the n8n host:port is reachable from the caller, webhook path matches |
| Wazuh alert spam | Check `ossec.conf` for deprecated elements, tune rules |
