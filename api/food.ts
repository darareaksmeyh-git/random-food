import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Content-Type", "application/json");

  if (req.method === "POST") {
    const { name } = req.body as { name?: string };
    if (!name) return res.status(400).json({ error: "Name is required" });

    const { data, error } = await supabase
      .from("foods")
      .insert([{ name }])
      .select();

    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json(data[0]);
  }

  if (req.method === "PUT") {
    const { id, name } = req.body as { id?: string; name?: string };
    if (!id || !name) return res.status(400).json({ error: "ID & Name required" });

    const { data, error } = await supabase
      .from("foods")
      .update({ name })
      .eq("id", id)
      .select();

    if (error) return res.status(500).json({ error: error.message });
    if (!data || data.length === 0) return res.status(404).json({ error: "Food not found" });

    return res.status(200).json(data[0]);
  }

  if (req.method === "DELETE") {
    const { id } = req.body as { id?: string };
    if (!id) return res.status(400).json({ error: "ID is required" });

    const { error } = await supabase.from("foods").delete().eq("id", id);
    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ message: "Food deleted successfully" });
  }

  // GET → return all foods
  const { data, error } = await supabase.from("foods").select("*");
  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json(data);
}
