# TaskFlow – React CI/CD with Jenkins

Software Quality Engineering final project. TaskFlow is a small React task tracker
(in-memory data) that is tested, analyzed, built, archived and deployed automatically with
**GitHub, Jenkins, SonarQube and Docker**.

## Repository contents

| File | Purpose |
|------|---------|
| `src/` | React source and automated tests (`App.test.jsx`) |
| `package.json`, `package-lock.json` | Dependencies and scripts |
| `Jenkinsfile` | CI pipeline used by the Multibranch Pipeline |
| `Jenkinsfile.cd` | Parameterized CD pipeline |
| `Dockerfile` | Packages the production build (`dist/`) into an nginx image |
| `sonar-project.properties` | SonarQube analysis configuration |
| `docs/npm-audit-result.txt` | `npm audit` result |

`node_modules`, `coverage`, `dist`, archives, passwords and tokens are **not** committed (see `.gitignore`).

## Run locally

```bash
npm ci
npm run dev            # development server
npm test               # run the automated tests
npm run test:coverage  # tests + coverage (writes coverage/lcov.info)
npm run build          # production build into dist/
npm audit              # dependency security check
```

## Branches and CI behaviour

| Stage | `feature/*` | `develop` | `main` |
|-------|:-----------:|:---------:|:------:|
| Checkout | ✔ | ✔ | ✔ |
| Install and Test | ✔ | ✔ | ✔ |
| Coverage | ✔ | ✔ | ✔ |
| SonarQube Analysis | | | ✔ |
| Quality Gate | | | ✔ |
| Build | | ✔ | ✔ |
| Archive Artifact | | | ✔ |

A failing test stops the pipeline. On `main`, a failed quality gate aborts the pipeline before
Build and Archive Artifact run. A *Dependency Audit* stage (informational, non-blocking) also runs
on every branch.

## Tests and coverage

`src/App.test.jsx` contains 12 tests covering valid input (adding a task), alternative outcomes
(completing / un-completing a task, Pending / Completed / All filters), and invalid or boundary
input (empty task, whitespace-only task, trimmed title, empty filter result), plus the statistics
cards. Coverage is written as LCOV to `coverage/lcov.info`, imported by SonarQube, and checked
against an 80% overall-coverage quality gate. Coverage does not guarantee defect-free software; the
assertions check specific behaviour (values, counts, text), not just that code runs.

## Infrastructure setup

1. **Jenkins** with plugins: Pipeline, GitHub Branch Source, NodeJS, SonarQube Scanner, Copy Artifact.
   Jenkins needs the Docker CLI and access to the Docker daemon.
2. **Manage Jenkins → Tools**: NodeJS installation named `NodeJS-22`; SonarQube Scanner named `SonarScanner`.
3. **Manage Jenkins → System**: SonarQube server named `SonarQube` (URL + token stored as a Jenkins credential).
4. **SonarQube**: create a quality gate with *Coverage on Overall Code ≥ 80%*, assign it to the `taskflow`
   project, and add a webhook `http://<jenkins-url>/sonarqube-webhook/`.
   SonarQube Community Build is used, so only `main` is analyzed (no branch parameters).
5. **CI job**: New Item → Multibranch Pipeline → GitHub branch source with the repository URL and a
   GitHub credential. Discovers `main`, `develop` and `feature/*`. Trigger with a GitHub webhook
   (`/github-webhook/`) and/or periodic scanning; *Scan Multibranch Pipeline Now* also works.
6. **CD job**: New Item → Pipeline → *Pipeline script from SCM* → this repository, script path `Jenkinsfile.cd`.

## Versioned artifact

On `main`, after tests and the quality gate pass, the CI build runs `npm run build` and packages
`dist/` and the `Dockerfile` into `taskflow-<CI build number>.tar.gz` (for example
`taskflow-12.tar.gz`). It is archived in the `main` job. `node_modules` is not included.

## CD pipeline

Parameters:

| Parameter | Purpose |
|-----------|---------|
| `CI_BUILD_NUMBER` | Main-branch CI build whose artifact is deployed |
| `ENVIRONMENT` | `DEV`, `TEST`, `ACC` or `PROD` |

The pipeline prints the selected CI build number and environment, copies the artifact from the
`main` CI job, extracts it, builds a Docker image from the packaged `Dockerfile`, and starts a
container. It never runs `npm run build`. Deploying to `PROD` asks for manual approval.

| Environment | Container | URL |
|-------------|-----------|-----|
| DEV | `taskflow-dev` | http://localhost:8081 |
| TEST | `taskflow-test` | http://localhost:8082 |
| ACC | `taskflow-acc` | http://localhost:8083 |
| PROD | `taskflow-prod` | http://localhost:8084 |

## Failure and recovery demonstration

On `feature/task-management`, build #6 failed and the pipeline stopped at the failing stage; after the
fix, build #8 passed. The cause and correction are explained in the recorded demonstration
(see the screenshots of both builds).

## Dependency security

`npm audit` reported 0 vulnerabilities at the time of the run. See `docs/npm-audit-result.txt`.
