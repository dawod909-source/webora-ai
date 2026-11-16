export async function onRequestPost(context) {
  try {
    const { prompt } = await context.request.json();
    
    if (!prompt) {
      return new Response(JSON.stringify({ error: "يرجى إدخال وصف الموقع" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const apiKey = context.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "مفتاح API غير مهيأ على الخادم" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const systemInstruction = `أنت مهندس ومصمم واجهات ويب عالمي تعمل لصالح منصة Webora.ai. 
مهمتك: كتابة كود HTML5 كامل ومتكامل في صفحة واحدة بناءً على طلب المستخدم.
الشروط الصارمة:
1. استخدم Tailwind CSS عبر CDN (<script src="https://cdn.tailwindcss.com"></script>).
2. اجعل التصميم فائق الجمال، عصرياً، متجاوباً مع الجوال، ويدعم اللغة العربية واتجاه RTL تلقائياً إلا إذا طلب المستخدم لغة أجنبية.
3. أضف تفاعلات JavaScript حقيقية (مثل سلة مشتريات شغالة، نوافذ منبثقة، أو فلاتر) لتكون الصفحة حية وليست مجرد شكل.
4. استخدم صور حقيقية عالية الدقة من Unsplash تناسب موضوع الموقع.
5. أرجع كود HTML الصافي فقط بدون أي مقدمات أو شروحات أو علامات markdown.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `${systemInstruction}\n\nطلب المستخدم: ${prompt}` }]
        }]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || "خطأ في الاتصال بمحرك الذكاء الاصطناعي");
    }

    let rawCode = data.candidates[0].content.parts[0].text;
    const cleanCode = rawCode.replace(/```html/gi, '').replace(/```/g, '').trim();

    return new Response(JSON.stringify({ code: cleanCode }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
