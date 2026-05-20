# Roadmap

> Evolving `awesome-tools` from a static curated list into an **AI-powered tool discovery platform** — automatically surfacing high-signal tools from across the developer community, with an AI-assisted review pipeline to keep quality high.

## Vision

Today this repository is a hand-maintained README of tools. The maintenance cost grows with every new submission (see open PRs), and many genuinely useful tools never get discovered because they don't fit a single curator's daily reading list.

The goal is to refactor `awesome-tools` into a system that:

1. **Discovers** trending and discussed tools from multiple developer communities (GitHub, Hacker News, Reddit, Product Hunt, dev.to, etc.) — not just one person's bookmarks.
2. **Curates with AI**, scoring tools on community signal, maintenance health, and originality, while filtering out spam, abandoned projects, and self-promotion.
3. **Surfaces tools through a queryable interface** — full-text search, semantic search ("a Go-based CI/CD runner"), and faceted filtering by language, category, license, and activity.
4. **Lowers contribution friction** so good tools reach an audience faster, while a human-in-the-loop review keeps the bar high.

The README will continue to exist (regenerated from the database) for backward compatibility, but the canonical experience moves to the web app.

---

## Status Legend

- [x] Done
- [~] In progress
- [ ] Planned

---

## Phase 0 — Foundations [~]

> Project skeleton and supporting tooling.

- [x] Next.js 15 + Prisma + SQLite scaffold
- [x] OSSInsight-based automated README generation
- [x] Database backup / restore / clear scripts (`just` commands)
- [ ] Document the data model (`schema.prisma`) in `docs/`
- [ ] Define environment variable contract (LLM keys, scraper credentials)
- [ ] Set up CI (lint, typecheck, test) via GitHub Actions

---

## Phase 1 — Multi-Source Ingestion

> Expand input beyond OSSInsight. Build a normalized ingestion pipeline that treats every source as a stream of `Mention` events feeding a canonical `Tool` record.

### Sources (priority order)

| Source                 | Method               | Primary Signal              |
| ---------------------- | -------------------- | --------------------------- |
| GitHub Trending        | REST API / scrape    | Star velocity, topic tags   |
| Hacker News            | Algolia API          | Points, comment depth       |
| Reddit (curated subs)  | Reddit API           | Upvotes, comment quality    |
| Product Hunt           | GraphQL API          | Daily ranking               |
| dev.to / Medium        | RSS / API            | Reactions, bookmarks        |
| Cross-references       | GitHub search        | Mentions in other `awesome-*` repos |
| X / Twitter tech lists | API (paid tier)      | Engagement (later)          |

### Deliverables

- [ ] `Source`, `Mention`, `Tool` schema in Prisma
- [ ] One scraper per source, behind a common interface
- [ ] Scheduled ingestion via GitHub Actions (hourly / daily per source)
- [ ] Deduplication: same tool from multiple sources merges into one `Tool`
- [ ] Rate-limit and retry handling

### Exit criteria

At least three sources flowing into the database, with a minimum of 500 tools indexed.

---

## Phase 2 — AI Enrichment & Scoring

> Use LLMs to turn raw mentions into structured, scored tool records.

### Pipeline

```
Raw Mention ──► LLM Enrichment ──► Score ──► Category ──► Auto Tag ──► Tool record
```

### Deliverables

- [ ] **AI scoring**: combines community signal (mention velocity) with repo health (commit recency, star/fork ratio, open-issue age) → 0–100 score
- [ ] **AI categorization**: maps each tool into existing categories (Framework / Monitoring / Network / ...) or suggests a new one with rationale
- [ ] **AI summarization**: one-sentence TL;DR generated from README + top discussion threads
- [ ] **Semantic deduplication**: detect when "tool-X" and "toolX-cli" are the same project
- [ ] **Quality signals surfaced**: license, last commit, maintainer count, issue-response time

### Model choices

- Lightweight tasks (scoring, classification): Claude Haiku
- Deeper synthesis (summarization, dedupe reasoning): Claude Sonnet
- Cache aggressively — most tools are processed once and re-scored on a schedule.

### Exit criteria

Every `Tool` has a score, category, TL;DR, and quality signal fields populated.

---

## Phase 3 — AI Review & Moderation Pipeline

> Address the maintainer pain reflected in current open PRs: spam, SEO listings, abandoned projects, and self-promotion sneaking into the list.

### Flow

```
New submission
    │
    ▼
AI pre-screen ──► high confidence ──► auto-publish
              ├─► medium ──────────► human review queue
              └─► high risk ───────► auto-reject + recorded reason
```

### Review heuristics (LLM-driven)

- [ ] Detect phishing / typosquatting against well-known tools
- [ ] Flag suspicious link destinations (personal pages, link shorteners, unknown TLDs)
- [ ] Detect marketing-heavy descriptions
- [ ] Identify abandoned projects (no commits in N months, unanswered issues)
- [ ] Detect duplicate of an already-indexed tool

### Human-in-the-loop

- [ ] Admin UI showing pending submissions with AI rationale
- [ ] One-click approve / reject / re-categorize
- [ ] Reviewer feedback loop refines prompts over time

### Exit criteria

A submission can flow from PR or web form to the live site without manual category placement, with auditable AI rationale at every gate.

---

## Phase 4 — Query Frontend

> Replace the README as the primary discovery surface.

### Deliverables

- [ ] Full-text search (Postgres FTS or MeiliSearch / Typesense)
- [ ] Faceted filtering: language, category, license, activity window, star band
- [ ] **Semantic search** via embeddings — "Go CLI for managing K8s contexts" returns relevant tools even without keyword match
- [ ] Tool detail page: TL;DR, source mentions with deep links, score breakdown, similar tools
- [ ] Curated views: "Trending This Week", "Hidden Gems" (high discussion / low stars), "Recently Abandoned" warnings
- [ ] README.md auto-generated nightly from the database (preserve external links)
- [ ] OpenGraph metadata for shareable tool pages

### Exit criteria

A user can find a tool by description without knowing its name, and every entry has provenance back to the discussion that surfaced it.

---

## Phase 5 — Community & Contribution

> Lower the cost of contributing while keeping the bar high.

- [ ] Web-form submission (routes through Phase 3 pipeline)
- [ ] User voting, "this is outdated" reports, usage notes
- [ ] Public API + Webhooks (other awesome-lists can consume)
- [ ] RSS / Atom feeds for new tools per category
- [ ] Maintainer dashboards (claim a tool, update metadata)

### Exit criteria

External contributors submit through the web (not PRs), and at least one external awesome-list consumes the API.

---

## Phase 6 — Observability & Optimization

> Make the system data-driven.

- [ ] Click-through analytics per tool / per category
- [ ] Track AI score vs. real engagement — calibrate prompts when they diverge
- [ ] A/B test categorization rules and ranking heuristics
- [ ] Cost dashboard for LLM usage; identify caching opportunities
- [ ] Quality metrics: false-positive rate of AI moderation, time-to-publish

---

## Open questions

- Which database for production? (SQLite is fine for dev; Postgres for prod?)
- Self-hosted search vs. managed service (Typesense Cloud / Algolia)?
- How aggressive should auto-publish be in Phase 3, vs. keeping a human gate?
- Monetization or sustainability model (sponsors, GitHub Sponsors, none)?

---

## How to contribute

While the platform is being built, contributions to `README.md` are still welcome through pull requests. Once Phase 5 lands, submissions will move to the web form and API.
