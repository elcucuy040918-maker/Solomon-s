export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const pollId = url.searchParams.get("id");

  if (!pollId) {
    const { results } = await context.env.DB.prepare("SELECT * FROM polls ORDER BY id DESC").all();
    return Response.json(results || []);
  }

  let poll = await context.env.DB.prepare("SELECT * FROM polls WHERE id = ?").bind(pollId).first();
  if (!poll && pollId === 'main') {
    // 기본 메인 데이터 생성
    await context.env.DB.prepare(
      `INSERT INTO polls (
        id, title, description, 
        option_a_name, option_a_team, option_a_img, option_a_color, option_a_votes, 
        option_b_name, option_b_team, option_b_img, option_b_color, option_b_votes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 9, ?, ?, ?, ?, 2)`
    ).bind(
      'main', 
      '2020년대 최고의 프리미어리그 윙어는?', 
      '단, 전성기 시즌 임팩트와 누적 스탯을 종합적으로 고려할 것.',
      '손흥민', '토트넘', '', '#3B82F6',
      '모하메드 살라', '리버풀', '', '#EF4444'
    ).run();
    poll = await context.env.DB.prepare("SELECT * FROM polls WHERE id = ?").bind('main').first();
  }

  return Response.json(poll || {});
}

export async function onRequestPost(context) {
  const body = await context.request.json();

  // 1. 투표 처리
  if (body.action === 'vote') {
    const { id, option } = body;
    const column = option === 'a' ? 'option_a_votes' : 'option_b_votes';
    await context.env.DB.prepare(`UPDATE polls SET ${column} = ${column} + 1 WHERE id = ?`).bind(id).run();
    return Response.json({ success: true });
  }

  // 2. 새로운 토론 작성 처리 (컬러, 고려사항 반영)
  if (body.action === 'create') {
    const { id, title, description, optionA, optionB } = body;
    await context.env.DB.prepare(
      `INSERT INTO polls (
        id, title, description, 
        option_a_name, option_a_team, option_a_img, option_a_color, option_a_votes, 
        option_b_name, option_b_team, option_b_img, option_b_color, option_b_votes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, 0)`
    ).bind(
      id, title, description || '', 
      optionA.name, optionA.team, optionA.img, optionA.color || '#3B82F6',
      optionB.name, optionB.team, optionB.img, optionB.color || '#EF4444'
    ).run();
    return Response.json({ success: true });
  }

  // 3. 사진 업로드 업데이트
  if (body.action === 'update_img') {
    const { id, option, img } = body;
    const column = option === 'a' ? 'option_a_img' : 'option_b_img';
    await context.env.DB.prepare(`UPDATE polls SET ${column} = ? WHERE id = ?`).bind(img, id).run();
    return Response.json({ success: true });
  }

  return Response.json({ error: "Invalid action" }, { status: 400 });
}
