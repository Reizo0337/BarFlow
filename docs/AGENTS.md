# AGENTS.md

This document describes the automated agents and development assistants used in the BarFlow project.

Agents help automate tasks such as code review, testing, documentation generation, and development assistance.

---

# Overview

BarFlow uses automated agents to improve development speed, maintain code quality, and assist contributors.

Agents may run locally during development or as part of CI/CD pipelines.

Main responsibilities include:

- code analysis
- automated testing
- linting
- documentation updates
- dependency monitoring
- issue triage

---

# Agent Types

## 1. Code Quality Agent

Purpose:

Ensure consistent code quality across the project.

Responsibilities:

- run linting tools
- enforce formatting rules
- detect common code issues
- verify project structure

Tools typically used:

- ESLint
- Prettier

---

## 2. Test Agent

Purpose:

Automatically run tests and verify that changes do not break existing functionality.

Responsibilities:

- execute unit tests
- run integration tests
- generate coverage reports

Example tools:

- Jest
- Playwright

---

## 3. Documentation Agent

Purpose:

Keep project documentation up to date.

Responsibilities:

- validate Markdown files
- check for broken links
- suggest documentation updates
- generate API documentation

---

## 4. Dependency Agent

Purpose:

Monitor project dependencies and detect security issues.

Responsibilities:

- detect outdated packages
- check vulnerability databases
- propose dependency updates

Typical tools:

- Dependabot
- npm audit

---

## 5. Issue Management Agent

Purpose:

Assist maintainers with repository management.

Responsibilities:

- label new issues
- detect duplicates
- assign priority tags
- categorize feature requests and bug reports

---

# AI Development Assistants

AI assistants may be used by contributors to help with:

- generating boilerplate code
- suggesting improvements
- debugging
- writing tests
- generating documentation

AI-generated code should always be reviewed before merging.

---

# Safety and Review Policy

All automated changes must follow these rules:

1. No agent may merge code without human review.
2. Pull requests created by agents must clearly identify themselves.
3. Security-related updates should be reviewed by maintainers.
4. Agents must not modify licensing files.

---

# Future Agents

Possible future agents include:

- Fiscal compliance agent (for regional tax compliance)
- Hardware integration testing agent
- Performance benchmarking agent
- Localization assistant

---

# Maintainers

Agents are configured and maintained by the BarFlow maintainers.

Contributors proposing new agents should open a discussion issue before adding automation.

---

# Philosophy

Automation should support developers, not replace them.

Agents should:

- reduce repetitive work
- improve code quality
- make collaboration easier