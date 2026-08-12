export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const pollId = url.searchParams.get("id") || "main";
  let poll = await context.env.DB.prepare("SELECT * FROM polls WHERE id = ?").bind(pollId).first();
  if (!poll) {
    await context.env.DB.prepare("INSERT INTO polls (id, option_a, option_b) VALUES (?, 0, 0)").bind(pollId).run();
    poll = { id: pollId, option_a: 0, option_b: 0 };
  }
  return Response.json(poll);
}

export async function onRequestPost(context) {
  const { id, option } = await context.request.json();
  const column = option === 'a' ? 'option_a' : 'option_b';
  await context.env.DB.prepare(`UPDATE polls SET ${column} = ${column} + 1 WHERE id = ?`).bind(id).run();
  return Response.json({ success: true });
}