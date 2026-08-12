export async function onRequestPost(context) {
  const formData = await context.request.formData();
  const file = formData.get("file");
  const fileName = `${Date.now()}-${file.name}`;

  await context.env.MY_BUCKET.put(fileName, file.stream(), {
    httpMetadata: { contentType: file.type }
  });

  // Step 2에서 설정한 R2 퍼블릭 URL로 변경하세요.
  const imageUrl = `https://pub-8896443c88344341914c8996ecc812f9.r2.dev/{fileName}`; 
  return Response.json({ url: imageUrl });
}