# FirstPage — what to build next

Written 2026-08-25, after a pass that fixed the broken slide types, gave each of
the 13 occasions its own art direction, and shipped the first three growth
features.

The point of this document is to be opinionated about sequence. Everything below
is buildable; the ordering is the argument.

---

## Where the leverage actually is

FirstPage has one asset most side projects never get: **the recipient is not the
customer.** Every published page is a link handed to somebody who has never heard
of the product, opens it on their phone, and feels something. That is a free,
emotionally-loaded acquisition channel, and almost nothing in the product
currently exploits it.

So the ranking below follows two questions, in order:

1. Does it make the sender finish and send the page? (Nothing else matters if
   they abandon the editor.)
2. Does it turn the recipient into the next sender?

Revenue comes third on purpose. A gift product with no distribution has nothing
to charge for.

---

## Already shipped in this pass

| Feature | Why it was first |
| --- | --- |
| **Occasion starter templates** | A new page used to open on an empty prose box — the single most likely place to quit. Each occasion now starts as a real page with publishable copy. |
| **"They opened it"** | The sender's payoff. The dashboard card now reads *Opened 4m ago · 2 visitors* or *Not opened yet*, which is the only reason anyone returns to the app after sending. |
| **Link preview cards** | Sharing is copy-link, so the link had to render as a card in WhatsApp and iMessage rather than naked text. Served from the backend at `/s/{slug}`, because a SPA cannot do this. |

---

## Next — finish what is already half-built

These are ranked first because the schema, enums and endpoints already exist. The
cost is wiring, not design.

### 1. Scheduled reveal — *high impact, low effort, and currently a dead end*

The most valuable unfinished thing in the codebase, and worth treating as a bug
report as much as a feature:

- `MicrositeStatus.SCHEDULED` exists (`entity/enums/MicrositeStatus.java`)
- `MicrositeService.schedule(...)` exists and sets it (line 207)
- `MicrositeController` exposes `POST .../schedule` (line 129)
- `status-badge.tsx:25` even renders a "Scheduled" chip

But **nothing anywhere in the backend flips SCHEDULED to PUBLISHED.** There is no
`@Scheduled` method and no `@EnableScheduling` in the entire source tree, and the
public viewer only serves PUBLISHED pages. So a page scheduled today becomes
permanently unreachable, and no frontend code calls the endpoint — which is the
only reason nobody has hit it.

What it takes: `@EnableScheduling`, one method that promotes due rows every
minute, and a date-time control in the publish flow.

Why it matters commercially: *"arrives at midnight on their birthday"* is a
reason to plan ahead, and a page scheduled a week out is a page that cannot be
abandoned. It also pairs with the COUNTDOWN slide that now exists.

### 2. Voice note slide — *high impact, low effort*

`MediaType.VOICE_NOTE` is already in the enum and already unused. The upload path
now correctly attaches media to a slide, and the storage layer accepts audio —
including the `audio/webm;codecs=opus` that browsers actually record — so the
backend work is close to nil.

A recorded voice is the most personal thing this product could carry, and it is
the one thing a screenshot cannot flatten. `MediaRecorder` is native — no
dependency — and the viewer needs a waveform and a play button, nothing more.

Ship it with a 60-second cap. A limit makes it feel like a message rather than a
voicemail, and it keeps Cloudinary costs bounded.

### 3. Recipient guestbook — *medium-high impact, medium effort*

Reactions and replies already work per-slide. Letting *several* people sign one
page turns a one-to-one gift into a group one — a leaving card for a colleague, a
birthday page the whole family adds to.

This is the cheapest path to multi-sender pages, and every signer is a person who
has now used the product without registering.

### 4. Analytics: where they paused — *medium impact, medium effort*

`VisitorLog` already records visits and the viewer already reports reading time.
Per-slide dwell would tell the sender which slide landed — and tells you which
slide types to invest in. Keep it strictly aggregate and sender-facing; this is a
private gift, and per-visitor timelines would feel like surveillance.

---

## Then — the business model

Charge for the thing that is already scarce, not for the thing that is free.

### Premium occasions

`Theme.isPremium` already exists as a column. The natural line is not "more
slides" or a watermark on the recipient's page — never tax the recipient, they
are the distribution — but **the art direction itself**. Two or three free
occasion identities, the rest paid, with the full preview visible before payment.
Somebody proposing marriage does not comparison-shop a £4 upgrade.

Price it as a card, not as software: one-off per page, not a subscription. Nobody
subscribes to proposing.

### "Save as keepsake" export — *high impact, high effort*

A PDF or short video of the page, rendered server-side. Two reasons it earns its
cost: it gives the gift a life after the link expires, and the exported artifact
is itself shareable. This is a natural paid add-on and the bridge to the next
item.

### Print and postcard fulfilment — *high impact, high effort, the real business*

A digital page that becomes a physical card, posted to the recipient with the QR
on the back. Margins are real, it is genuinely defensible, and it converts an app
into a gifting company. It is also the only item here with operational weight —
do not start it until scheduled reveal, voice notes and premium occasions have
proven people will pay at all.

---

## Bigger bets, once the loop works

- **"Make one back"** — the single highest-leverage growth feature not listed
  above. A recipient who has just been moved is the warmest possible lead; one
  quiet prompt on the last slide, offering to start their own page, is the whole
  viral loop. Build it *after* the templates and art directions are good enough
  that the page they land on is impressive, not before.
- **Collaborative editing** — a shared draft link so several friends write one
  page without accounts.
- **Occasion reminders** — you know the date and the recipient. An email eleven
  months later is retention that costs nothing to run.
- **AI as an editor, not an author** — the Gemini integration currently writes
  prose. It is more useful sharpening the sender's own words than replacing them;
  a page the sender did not write is a page the recipient can feel was not
  written.

---

## What I would not build

Worth stating, since each of these looks obvious and would cost weeks:

- **A public gallery or feed.** These pages are private by nature. A browsable
  feed of other people's proposals would break the product's premise.
- **Accounts for recipients.** A login wall in front of a gift kills it.
- **A template marketplace.** Thirteen well-made occasion identities beat two
  hundred user-submitted ones, and the curation is the product.
- **Native mobile apps.** The recipient opens a link. A link does not need an app.

---

## Known technical debt

Carried over deliberately, none of it user-facing today:

| Item | Where | Note |
| --- | --- | --- |
| Single ~958 kB JS chunk | `frontend` build | The viewer is what strangers load on mobile data. Route-level code splitting is a small change with a real payoff. |
| Dead permit rules | `security/SecurityConfig.java:56,60` | `/v3/api-docs/**` and `/api/v1/visitor/**` match no live route — both confirmed 404. |
| `themes` table and `/api/v1/public/themes` | backend | Unused since the 13 bespoke occasion identities replaced it. Left on disk rather than dropping data; remove once premium occasions decide whether they need it. |
| `mvn spring-boot:run` fails as documented | `README.md` | `JAVA_HOME` points at a nonexistent Adoptium 17 path; only JDK 24 is installed. Use `JAVA_HOME="C:/Program Files/Java/jdk-24" ./mvnw spring-boot:run`. |
