---
summary: Format queries so a reviewer can check them quickly, and translate the SQLite habits from this course to PostgreSQL by knowing where dates, booleans, LIKE and grouping rules differ.
takeaways:
  - Readable SQL uses explicit JOIN ... ON, one column per line, role-based aliases, named CTE steps and comments that explain why, not what.
  - Remove what the query doesn't use, such as unused joins and SELECT *, because every extra table is a possible fan-out and a question for the reviewer.
  - Date handling is the biggest SQLite-to-PostgreSQL difference: strftime and julianday become date_trunc, to_char, intervals and real date types.
  - SQLite is more lenient than PostgreSQL (bare columns, case-insensitive LIKE, booleans as 0/1), so a query that runs in SQLite may fail or behave differently in PostgreSQL.
further:
  - title: SQLite quirks, caveats and gotchas
    url: https://www.sqlite.org/quirks.html
  - title: PostgreSQL date/time functions and operators
    url: https://www.postgresql.org/docs/current/functions-datetime.html
  - title: PostgreSQL pattern matching (LIKE and ILIKE)
    url: https://www.postgresql.org/docs/current/functions-matching.html
quiz:
  - q: "`FROM support_tickets t, customers c WHERE t.customer_id = c.customer_id` appears in a query that never uses any `c.` column. What should the reviewer ask for?"
    options:
      - text: Rewrite it as a LEFT JOIN so no tickets are lost.
        why: Changing the join type keeps the unused table; the issue is that it's there at all.
      - text: Remove the customers table; it adds nothing but a possible source of fan-out or lost rows.
        why: Correct. Every table in FROM is something the reader must reason about. If no column is used and it isn't filtering on purpose, delete it.
      - text: Add DISTINCT to the SELECT to be safe.
        why: DISTINCT papers over duplication instead of removing its cause, and here it could also merge real rows.
      - text: Nothing; comma joins are standard SQL and fine to keep.
        why: Comma joins are legal, but they hide the join condition in WHERE, where it's easy to forget. Explicit JOIN ... ON is the readable form.
    answer: 1
  - q: Which SQLite expression has a direct PostgreSQL equivalent in `date_trunc('month', order_date)`?
    options:
      - text: "`julianday(order_date)`"
        why: julianday converts to a day number; it doesn't truncate to the month.
      - text: "`strftime('%w', order_date)`"
        why: That's the weekday number, not the start of the month.
      - text: "`date(order_date, '+1 month')`"
        why: That adds a month; the PostgreSQL equivalent is `order_date + INTERVAL '1 month'`.
      - text: "`date(order_date, 'start of month')`"
        why: Correct. Both return the first day of the order's month. PostgreSQL returns a timestamp, SQLite returns 'YYYY-MM-01' text.
    answer: 3
  - q: "This runs in SQLite: `SELECT channel, status, COUNT(*) FROM orders GROUP BY channel`. What happens in PostgreSQL?"
    options:
      - text: It fails, because `status` is neither grouped nor aggregated.
        why: Correct. PostgreSQL enforces the GROUP BY rule that SQLite relaxes, so the bare-column bug becomes an error you can't miss.
      - text: It returns the same result as SQLite.
        why: PostgreSQL refuses to pick an arbitrary value for a bare column.
      - text: It returns one row per channel and status.
        why: That would need `GROUP BY channel, status`; PostgreSQL doesn't add grouping columns for you.
    answer: 0
  - q: "`WHERE email LIKE '%@EXAMPLE.COM'` finds all 600 customers in SQLite. How many does it find in PostgreSQL, where emails are stored in lower case?"
    options:
      - text: "600, LIKE behaves the same everywhere"
        why: LIKE's case sensitivity is one of the most common dialect differences.
      - text: An error, because LIKE needs ILIKE in PostgreSQL
        why: PostgreSQL has LIKE too; it's simply case-sensitive.
      - text: "0, because PostgreSQL's LIKE is case-sensitive; use ILIKE or compare LOWER(email)"
        why: Correct. SQLite's LIKE ignores ASCII case by default, PostgreSQL's doesn't. ILIKE is PostgreSQL's case-insensitive version.
    answer: 2
---

Yara, the senior analyst on your team, reviews every query before it reaches a stakeholder. Her first comment on new analysts' work is rarely about the logic. It's "I can't check this quickly." Her second, this quarter, is practical: Cartwheel is moving its reporting to a PostgreSQL warehouse, and every query you've written needs to survive the move. This lesson covers both: SQL that reviewers can read, and SQL that travels.

## A query someone else has to check

Here's a real query from the support team's old dashboard. It runs and returns plausible numbers:

