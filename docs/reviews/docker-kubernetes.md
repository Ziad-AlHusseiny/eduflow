# Review: docker-kubernetes (Docker & Kubernetes: Ship with Confidence)

## Verdict

This is a strong course. It follows one running project, notes-api, from first Dockerfile to a hardened Deployment behind Gateway API, and each lesson builds on the one before it. The code is current: Compose v2 with no `version:` key, `apps/v1`, `autoscaling/v2`, `gateway.networking.k8s.io/v1`, preStop `sleep`, `kubectl events`, `docker build --check`, BuildKit secret mounts with `env=`, and Helm 4's `--rollback-on-failure`. Quizzes test understanding, and their "correct" answers held up.

I found no high-severity errors in the English. The fixes there were precision problems: a few over-broad claims, one healthcheck that would not run on distroless, one assessment answer that real Compose behaviour contradicts, and some numbers that disagreed with each other.

The Arabic was a faithful translation and above the 70% length floor everywhere. Its weaknesses were literal calques ("خُبز", "قابلة للرمي", "حافّتان خشنتان", "المسار السعيد/التعيس", "اهتزاز"), Arabic dual endings attached to English words ("containerين", "namespaceين", "endpointان"), a few agreement and word-choice slips ("لجأ" used where the imperative "الجأ" was meant, "عشوائية" for "arbitrary", "يختبر" for "experience"), and stray terms that broke the course glossary (الطرح, التوسيع, العُقد, "التطبيق الفعلي" for "implementation"). All of these are fixed. Both checks are clean: `validate.mjs` reports 0 errors and 0 warnings, and `check-exercises.mjs` reports 0 problems (every exercise is guided, so none is runnable).

## The three claims the author left unverified

| Claim | Verdict | Evidence |
|---|---|---|
| The Postgres 18 image moves the data path | **True, and the lesson now says more precisely what happens.** From 18 on, the image sets `PGDATA=/var/lib/postgresql/18/docker` and `VOLUME /var/lib/postgresql`. If its entrypoint finds data, or a mount, at the old `/var/lib/postgresql/data`, it exits with an error that explains the change. The added clause is in EN and AR. | docker-library/postgres `18/bookworm` Dockerfile and `docker-entrypoint.sh` (`docker_error_old_databases`); docker-library docs `postgres/content.md` |
| "The Ingress API is frozen" | **True.** The kubernetes.io Ingress page says "The Ingress API has been frozen", that Kubernetes has no plans to remove it, and that the project recommends Gateway instead. The claim that ingress-nginx retired in March 2026 matches the Kubernetes blog post of 2025-11-11. | kubernetes.io/docs/concepts/services-networking/ingress/ |
| `docker compose up -w` | **Valid.** The `docker compose up` reference lists `-w, --watch`. The exercise accepts both `--watch` and `-w`. | docs.docker.com/reference/cli/docker/compose/up/ |

I also verified the following:

- Helm 4 (released November 2025) renamed `--atomic` to `--rollback-on-failure`.
- `gcr.io/distroless/nodejs24-debian13` exists. Its entrypoint is `/nodejs/bin/node`, and `node` is not on its `PATH`.
- `ingress2gateway` converts ingress-nginx annotations.
- `runAsNonRoot` fails with a non-numeric `USER`.
- The probe defaults and the HPA arithmetic in the course are correct.

## Issues found and fixed

