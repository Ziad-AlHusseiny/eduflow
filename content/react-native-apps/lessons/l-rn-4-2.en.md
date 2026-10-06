---
summary: Choose between AsyncStorage, expo-sqlite and expo-secure-store for each kind of data in Trailhead, and use each one correctly, from preferences to a migrated hike database to the sign-in token.
takeaways:
  - AsyncStorage is an unencrypted, asynchronous string key-value store, right for small preferences and wrong for secrets.
  - expo-sqlite stores structured data you query, sort and filter; run schema migrations in `onInit` using `PRAGMA user_version`.
  - Always pass SQL values as parameters (`?`), never by building the SQL string yourself.
  - expo-secure-store encrypts small values with the platform's Keychain or Keystore; tokens and keys belong there.
  - Store files such as photos on the file system and keep only their paths in the database.
further:
  - title: Store data
    url: https://docs.expo.dev/develop/user-interface/store-data/
  - title: SQLite
    url: https://docs.expo.dev/versions/latest/sdk/sqlite/
  - title: SecureStore
    url: https://docs.expo.dev/versions/latest/sdk/securestore/
quiz:
  - q: Where should Trailhead keep the refresh token it receives after sign-in?
    options:
      - text: AsyncStorage, under a key like `auth.refreshToken`.
        why: AsyncStorage is unencrypted. On a compromised or backed-up device, the token can be read as plain text.
      - text: An `EXPO_PUBLIC_` environment variable.
        why: Those are baked into the app bundle at build time; they can't hold per-user values and are readable by anyone.
      - text: expo-secure-store, which encrypts it with the Keychain on iOS and the Keystore on Android.
        why: Correct. Small secrets like tokens are exactly what it's for.
      - text: A `tokens` table in the SQLite database.
        why: The database file isn't encrypted by default, so the token would sit in plain text next to the hikes.
    answer: 2
  - q: "Which line is safe for saving a hike's name typed by the user?"
    options:
      - text: "``db.runAsync(`INSERT INTO hikes (name) VALUES ('${name}')`)``"
        why: A name containing a quote, like O'Brien Ridge, breaks the statement, and crafted input can change the SQL itself.
      - text: "`db.runAsync('INSERT INTO hikes (name) VALUES (?)', name)`"
        why: Correct. The value is bound as a parameter, so it's always treated as data, never as SQL.
      - text: "`db.execAsync('INSERT INTO hikes (name) VALUES (' + JSON.stringify(name) + ')')`"
        why: JSON quoting isn't SQL quoting, and `execAsync` doesn't bind parameters. It's string-building with extra steps.
    answer: 1
  - q: Trailhead v2 adds an `elevationM` column to the hikes table. Existing users already have v1's table. What's the reliable approach?
    options:
      - text: In the `onInit` migration, read `PRAGMA user_version`; if it's 1, run `ALTER TABLE hikes ADD COLUMN elevationM INTEGER` and set the version to 2.
        why: Correct. Versioned migrations upgrade each user's database exactly once, in order, whatever version they start from.
      - text: Delete the database at startup and recreate it with the new schema.
        why: That wipes every user's hike log on update. Data on the device is the user's; you can't reload it from anywhere.
      - text: Change the `CREATE TABLE` statement; SQLite updates existing tables to match.
        why: "`CREATE TABLE IF NOT EXISTS` skips existing tables entirely, so old users never get the new column."
    answer: 0
---

A hiking app that forgets your log when you lose signal, or asks you to sign in every morning, gets deleted. Trailhead has three kinds of data to keep on the device, and each fits a different tool:

| Data | Example | Tool |
|---|---|---|
| Small preferences | units (km or mi), last-used tab | AsyncStorage |
| Structured records you query | the hike log, sorted and filtered | expo-sqlite |
| Secrets | the sign-in refresh token | expo-secure-store |

Picking the wrong one rarely fails loudly. It fails as slow screens, lost data after an update, or a security review you don't pass.

:::figure Three stores, three jobs
<svg viewBox="0 0 680 230" role="img" aria-labelledby="t1">
  <title id="t1">Trailhead stores preferences in AsyncStorage as unencrypted strings, hikes in an SQLite database it can query, and the refresh token in SecureStore, encrypted by the Keychain or Keystore. Photos are files on disk whose paths are stored in SQLite.</title>
  <rect class="d-box-primary" x="250" y="16" width="180" height="48" rx="12"/>
  <text class="d-label-strong" x="340" y="46" text-anchor="middle">Trailhead</text>
  <rect class="d-box" x="20" y="120" width="190" height="90" rx="12"/>
  <text class="d-label-strong" x="115" y="148" text-anchor="middle">AsyncStorage</text>
  <text class="d-label-muted" x="115" y="172" text-anchor="middle">strings, unencrypted</text>
  <text class="d-code" x="115" y="196" text-anchor="middle">units = "km"</text>
  <rect class="d-box-accent" x="245" y="120" width="190" height="90" rx="12"/>
  <text class="d-label-strong" x="340" y="148" text-anchor="middle">expo-sqlite</text>
  <text class="d-label-muted" x="340" y="172" text-anchor="middle">tables, queries</text>
  <text class="d-code" x="340" y="196" text-anchor="middle">hikes, photo paths</text>
  <rect class="d-box-success" x="470" y="120" width="190" height="90" rx="12"/>
  <text class="d-label-strong" x="565" y="148" text-anchor="middle">SecureStore</text>
  <text class="d-label-muted" x="565" y="172" text-anchor="middle">Keychain / Keystore</text>
  <text class="d-code" x="565" y="196" text-anchor="middle">refresh token</text>
  <path class="d-arrow" d="M290 64 L130 118" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M340 64 L340 118" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M390 64 L550 118" marker-end="url(#arrow)"/>
