import { createClient } from "@supabase/supabase-js";

/* Your Supabase project. The publishable key is designed to live in front-end
   code, so it is safe to have here. */
const SUPABASE_URL = "https://aqhkecknthcdpailpcst.supabase.co";
const SUPABASE_KEY = "sb_publishable_A3TzNt_GQnryCeFvOAFiUg_V9rXEyv9";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/* The site talks to a tiny key/value API (window.storage). In the preview that
   was provided by the host; here the same shape is backed by a Supabase table
   so both of you read and write the same data.

   shared === true  -> the "kutty_shared" table, visible to both of you
   shared === false -> this browser only (just the day/night preference) */
const TABLE = "kutty_shared";

const local = {
  get(key) {
    const v = window.localStorage.getItem("kutty:" + key);
    return v === null ? null : { key, value: v, shared: false };
  },
  set(key, value) {
    window.localStorage.setItem("kutty:" + key, value);
    return { key, value, shared: false };
  },
  delete(key) {
    window.localStorage.removeItem("kutty:" + key);
    return { key, deleted: true, shared: false };
  },
  list(prefix = "") {
    const keys = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith("kutty:" + prefix)) keys.push(k.slice(6));
    }
    return { keys, prefix, shared: false };
  },
};

const shared = {
  async get(key) {
    const { data, error } = await supabase
      .from(TABLE)
      .select("value")
      .eq("key", key)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error("not found"); // matches the old API's behaviour
    return { key, value: data.value, shared: true };
  },
  async set(key, value) {
    const { error } = await supabase
      .from(TABLE)
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) throw error;
    return { key, value, shared: true };
  },
  async delete(key) {
    const { error } = await supabase.from(TABLE).delete().eq("key", key);
    if (error) throw error;
    return { key, deleted: true, shared: true };
  },
  async list(prefix = "") {
    const { data, error } = await supabase.from(TABLE).select("key").like("key", `${prefix}%`);
    if (error) throw error;
    return { keys: (data || []).map((r) => r.key), prefix, shared: true };
  },
};

export function installStorage() {
  window.storage = {
    get: (key, isShared = false) => (isShared ? shared.get(key) : Promise.resolve(local.get(key))),
    set: (key, value, isShared = false) =>
      isShared ? shared.set(key, value) : Promise.resolve(local.set(key, value)),
    delete: (key, isShared = false) =>
      isShared ? shared.delete(key) : Promise.resolve(local.delete(key)),
    list: (prefix = "", isShared = false) =>
      isShared ? shared.list(prefix) : Promise.resolve(local.list(prefix)),
  };
}
