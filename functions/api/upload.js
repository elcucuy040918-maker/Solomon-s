export async function onRequestPost(context) {
  try {
    const formData = await context.request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return Response.json({ error: "올바른 파일이 전송되지 않았습니다." }, { status: 400 });
    }

    // 파일 이름 생성 (타임스탬프 + 파일명)
    const fileName = `${Date.now()}-${file.name || 'image.jpg'}`;

    // R2 버킷 업로드를 위해 버퍼 변환
    const arrayBuffer = await file.arrayBuffer();

    await context.env.MY_BUCKET.put(fileName, arrayBuffer, {
      httpMetadata: {
        contentType: file.type || "image/jpeg"
      }
    });

    const imageUrl = `https://pub-8896443c88344341914c8996ecc812f9.r2.dev/${fileName}`;
    return Response.json({ url: imageUrl });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