</svg>
:::

## AsyncStorage for preferences

AsyncStorage is a persistent key-value store of **strings**. Every call is async, and nothing is encrypted:

```ts title=src/lib/prefs.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Prefs = { units: 'km' | 'mi'; remindersOn: boolean };
const KEY = 'trailhead.prefs.v1';
const defaults: Prefs = { units: 'km', remindersOn: false };

export async function loadPrefs(): Promise<Prefs> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return defaults;
  try {
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

export function savePrefs(prefs: Prefs) {
  return AsyncStorage.setItem(KEY, JSON.stringify(prefs));
}
```

Store one JSON blob under a versioned key rather than many tiny keys, merge with defaults when reading (so a new preference added in v2 gets a sensible value for old users), and survive corrupt data with a `try`. Install it with `npx expo install @react-native-async-storage/async-storage`. If your app already uses expo-sqlite, `expo-sqlite/kv-store` offers the same API backed by SQLite, so you can skip the extra dependency.

Read preferences once at startup, keep them in a context like the hikes, and write them back when they change. Calling `getItem` inside components on every render turns a fast screen into one that flickers through default values first.

AsyncStorage gets slow and awkward when you start storing lists of records in it: every read parses the whole blob, and there's no way to ask for "hikes over 10 km in 2026" without loading everything.

## expo-sqlite for the hike log

The hike log is structured data you sort, filter and total, which is what a database is for. expo-sqlite gives you a real SQLite database file on the device. `SQLiteProvider` opens it and runs your setup before any child renders:

```tsx title=src/app/_layout.tsx
import { Stack } from 'expo-router';
import { SQLiteProvider, type SQLiteDatabase } from 'expo-sqlite';

async function migrate(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let version = row?.user_version ?? 0;

  if (version === 0) {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE hikes (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        date TEXT NOT NULL,
        distanceKm REAL NOT NULL,
        favorite INTEGER NOT NULL DEFAULT 0
      );
    `);
    version = 1;
  }
  if (version === 1) {
    await db.execAsync('ALTER TABLE hikes ADD COLUMN photoUri TEXT');
    version = 2;
  }
  await db.execAsync(`PRAGMA user_version = ${version}`);
}

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName="trailhead.db" onInit={migrate}>
      <Stack />
    </SQLiteProvider>
  );
}
```

`PRAGMA user_version` is a number SQLite stores in the file for you. Each `if` block upgrades one step, so a user on version 0 runs both, and a user on version 1 runs only the second. Never edit an old step once it has shipped; add a new one.

Any screen can then use the database:

```tsx
import { useSQLiteContext } from 'expo-sqlite';

const db = useSQLiteContext(); // in a component or custom hook

// …later, inside an async function such as an effect or a save handler:
const hikes = await db.getAllAsync<Hike>('SELECT * FROM hikes ORDER BY date DESC');
await db.runAsync(
  'INSERT INTO hikes (id, name, date, distanceKm) VALUES (?, ?, ?, ?)',
  hike.id, hike.name, hike.date, hike.distanceKm,
);
```

In practice you'd call these from your reducer's provider: load the hikes once into state, and write to SQLite whenever an action changes them.

:::mistake Building SQL with template strings
`` `INSERT INTO hikes (name) VALUES ('${name}')` `` breaks on the first hike called "O'Brien Ridge" and lets crafted input rewrite your query. The `?` placeholders bind values safely, whatever they contain. Make it a rule: no user data ever goes into the SQL text itself.
:::

## SecureStore for secrets

The refresh token lets Trailhead sign in silently. Anyone who reads it can act as the user, so it goes in expo-secure-store, which encrypts values using the iOS Keychain and the Android Keystore:

```ts title=src/lib/session.ts
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'trailhead.refreshToken';

export const saveToken = (token: string) => SecureStore.setItemAsync(TOKEN_KEY, token);
export const readToken = () => SecureStore.getItemAsync(TOKEN_KEY);
export const clearToken = () => SecureStore.deleteItemAsync(TOKEN_KEY);
```

This is what the `isLoading` state in the previous section's `useSession` was waiting for: at startup, `readToken()` decides whether the user lands on the tabs or on the sign-in screen. SecureStore is meant for **small** values; some platform versions have rejected values over about 2 KB. Keep tokens and keys there, never whole objects or files. It doesn't run on the web, so a web build needs a different approach.

## Files belong on disk

A trail photo is several megabytes. Don't put it in SQLite or AsyncStorage. Keep the file on disk (expo-file-system manages your app's document directory) and store only its URI in the `photoUri` column. Your database stays small and fast, and the image component loads the file directly.

All of this data survives app updates, including over-the-air ones, and is deleted when the user uninstalls the app, with one quirk: on iOS, Keychain values from SecureStore can survive a reinstall, so don't treat a missing database as proof that no token exists. If losing it would hurt, sync it to your server, which is exactly why Trailhead has accounts.

Next, the most delicate part of talking to the device: asking for permission to use its location and camera.
