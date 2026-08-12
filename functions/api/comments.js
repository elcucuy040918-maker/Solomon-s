export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const pageId = url.searchParams.get("page_id") || "default";
  const { results } = await context.env.DB.prepare(
    "SELECT * FROM comments WHERE page_id = ? ORDER BY id DESC"
  ).bind(pageId).all();
  return Response.json(results);
}

export async function onRequestPost(context) {
  const { page_id, author, content } = await context.request.json();
  await context.env.DB.prepare(
    "INSERT INTO comments (page_id, author, content) VALUES (?, ?, ?)"
  ).bind(page_id, author, content).run();
  return Response.json({ success: true });
}