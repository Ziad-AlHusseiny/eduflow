# Review: Git & GitHub (`git-github`)

## Verdict

A strong course that needed polishing, not rework. The English is accurate, practical and well sequenced: the graph-first model (snapshots, labels, HEAD) is set up in section 1 and reused by every later lesson, and each lesson names its common mistake and builds the same portfolio project. The diagrams match the text, and the quiz keys are correct. Most findings were small fidelity slips in sample terminal output, checked against Git 2.53 in a scratch repository: insertion counts, a missing status line, and a reflog line that said `switch:` where Git writes `checkout:`. A few claims were overstated (`--force-with-lease`, SSH keys never expiring, `gh repo sync`). One version had gone stale: `actions/checkout@v6`, while v7 shipped in July 2026. The Arabic reads naturally overall. Its recurring weakness was dropping the article before English nouns in construct ("commits الخاصة بك"), plus one mistranslation that reversed a sentence's meaning and an awkward imperative ("صادِق Git") in a summary. All fixes are applied to both languages, and every code block is still identical between EN and AR.

## Issues found and fixed

| File | Category | Severity | What was wrong | What changed |
|---|---|---|---|---|
| l-git-1-1 en/ar | accuracy | low | Quiz why said only push/fetch/pull/clone need network (others like ls-remote do too) | Reworded to "commands that talk to a remote, such as..." |
| l-git-1-2 en/ar | accuracy | medium | Sample `git commit` output said 10 insertions; the 11-line index.html gives 11 (verified in a scratch repo) | Changed to 11 insertions |
| l-git-1-2 en/ar | accuracy | low | "some Git versions still use master" understates it: every Git 2.x (incl. 2.53) defaults to master | Reworded to Git 2.x |
| l-git-1-2 ar | arabic | medium | "يقرّر GitHub صورة من وملفّ من يظهر" ungrammatical/garbled; "يتم رفع" calque; "تجلس بجانبه" literal | Rewrote the three sentences |
| l-git-1-3 en/ar | accuracy | low | `git status` sample output omitted the closing "no changes added to commit" line real Git prints | Added the line |
| l-git-1-3 en/ar | accuracy | low | `git add -p` prompt letters shown as fixed; Git 2.4x+ shows "(1/2)" and extra letters (j,J,p,P...) depending on hunk | Added note that newer versions list more letters and `?` explains them |
| l-git-1-3 ar | arabic | low | "commitين"/"commitان" (Arabic dual suffix glued to English term) and literal "عصر كامل من الجراحة" | Rephrased as "اثنين من الـ commits" and "ساعات من العمل الجراحي الدقيق" |
| l-git-1-4 en/ar | accuracy | low | "two different commits never share one [ID]" stated as absolute | Softened to "in practice" |
| l-git-1-4 ar, l-git-1-1 ar | arabic | low | Commit graph rendered as "الشجرة/شجرة الـ commits" in two takeaways while the course uses "رسم بياني" everywhere else; "رسم لـ رسم بياني" redundancy; literal "جالسة/جالسًا" (sitting) | Unified on "الرسم البياني"; rephrased |
| exercises/l-git-1-4 en/ar | accuracy | low | Prompt said the SVG is drawn 'the way git log --graph lays it out' (log draws vertically, newest on top) | Reworded to 'the same shape git log --graph draws in text' |
| l-git-2-1 en/ar | accuracy | low | Said `git branch -d` checks reachability from the current branch only; Git checks the branch's upstream if it has one, else HEAD | Added the upstream case |
| l-git-2-2 en/ar | accuracy | low | Fast-forward diffstat not column-aligned as Git prints it | Padded the count column |
| l-git-2-2 ar | arabic | medium | "القاعدة التي توفّر أكبر قدر من الارتباك" says the rule *provides* the most confusion (opposite of "saves") | Changed to "تجنّبك أكبر قدر من الارتباك"; "سطر الأوامر" for prompt clarified |
| l-git-2-3 en/ar | accuracy | low | Conflict `git status` sample missing the final 'no changes added to commit' line (verified with Git 2.53) | Added it; AR 'سبع علامات أصغر من' clarified as 'سبعة رموز < متتالية' |
| l-git-2-4 en/ar | accuracy | low | Quiz why claimed --force-with-lease means you "can't" wipe others' commits; a fetch after their push defeats the lease | Scoped to "since your last fetch" |
| l-git-2-4 ar | arabic | medium | Six places dropped the article before English terms in construct ("commits الخاصة", "و commit الخاص بك", "commits غير المرفوعة") and a gender agreement slip ("يُعاد كتابتها") | Added "الـ" and rephrased; fixed agreement to "تُعاد" |
| l-git-3-1 en/ar | accuracy | low | "exactly four commands" keep remotes in sync (ls-remote, remote etc. also talk to remotes) | "four main commands" |
| l-git-3-1 ar | arabic | medium | Article dropped before "commits" in 4 places; "لا يُعاد كتابة" agreement; "آخر ما رُئي" awkward in the SVG | Fixed article/agreement; "آخر موضع معروف هو b2" |
| l-git-3-2 en/ar | accuracy | low | "SSH never expires on its own" ignores GitHub deleting SSH keys unused for a year | Added the caveat |
| l-git-3-2 ar | arabic | medium | Summary opened with "صادِق Git مع GitHub", which reads as "befriend Git" | "أعِدّ مصادقة Git مع GitHub" |
| l-git-3-3 ar | arabic | medium | Article dropped before "commits" in 8 places ("كل commits الخاصة بك", "وتختفي commits"...); "تحت حدود 400 سطر" stiff | Added "الـ"; rephrased to "دون 400 سطر تقريبًا" |
| l-git-3-4 en/ar | accuracy | medium | Said plain `gh repo sync` updates the fork on GitHub; without an argument it syncs the *local* clone from its parent. Default label is `documentation`, not `docs` | Use `gh repo sync maya-okafor/vite-themes` and note the no-argument behaviour; label renamed |
| l-git-3-4 en/ar | pedagogy | low | SVG label "git fetch upstream" overlapped its arrow | Moved label left (x 110 -> 30) |
| l-git-3-4 ar | arabic | low | "انشئ" missing hamza; switch to plural "اتفقوا" mid-lesson; article dropped before commits | Fixed |
| exercises/l-git-3-2 en/ar | pedagogy | medium | Order exercise had two valid orders (loading the key into the agent can happen before or after adding it to GitHub; set-url could precede the test), so a correct learner could be marked wrong | Prompt now states local key work first and test before changing the remote |
| l-git-4-1 en/ar | accuracy | medium | Reflog sample showed "switch: moving from footer to main"; Git records `git switch` as "checkout: moving from ..." (verified in Git 2.53) | Corrected the reflog line |
| l-git-4-1 en/ar | accuracy | low | Revert subject shown as Revert 'Move nav into header'; Git writes Revert "Move nav into header" | Fixed quoting, shown as code |
| l-git-4-1 en/ar | accuracy | medium | "Committed to main by mistake" recipe runs `git reset --hard origin/main` with no warning that it wipes uncommitted edits | Added "commit or stash uncommitted edits first" |
| l-git-4-1/4-2/4-3 ar | arabic | low | Small grammar slips: "فلا يُعاد كتابة" (agreement), "إن لم تكن" (wrong verb), "لا أحدهما خاطئ", calque "ينتهي الشيء الخطأ داخل commit" | Corrected |
| l-git-4-4 en/ar + exercises/l-git-4-4 | accuracy | medium | Workflow pinned `actions/checkout@v6`; current major is v7 (v7.0.0 released 2026-07-14, checked via GitHub API). setup-node@v7 was already current | Bumped to `actions/checkout@v7` in lesson (EN/AR) and the spot-bug exercise code |
| l-git-4-4 en/ar | accuracy | low | Takeaway said a required check "must match a job that has already reported"; the match is by name, the "already reported" part is about what GitHub suggests in the picker | Reworded |
| assessments en/ar | accuracy | low | SSH-keys option said keys never expire (GitHub deletes keys unused for a year); branch -d option said 'not reachable' rather than 'not merged' | Aligned with lessons; AR article fixes ('الـ commits الأصلية'، 'بقية الـ commits') |
| glossary en/ar | accuracy | low | force-with-lease definition overstated the guarantee | Scoped to 'since your last fetch' |
| exercises/l-git-4-3 en/ar | accuracy | low | Explanation suggested a `style:` commit for the colour change while the same explanation (correctly) says `style` is formatting-only | Suggest `feat(theme): …` instead |

