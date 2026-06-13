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

    const promptMessage = `أنت خبير محترف في الموارد البشرية (HR). قم بصياغة سيرة ذاتية احترافية وجذابة باللغة العربية بناءً على البيانات التالية:
    الاسم: ${fullName}
    المسمى الوظيفي المستهدف: ${jobTitle}
    الخبرات: ${experience}
    المهارات: ${skills}
    
    نسق الإجابة بنقاط واضحة وبأسلوب احترافي مشوق ومناسب للشركات.`;

    try {
        // نضع المفتاح الذي حصلت عليه هنا مباشرة لتخطي مشاكل السيرفرات تماماً
        const API_KEY = "AQ.Ab8RN6JD25Z5iWBdlqhXgHIlVVYuVhEMl1Kd77cdUrUaBvzlUQ"; 
        
        // الرابط الرسمي والمباشر لشركة جوجل بدون أي وسيط
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: promptMessage }]
                }]
            })
        });

        const data = await response.json();

        if (response.ok && data.candidates && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
            const aiResult = data.candidates[0].content.parts[0].text;
            resultBox.innerHTML = `<div style="white-space: pre-line; color: #fff; line-height: 1.6;">${aiResult}</div>`;
        } else {
            const errMsg = data.error?.message || 'حدث خطأ في استجابة جوجل.';
            resultBox.innerHTML = `<p style="color: #ff4a4a; font-weight: bold;">خطأ: ${errMsg}</p>`;
        }

    } catch (error) {
        resultBox.innerHTML = `<p style="color: #ff4a4a; font-weight: bold;">فشل الاتصال بالذكاء الاصطناعي: ${error.message}</p>`;
    } finally {
        loading.classList.add('hidden');
    }
});
