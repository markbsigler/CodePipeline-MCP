# Security Policy

## Reporting Vulnerabilities

- Please report security vulnerabilities via [GitHub Security Advisories](https://github.com/markbsigler/CodePipeline-MCP/security/advisories) or by email: <mark.sigler@protonmail.com>
- Do not disclose vulnerabilities publicly until they are resolved.

## Security Practices

- All secrets and sensitive config are managed via `.env` files. Never commit secrets to version control.
- Regularly run `npm audit`, `snyk`, and Trivy scans.
- Use strong, unique secrets for `JWT_SECRET` and credentials.
- CORS and helmet.js are enforced for HTTP security.
- Rate limiting and request size limits are enabled.
- HTTPS is enforced in production via reverse proxy.
- Supply chain security: dependencies are pinned and updated regularly.
- Secret scanning is enabled in CI.

## Responsible Disclosure

- We appreciate responsible disclosure and will credit reporters in release notes if desired.

---

See README and PROMPT.md for full security requirements.