**Totals:** 34 issues: accuracy 22 (5 medium, 17 low); Arabic 10 (6 medium, 4 low); pedagogy 2 (1 medium, 1 low). No high-severity issues.

## Verified, no change needed

- Reset modes, restore/`--staged`, `revert -m 1`, reflog expiry (90/30 days), `branch -D` recovery, stash `-u`/`apply`/`branch`, `.gitignore` anchoring and `!` re-inclusion. The `secrets.json   # comment` and `/.DS_Store` behaviour in exercise 4-2 was checked with `git check-ignore`.
- Merge and rebase: ours/theirs swap during a rebase, `--ff-only`/`--no-ff`/`--squash`, the `ort` message, the divergent-pull `fatal:` message, `pull.rebase`/`pull.ff only`.
- GitHub: password auth removed in 2021; `ssh.github.com:443`; closing keywords only act on merges into the default branch. Rulesets are free on public repos and need Pro/Team/Enterprise Cloud on private ones (docs quote confirmed). Restrict deletions and Block force pushes are on by default. Error `GH013`. `pull_request` default activity types. `actions/setup-node@v7` is current and still supports `cache: npm`.
- html-validate 11.x on the lesson's `index.html` really prints `DOCTYPE should be uppercase  doctype-style`.
- All 54 further-reading URLs return 200.
- Commit-graph SVGs in 1-1, 1-4, 2-1, 2-2, 2-4 and 3-1, and exercises 1-4 and 2-2, match their captions and the text (parents, labels, HEAD, rebased primes).

## Not changed / could not fully verify

- **Arabic dual on English nouns** ("commitين", "commitان", about 20 places) was left as is. Arab developers commonly write it this way and it reads naturally. It was rephrased only in 1-3, where it sat in a heading.
- **Gender of "issue"** varies in the Arabic (masculine in some sentences, feminine in others). Both are in real use, so it was not normalised across files.
- **Rulesets status-check picker:** the docs say checks must have "recently" reported to be offered. Whether you can type an arbitrary check name in the ruleset UI could not be confirmed, so the wording was softened to "GitHub only suggests checks that have already reported" rather than stating a hard rule.
- Spot-bug exercise 4-4 marks line 11 (`npm ci` before checkout) as the bug. A learner could reasonably pick line 12 (checkout too late) instead. The hint steers toward line 11, so it was left.

## Validation

- `node scripts/content/validate.mjs git-github`: 0 errors, 0 warnings
- `node scripts/content/check-exercises.mjs git-github`: 0 problems (guided-only course; 0 runnable exercises)
