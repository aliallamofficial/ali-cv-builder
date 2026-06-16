document.getElementById('optimizeBtn').addEventListener('click', async () => {
    const fullName = document.getElementById('fullName').value.trim();
    const jobTitle = document.getElementById('jobTitle').value.trim();
    const experience = document.getElementById('experience').value.trim();
    const skills = document.getElementById('skills').value.trim();

    if (!fullName || !jobTitle) {
        alert('رجاءً أدخل الاسم والمسمى الوظيفي على الأقل!');
        return;
    }

    const loading = document.getElementById('loading');
    const resultBox = document.getElementById('resultBox');

    loading.classList.remove('hidden');
    resultBox.innerHTML = '';

    const promptMessage = `قم بصياغة سيرة ذاتية احترافية ومميزة جداً باللغة العربية للشخص التالي:
    الاسم: ${fullName}
    الوظيفة: ${jobTitle}
    الخبرات: ${experience || 'لا توجد خبرات سابقة، يرجى صياغة أهداف مهنية ممتازة تناسب المبتدئين'}
    المهارات: ${skills || 'مهارات التواصل، العمل الجماعي، حل المشكلات'}
    يرجى التنسيق بشكل نقاط واضحة ومقنعة لأصحاب العمل.`;

    // استخدام سيرفر معالجة نصوص مباشر وسريع ومجاني تماماً بدون قيود مفاتيح
    const url = `https://text.pollinations.ai/`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                messages: [{ role: "user", content: promptMessage }],
                system: "أنت خبير محترف في كتابة السير الذاتية (CV Expert). تصيغ النصوص بأسلوب جذاب وبليغ باللغة العربية."
            })
        });

        const aiResult = await response.text();

        if (aiResult && aiResult.trim().length > 0) {
            resultBox.innerHTML = `<div style="white-space: pre-line; color: #fff; text-align: right; direction: rtl; line-height: 1.8; font-size: 16px;">${aiResult}</div>`;
        } else {
            throw new Error("استجابة فارغة من خادم الذكاء الاصطناعي");
        }
    } catch (error) {
        // حل احتياطي ذكي وفوري في حال حدوث أي مشكلة في الشبكة
        resultBox.innerHTML = `
        <div style="white-space: pre-line; color: #fff; text-align: right; direction: rtl; line-height: 1.8;">
        ✨ **السيرة الذاتية الاحترافية المقترحة لـ ${fullName}** ✨

        💼 **المسمى الوظيفي:** ${jobTitle}
        
        🎯 **الهدف المهني:**
        ساعٍ جاد ومتحمس لتوظيف مهاراتي وقدراتي في بيئة عمل احترافية تساهم في تطوير الأداء العام وتحقيق الأهداف المشتركة، مع تطوير الشغف المهني بشكل مستمر.

        🛠️ **المهارات الأساسية:**
        ${skills ? skills : '• مهارات التواصل الفعال والعمل الجماعي\n• القدرة على حل المشكلات وإدارة الوقت بكفاءة\n• التعلم السريع والتكيف مع ضغوط العمل'}

        📜 **الخبرات والأنشطة:**
        ${experience ? experience : '• البدء في مشاريع شخصية وتطوير الذات رقمياً.\n• الرغبة القوية في اكتساب الخبرة العملية الأولى والمساهمة الفورية في الفريق.'}
        </div>`;
    } finally {
        loading.classList.add('hidden');
    }
});
