import { Hono } from "hono";
import type { Env, MotionJob, ShotBrief } from "./types";
import { handleBatch } from "./queue/consumer";
import { newId, verifySignature } from "./lib/id";
import { search } from "./understanding/twelvelabs";
import { assetKey } from "./vault/r2";

export { RenderSession } from "./do/render-session";

const app = new Hono<{ Bindings: Env }>();

app.get("/health", (c) => c.json({ ok: true, service: "organized-motion" }));

/** Accept a brief and fan its shots into the generation queue. */
app.post("/brief", async (c) => {
  const body = await c.req.json<{ title: string; shots: Omit<ShotBrief, "briefId">[] }>();
  const briefId = newId("brief");

  await c.env.MOTION_DB.prepare(
    `INSERT INTO briefs (id, title, shot_count, created_at)
     VALUES (?, ?, ?, datetime('now'))`,
  ).bind(briefId, body.title, body.shots.length).run();

  const jobs: MessageSendRequest<MotionJob>[] = body.shots.map((s) => ({
    body: { kind: "submit", shot: { ...s, briefId } as ShotBrief },
  }));
  await c.env.MOTION_JOBS.sendBatch(jobs);

  return c.json({ briefId, queued: jobs.length }, 202);
});

app.get("/brief/:id", async (c) => {
  const id = c.req.param("id");
  const gens = await c.env.MOTION_DB.prepare(
    `SELECT g.*, s.composite
       FROM generations g
       LEFT JOIN scores s ON s.generation_id = g.id
      WHERE g.brief_id = ?
      ORDER BY g.created_at`,
  ).bind(id).all();
  return c.json({ briefId: id, generations: gens.results });
});

/** Timeline contract between the understanding plane and composition. */
app.get("/timeline/:briefId", async (c) => {
  const briefId = c.req.param("briefId");
  const rows = await c.env.MOTION_DB.prepare(
    `SELECT g.id, g.asset_key, sh.beat, sh.shot_index, sh.duration_s,
            sh.aspect, COALESCE(sc.composite, 0) AS score
       FROM generations g
       JOIN shots sh ON sh.generation_id = g.id
       LEFT JOIN scores sc ON sc.generation_id = g.id
      WHERE g.brief_id = ? AND g.status = 'succeeded'
      ORDER BY sh.shot_index`,
  ).bind(briefId).all<any>();

  let t = 0;
  const clips = rows.results.map((r) => {
    const clip = {
      id: r.id,
      beat: r.beat,
      src: `/asset/${r.asset_key}`,
      start: Number(t.toFixed(2)),
      duration: r.duration_s,
      score: r.score,
    };
    t += r.duration_s;
    return clip;
  });

  return c.json({
    briefId,
    aspect: rows.results[0]?.aspect ?? "9:16",
    totalDuration: Number(t.toFixed(2)),
    clips,
    brand: {
      bg: "#050608",
      accent: "#B7FF3C",
      warn: "#FFCC4D",
      font: "JetBrains Mono",
    },
  });
});

/** Stream an asset out of the vault. */
app.get("/asset/*", async (c) => {
  const key = c.req.path.replace("/asset/", "");
  const obj = await c.env.MOTION_ASSETS.get(key);
  if (!obj) return c.notFound();
  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set("etag", obj.httpEtag);
  headers.set("cache-control", "public, max-age=3600");
  return new Response(obj.body, { headers });
});

/** Semantic retrieval across the archive. */
app.post("/search", async (c) => {
  const { query, limit } = await c.req.json<{ query: string; limit?: number }>();
  return c.json(await search(c.env, query, limit ?? 10));
});

/** Manual ingest lane for OpenArt Director exports. */
app.post("/ingest", async (c) => {
  const { externalJobId, briefId, generationId, contentType } =
    await c.req.json<Record<string, string>>();
  const key = assetKey("raw", briefId, generationId, "mp4");
  await c.env.MOTION_CACHE.put(
    `ingest:${externalJobId}`,
    JSON.stringify({ assetKey: key, mediaType: contentType ?? "video/mp4" }),
    { expirationTtl: 604800 },
  );
  return c.json({ uploadKey: key, note: "PUT the file to /ingest/upload with this key" });
});

app.put("/ingest/upload", async (c) => {
  const key = c.req.header("x-asset-key");
  if (!key) return c.text("missing x-asset-key", 400);
  await c.env.MOTION_ASSETS.put(key, c.req.raw.body, {
    httpMetadata: { contentType: c.req.header("content-type") ?? "video/mp4" },
  });
  return c.json({ stored: key });
});

/** Meshy webhook. Preferred over polling at volume. */
app.post("/webhook/meshy", async (c) => {
  const raw = await c.req.text();
  const sig = c.req.header("x-signature") ?? "";
  if (!(await verifySignature(c.env.WEBHOOK_SIGNING_SECRET, raw, sig))) {
    return c.text("bad signature", 401);
  }
  const payload = JSON.parse(raw) as { id?: string };
  if (payload.id) {
    await c.env.MOTION_JOBS.send({ kind: "poll", generationId: payload.id, attempt: 0 });
  }
  return c.json({ received: true });
});

export default {
  fetch: app.fetch,

  async queue(batch: MessageBatch<MotionJob>, env: Env) {
    await handleBatch(batch, env);
  },

  /**
   * Measurement loop. Pulls ad performance by creative_id and writes it
   * back onto scores so the gate threshold tunes on real CPA, not vibes.
   */
  async scheduled(_event: ScheduledController, env: Env) {
    // TODO Phase 8: Meta Marketing API + Google Ads pull keyed on creative_id.
    console.log("performance sync tick", env.GTM_CONTAINER_ID);
  },
};
