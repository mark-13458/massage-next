# ERRORS


## [ERR-20260314-001] docker-compose-build

**Logged**: 2026-03-14T02:18:00+01:00
**Priority**: medium
**Status**: pending
**Area**: infra

### Summary
docker compose up -d --build failed during base image metadata fetch, but the failure was not caused by app code.

### Error
`
failed to authorize: Canceled: grpc: the client connection is closing
failed to solve: Canceled: grpc: the client connection is closing
`

### Context
- Command: docker compose up -d --build
- Environment: Windows + Docker Desktop
- Failure point: pulling / resolving 
ode:20-bullseye-slim metadata during Docker build
- App-level 
pm run build had already passed outside Docker before this.

### Suggested Fix
Differentiate Docker daemon / network / registry failures from application build failures first; retry with targeted docker pull, check docker info, and inspect Docker Desktop health before changing project files.

### Metadata
- Reproducible: unknown
- Related Files: Dockerfile, docker-compose.yml

---
