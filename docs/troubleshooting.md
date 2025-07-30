# Troubleshooting Guide

Common issues and solutions for MCP server deployment and usage.

## Docker Compose Fails to Start

- Ensure `docker-compose.yml` exists in the project root.
- Check for port conflicts (default: 3000).
- Ensure Docker is running and you have permissions.

## JWT Errors

- Ensure your `.env` has a valid `JWT_SECRET` and matches the signing algorithm.
- Check token expiration and audience claims.

## API Docs Not Accessible

- Visit `/docs` (Swagger UI/Redoc) when the server is running.
- Ensure the server is started and accessible on the configured port.

## Health Check Fails

- Check logs for errors.
- Ensure environment variables are set correctly.
- Verify database and Redis connectivity if used.

## Test Failures in CI

- Ensure `logs/app.log` exists (created automatically in CI workflow).
- Check for missing environment variables in CI config.
- Review coverage and mutation score thresholds.

## Dependency Issues

- Run `npm ci` to install exact versions from `package-lock.json`.
- Run `npm audit` and `snyk` for security checks.

## Need More Help?

- Open an issue on GitHub or join the Discussions page.
- See README and SECURITY.md for more details.
