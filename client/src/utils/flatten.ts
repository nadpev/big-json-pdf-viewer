export function flatten(
    obj: Record<string, unknown>,
    prefix = "",
    out: Record<string, unknown> = {}
  ) {
    Object.entries(obj).forEach(([k, v]) => {
      const key = prefix ? `${prefix}_${k}` : k;
      if (v && typeof v === "object" && !Array.isArray(v)) {
        flatten(v as Record<string, unknown>, key, out);
      } else {
        out[key] = v;
      }
    });
    return out;
  }