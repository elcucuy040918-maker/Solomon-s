export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const pageId = url.searchParams.get("page_id");

  if (!pageId) return Response.json([]);

  const { results } = await context.env.DB.prepare(
    "SELECT * FROM comments WHERE page_id = ? ORDER BY id DESC"
  ).bind(pageId).all();

  return Response.json(results || []);
}

export async function onRequestPost(context) {
  const body = await context.request.json();

  // 댓글 수정
  if (body.action === 'edit') {
    const { comment_id, content } = body;
    await context.env.DB.prepare("UPDATE comments SET content = ? WHERE id = ?")
      .bind(content, comment_id).run();
    return Response.json({ success: true });
  }

  // 댓글 신규 등록 (선택한 픽 포함)
  const { page_id, author, content, pick } = body;
  await context.env.DB.prepare(
    "INSERT INTO comments (page_id, author, content, pick, created_at) VALUES (?, ?, ?, ?, DATETIME('now'))"
  ).bind(page_id, author, content, pick || 'none').run();

  return Response.json({ success: true });
}
