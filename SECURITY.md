# Security Policy

Please do not open public issues for secrets, credentials, tokens, private infrastructure details, or exploitable vulnerabilities.

## Reporting

Use GitHub Security Advisories when available. If advisories are not enabled, open a minimal public issue that asks for a private security contact without including sensitive details.

## Handling Secrets

Do not commit `.env` files, API keys, SSH keys, service credentials, session dumps, local logs, or private runtime state. Revoke any exposed credential before attempting cleanup.