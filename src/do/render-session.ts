import type { Env } from "../types";

interface FrameState {
  briefId: string;
  aspect: string;
  totalFrames: number;
  completed: number[];
  startedAt: string;
}

/**
 * Holds frame state for a HyperFrames render so a long render resumes
 * instead of restarting. One instance per brief + aspect combination.
 */
export class RenderSession implements DurableObject {
  constructor(private state: DurableObjectState, private env: Env) {}

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.endsWith("/start")) {
      const body = (await request.json()) as Omit<FrameState, "completed" | "startedAt">;
      const existing = await this.state.storage.get<FrameState>("state");
      if (existing) return Response.json({ resumed: true, state: existing });
      const fresh: FrameState = {
        ...body,
        completed: [],
        startedAt: new Date().toISOString(),
      };
      await this.state.storage.put("state", fresh);
      return Response.json({ resumed: false, state: fresh });
    }

    if (url.pathname.endsWith("/frame")) {
      const { frame } = (await request.json()) as { frame: number };
      const s = await this.state.storage.get<FrameState>("state");
      if (!s) return new Response("no session", { status: 404 });
      if (!s.completed.includes(frame)) s.completed.push(frame);
      await this.state.storage.put("state", s);
      return Response.json({
        completed: s.completed.length,
        total: s.totalFrames,
        done: s.completed.length >= s.totalFrames,
      });
    }

    if (url.pathname.endsWith("/status")) {
      const s = await this.state.storage.get<FrameState>("state");
      return s ? Response.json(s) : new Response("no session", { status: 404 });
    }

    return new Response("not found", { status: 404 });
  }
}