```sql run
select t.channel,count(*),avg(satisfaction) from support_tickets t,customers c where t.customer_id=c.customer_id and closed_at is not null and opened_at>='2025-01-01' group by 1 order by 3 desc;
```

A reviewer has to work to answer basic questions. Why is `customers` here? (It isn't used; it's leftover from an earlier version, and it's a join someone must now reason about.) Is that a join condition or a filter? Which table does `satisfaction` belong to? What is column 3? Is the 2025 filter missing an upper bound or is that deliberate? Here's the same analysis, written to be checked:

```sql run
-- Support satisfaction by contact channel, tickets opened in 2025.
-- grain: one row per channel. Only closed tickets: open ones can't be rated yet.
SELECT
  t.channel,
  COUNT(*)                      AS closed_tickets,
  COUNT(t.satisfaction)         AS rated,
  ROUND(AVG(t.satisfaction), 2) AS avg_satisfaction
FROM support_tickets AS t
WHERE t.closed_at IS NOT NULL
  AND t.opened_at >= '2025-01-01'
  AND t.opened_at <  '2026-01-01'
GROUP BY t.channel
ORDER BY avg_satisfaction DESC;
```

The changes, in order of importance:

1. **Remove what isn't used.** The unused join is gone. Every table in FROM is a potential fan-out or a filter in disguise, so it must earn its place.
2. **Explicit joins.** When you do join, write `JOIN ... ON`, never a comma plus a WHERE condition. The join condition then sits next to the table it belongs to.
3. **Names over positions.** Every output column has a name, and ORDER BY uses it. `GROUP BY 1` is a contested convenience; names survive edits to the SELECT list.
4. **One column per line, qualified with a role-based alias.** Diffs in code review become one line per change.
5. **Comments that say why.** The header states the question and the grain; "only closed tickets" explains a decision. Don't comment *what* the SQL plainly says.
6. **Show the denominator.** `rated` sits next to the average, the response-rate lesson from Section 1.

Uppercase keywords, leading or trailing commas, and indentation width are team conventions. Pick one, apply it everywhere, and let a formatter enforce it. Consistency matters far more than which style wins.

:::tip Build long queries as CTE steps
For anything longer than one screen, write one CTE per logical step, put a `-- grain:` comment on each, and keep the final SELECT short. A reviewer can then run each step on its own, exactly as you did while writing it.
:::

## From SQLite to PostgreSQL

SQL is a standard, but every engine has its own functions and its own leniency. Almost everything in this course runs unchanged in PostgreSQL: joins, CTEs, recursive CTEs, window functions, `FILTER`, `NULLIF`, `COALESCE`, `IS DISTINCT FROM`. The differences cluster in a few places:

| Task | SQLite | PostgreSQL |
|---|---|---|
| Month label | `strftime('%Y-%m', d)` | `to_char(d, 'YYYY-MM')` |
| Start of month | `date(d, 'start of month')` | `date_trunc('month', d)` |
| Add an interval | `date(d, '+7 days')` | `d + INTERVAL '7 days'` |
| Hours between | `(julianday(b) - julianday(a)) * 24` | `EXTRACT(EPOCH FROM b - a) / 3600` |
| Case-insensitive match | `LIKE` (ASCII) | `ILIKE` |
| Two-way choice | `IIF(c, a, b)` or `CASE` | `CASE` |
| Count a condition | `SUM(cond)` or `FILTER` | `COUNT(*) FILTER (WHERE cond)` |

The biggest change is underneath the table. PostgreSQL has real `date` and `timestamp` types, so date columns are compared as dates, and date arithmetic returns intervals rather than numbers. Booleans are a real type too: `SUM(status = 'cancelled')` fails there because you can't sum a boolean, which is why FILTER is the portable choice.

:::mistake Trusting SQLite's leniency
SQLite accepts bare columns in GROUP BY queries, matches `LIKE` without regard to case, and lets you compare text with numbers. PostgreSQL rejects or behaves differently in each case. That's mostly good news, because the strict engine turns silent bugs into errors. But it means "it ran in SQLite" doesn't mean "it's correct". If a query relies on a lenient behaviour, rewrite it explicitly: add the column to GROUP BY, use `LOWER()` on both sides, cast types on purpose.
:::

Two smaller differences catch people regularly. Integer division truncates in both engines (`7 / 2` is 3), so keep writing `100.0 *` for percentages. And PostgreSQL sorts NULLs last in ascending order where SQLite sorts them first, so add `NULLS FIRST` or `NULLS LAST` whenever NULL placement matters.

The exercise is a real porting job: a warehouse query that fails in SQLite. After that, the capstone puts the whole course together.