| File | Category | Severity | What was wrong | What I changed |
|---|---|---|---|---|
| assessments.en/ar.yaml (s-dk-3 Q1) | accuracy | medium | After renaming the `db` service, plain `docker compose up -d` leaves the old container running as an orphan. It keeps the DNS alias `db`, so the "correct" answer (that the API can't resolve `db`) wasn't reliably true. | The question now uses `up -d --remove-orphans`, and the explanation covers the orphan trap. |
| l-dk-3-3.en/ar.md | accuracy | medium | The text said the exec-form healthcheck `["CMD", "node", …]` works on distroless. On distroless, `node` is not on `PATH`. | The text now says to call `/nodejs/bin/node` by full path on distroless; on slim, `node` is on `PATH`. |
| l-dk-3-2.en/ar.md | accuracy | low | The Postgres 18 path change was stated vaguely. | Added the single `/var/lib/postgresql` mount, the version-named subfolder, and the entrypoint's refusal to start when it finds the old path. |
| l-dk-1-2.en/ar.md | accuracy | low | "Node.js 24 is the active LTS line in 2026" stops being true when Node 26 becomes Active LTS in late October 2026. | Changed to "an LTS line with security fixes into 2028". |
| l-dk-1-3.en/ar.md | accuracy | low | The ARG sentence said an `ARG` invalidates every step below it. In fact it invalidates only later `RUN` steps, because build args are visible to them as environment variables. | The sentence now names `RUN` steps and gives the reason. |
| l-dk-1-3.en/ar.md (figure) | consistency | low | The figure labelled the `npm ci` step "~3 min", while the body says the reinstall takes 70 seconds. | Changed the label to "~70 s". |
| l-dk-1-4.en/ar.md | accuracy | low | "If the process goes over 512 MB, the kernel kills it" ignores the swap Docker allows by default. | Mentioned the swap allowance and the OOM killer. |
| l-dk-2-2.en/ar.md | accuracy | low | "node_modules built against one ABI will run on another" was garbled. | The sentence now says native modules compiled for one Node ABI fail when loaded in another. |
| l-dk-2-3.en/ar.md | accuracy | low | The digest was defined only as a hash of the manifest, but for a multi-platform image it is the hash of the index. The text also told readers to "enable" the containerd store, which is already the default on new installs. | Added "or, for a multi-platform image, of its image index". The containerd sentence now says it's the default on new installs and to check older setups. |
| l-dk-2-4.en/ar.md | accuracy | low | `scout quickview` was described as "split by base image and your own layers". | Now describes counts for your image, its base image, and a newer base if one exists. |
| l-dk-4-3.en/ar.md | accuracy | low | The text said a LoadBalancer always forwards to node ports. Some controllers target Pod IPs directly. | Changed to "typically", with that exception noted. |
| l-dk-5-1.en/ar.md | accuracy | low | "A new Pod must become ready before an old one is removed" isn't true with the default `maxUnavailable: 25%`. | Rephrased in terms of availability gating how fast old Pods are removed. |
| l-dk-5-2.en/ar.md | accuracy | low | The text implied the `behavior` block changes scale-down timing, but 300 s is already the default. It also said "most managed clusters include metrics-server". | Added that 300 s is the default and setting it makes the choice visible. Changed to "many … include or offer as an add-on". |
| l-dk-5-2.ar.md | consistency | medium | "الأبعد عن الـ requests" said the opposite of "furthest **over** their requests". | Changed to "الأكثر تجاوزًا للـ requests". |
| exercises/l-dk-4-4.ar.json | arabic | medium | "مفاتيح عشوائية" (random keys) for "arbitrary keys". | Changed to "المفاتيح التي تختارها بنفسك". |
| l-dk-5-3.ar.md | arabic | medium | "ماذا يختبر المستخدمون" (what do users test) for "what do users experience". | Changed to "ماذا يلاحظ المستخدمون". |
| l-dk-5-4.ar.md, assessments.ar.yaml | consistency | medium | "implementation" was rendered as "التطبيق الفعلي", which clashes with "التطبيق" (app) in the same sentences. | Changed to "أداة التنفيذ (implementation)". |
| l-dk-3-1.ar.md | arabic | medium | "لجأ" (past tense) where the imperative "الجأ" was meant. Also "containerين", "أكثر أخطاء… شيوعًا مما أراه", and "طرح". | Fixed the verb, rewrote the dual and the calque, and changed "طرح" to "نشر". |
| l-dk-3-2.ar.md | arabic | medium | Calques: "قابلة للرمي", "حافّتان خشنتان", "terminal الوهمي", "تُرمى". The Postgres 18 sentence also needed the new clause. | Rewrote each calque naturally ("عيبان مزعجان", "الطرفية الوهمية (pseudo-TTY)", …) and mirrored the English edit. |
| l-dk-3-3.ar.md | arabic | medium | "المسار السعيد/التعيس", "العلامة الفاضحة", and healthcheck used as feminine in one place but masculine elsewhere. The distroless path note was also missing. | Rewrote the calques, unified healthcheck as masculine, and mirrored the English edit. |
| l-dk-3-4.ar.md | arabic | low | "إعدادات التطوير وحده" (gender agreement), the calqued env-files sentence, and "تعود إلى 8080". | Fixed the agreement and rewrote the other two sentences. |
| l-dk-4-1.ar.md | arabic | low | "تُطرح", "يصادقه ويفوّضه" (unclear), and "سطر الأوامر" for shell prompt. | Changed to "تُنشر", "يتحقّق من هوية مرسله وصلاحياته", and "الـ prompt الخاص بالـ shell". |
| l-dk-4-2.ar.md | arabic | low | "طرح" and "توسيعه" (banned terms), "قابل للرمي", "يعيدك… إلى الأسفل", and an ambiguous لكن clause. | Rewrote each one. |
| l-dk-4-3.ar.md | arabic | low | "توسيع", "عمل ping لـ", "لا يجب أن تقلق", and the LoadBalancer sentence needed the English edit. | Rewrote them and mirrored the edit. |
| l-dk-4-4.ar.md | arabic | low | "يطرح", "namespaceين", and "دوّر الـ Pods" for "roll the Pods". | Changed to "ينشر", "كلا الـ namespaces", and "أعِد تشغيل الـ Pods تدريجيًا". |
| l-dk-5-1.ar.md | arabic | low | "اهتزاز" for blip, "endpointان", "واطلق" (missing hamza), "الصفر ممكن التحقيق", and the gating sentence needed the English edit. | Changed to "عطل عابر", "المساران (endpoints)", "أطلِق", and "الوصول إلى صفر أخطاء ممكن", and mirrored the edit. |
| l-dk-5-2.ar.md | arabic | low | "التطوّع بها لتذهب أولًا", and the metrics-server and `behavior` sentences needed the English edits. | Rewrote the first and mirrored both edits. |
| l-dk-5-3.ar.md | arabic | low | "وبوّابة هي الـ readiness", "Pods الخاصة به" (missing الـ), "التوسيع ثم التقليص", and "ثواني". | Matched the glossary wording, used "التوسعة ثم التقليص", and "بضع ثوانٍ". |
| exercises/l-dk-3-*.ar.json, l-dk-5-*.ar.json | arabic | low | "الذي هو داخل الـ container الخاص به الـ API نفسه", "تُرمى", "اهتزازات", "قيد الطرح", "يرمي سجلاته", and an ambiguous "بصمت" clause. | Rewrote each one. |
| assessments.ar.yaml | arabic | low | "إعادة ضبط توسيع طارئ", "تشغّل قاعدة البيانات لا يثبت", "التوسيع ثم التقليص", and a missing native-module gloss. | Rewrote them and added the gloss. |
| course.ar.json | arabic | low | "مهندسة معماريات سحابية", "تحمل جهاز النداء", "خُبز داخل image", and a missing "في" before "الثالثة فجرًا". | Changed to "مهندسة معمارية سحابية (cloud architect)… تتولّى المناوبة", "دُمج في", and "في الثالثة فجرًا". |
| glossary.ar.json | arabic | low | "قابلة للرمي", "وبوّابة هي الـ readiness", and no gloss for throttling. | Rewrote both phrases and added "الخنق (throttling)". |
| l-dk-1-1…1-4.ar.md, exercises 1-x | arabic/consistency | medium (×5), low (×6) | Calques: "في الثانية وأربعين دقيقة", "المجاري القياسية" for standard streams (reads as "sewers"), "تُخبز", "-d يفصل الـ container", "containerان", "إصابات الـ cache هي بداية الملف", "حادث إنتاج", and "the fix" made plural. Also "مرحلة بناء" where the course keeps "stage". The two English accuracy edits (Node LTS, ARG) needed mirroring. | Rewrote each one: "في الساعة 2:40 فجرًا ذات ليلة", "التدفّقات القياسية (stdout وstderr)", "يشغّل الـ container منفصلًا (detached)", "build stage", and so on. Mirrored both English edits. |
| l-dk-2-1…2-4.ar.md, exercises 2-x | arabic/consistency | medium (×10), low (×9) | "لدغت فرقًا", "حين يشتعل شيء", "مخبوزة", "مساحة هجوم", "معامل بناء" for build argument, "التراجعات" for regressions (clashes with rollback), "العُقد" in SVG labels, "publish" and "deploy" both rendered as نشر, "runtime" translated against the brief, "نفسه" after an indefinite noun, and dual endings on "tagين" and "nodeان". The three English edits also needed mirroring. | Rewrote each one: "سطح هجوم", "وسيط البناء (build argument)", "الانتكاسات (regressions)", publish rendered as "رفع… إلى registry", "الـ runtime", and so on. Mirrored the ABI, containerd and quickview edits. |

**Counts:**

- Accuracy: 2 medium, 11 low.
- Consistency: 3 medium, 1 low, plus the consistency fixes counted inside the two grouped section 1 and 2 rows.
- Arabic: about 45 fixes. That is 4 medium-severity standalone rows, about 15 medium fixes inside the grouped section 1 and 2 rows, and the rest low.
- Pedagogy: none needed changes.

## Couldn't fix or verify, or left as is

- **Spot-bug exercise l-dk-5-2.** The missing CPU request is marked on line 14 (`limits:`). A learner who reasons "the `resources:` block on line 13" will be marked wrong. This is defensible, so I didn't change it; consider accepting either line if the engine ever supports alternatives.
- **Postgres version.** The course uses `postgres:17` throughout. That is still supported and avoids the 18 path change in every snippet. Moving the stack to 18 would mean changing all the volume paths (`/var/lib/postgresql`), so I left it at 17.
- **`docker compose up -d --wait` with a one-shot `migrate` service.** Older Compose releases treated a dependency that had exited as a failure. I didn't re-verify how current releases behave. The lesson's claim is about services with healthchecks, which is accurate.
- **Dates.** "Helm 4, released in late 2025" and "ingress-nginx retired in March 2026" match official announcements. Both should be revisited if the course is refreshed after 2026.
