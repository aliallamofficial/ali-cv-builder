document.getElementById('optimizeBtn').addEventListener('click', async () => {
    const fullName = document.getElementById('fullName').value;
    const jobTitle = document.getElementById('jobTitle').value;
    const experience = document.getElementById('experience').value;
    const skills = document.getElementById('skills').value;

    if (!jobTitle || !experience) {
        alert('الرجاء كتابة المسمى الوظيفي والخبرات على الأقل ليتمكن الذكاء الاصطناعي من مساعدتك.');
        return;
    }

    const loadingDiv = document.getElementById('loading');
    const resultBox = document.getElementById('resultBox');
    
    loadingDiv.classList.remove('hidden');
    resultBox.innerHTML = ''; 

    const promptMessage = `أنت خبير محترف في الموارد البشرية (HR) وكتابة السير الذاتية. 
    أريدك أن تحسن هذه البيانات لتصبح سيرة ذاتية احترافية وجذابة باللغة العربية.
    الاسم: ${fullName}
    المسمى الوظيفي المستهدف: ${jobTitle}
    الخبرات الحالية: ${experience}
    المهارات: ${skills}
    
    قم بإعادة صياغة الخبرات بأسلوب نقاط القوة والإنجازات (STAR method)، ونظم السيرة الذاتية بشكل احترافي جداً وجاهز للنسخ.`;

    try {
        // الاتصال بالسيرفر المحلي الآمن الخاص بك
        const response = await fetch('http://localhost:3000/api/optimize-cv', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ promptMessage: promptMessage })
        });

        const data = await response.json();
        
        // التحقق مما إذا كان السيرفر أرجع خطأ بسبب استهلاك حد الـ 3 مرات
        if (data.error) {
            resultBox.innerHTML = `<p style="color: #e74c3c; font-weight: bold; text-align: center;">${data.error}</p>`;
            return;
        }

        if (data.choices && data.choices[0].message.content) {
            const aiResult = data.choices[0].message.content;
            resultBox.innerHTML = `<div style="white-space: pre-line;">${aiResult}</div>`;
        } else {
            resultBox.innerHTML = '<p style="color: red;">عذراً، حدث خطأ أثناء تحسين البيانات. حاول مجدداً.</p>';
        }

    } catch (error) {
        console.error('Error:', error);
        resultBox.innerHTML = '<p style="color: red; text-align: center;">تأكد من تشغيل السيرفر المحلي (server.js) على جهازك أولاً ليتمكن التطبيق من العمل.</p>';
    } finally {
        loadingDiv.classList.add('hidden');
    }
});
