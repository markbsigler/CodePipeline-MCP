# Contributing

Thank you for your interest in contributing!

## Code Style

- Use TypeScript strict mode, no `any` usage.
- Run `npm run lint` and `npm run format` before committing.
- Use Prettier for formatting and ESLint for linting.
- All code and tests must be fully type-safe.

## Commit Message Conventions

- Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):
  - `fix:` for bug fixes
  - `feat:` for new features
  - `docs:` for documentation changes
  - `refactor:` for code refactoring
  - `test:` for test changes
  - `ci:` for CI/CD changes
- Example: `fix(auth): handle expired JWT tokens gracefully`

## Pull Request Process

- Fork the repo and create a feature branch.
- Run `npm install` and `npm test` to ensure all tests pass.
- Add/modify tests for your changes.
- Ensure mutation score and coverage thresholds are met.
- Open a PR and describe your changes clearly.
- Link related issues if applicable.
- PRs require at least one approval and passing CI before merge.

## Code Review

- Reviews focus on correctness, security, maintainability, and style.
- Address all review comments before merging.
- Squash commits if possible for a clean history.

---

See the README for more details on project structure and standards.
