// دالة للتحقق من السماح بإنشاء السيرة الذاتية بحد أقصى 5 مرات يومياً
function handleCVCreation() {
    const maxAllowedPerDay = 5; // الحد الأقصى المسموح به يومياً
    const today = new Date().toDateString(); // جلب تاريخ اليوم الحالي للهاتف
    
    // قراءة البيانات المخزنة في ذاكرة الهاتف المحلية
    let savedDate = localStorage.getItem('cv_creation_date');
    let creationCount = parseInt(localStorage.getItem('cv_creation_count')) || 0;

    // إذا كان تاريخ اليوم مختلفاً عن التاريخ المخزن، يتم تصفير العداد ليوم جديد
    if (savedDate !== today) {
        localStorage.setItem('cv_creation_date', today);
        creationCount = 0;
        localStorage.setItem('cv_creation_count', creationCount);
    }

    // التحقق مما إذا كان المستخدم قد استهلك المرات الخمس بالكامل
    if (creationCount >= maxAllowedPerDay) {
        alert("عذراً، لقد وصلت للحد الأقصى المسموح به لإنشاء وتعديل السير الذاتية اليوم (5 مرات). يمكنك المحاولة مجدداً غداً!");
        return false; // إيقاف العملية
    }

    // إذا كان مسموحاً، يتم زيادة العداد بمقدار 1 وحفظه في الذاكرة
    creationCount += 1;
    localStorage.setItem('cv_creation_count', creationCount);
    return true; // السماح بإتمام العملية
}

// حدث الضغط على زر تحسين السيرة الذاتية بالذكاء الاصطناعي
document.getElementById('optimizeBtn').addEventListener('click', async () => {
    const fullName = document.getElementById('fullName').value.trim();
    const jobTitle = document.getElementById('jobTitle').value.trim();
    const experience = document.getElementById('experience').value.trim();
    const skills = document.getElementById('skills').value.trim();

    if (!fullName || !jobTitle) {
        alert('رجاءً أدخل الاسم والمسمى الوظيفي على الأقل!');
        return;
    }

    // استدعاء دالة التحقق من الـ 5 مرات أولاً قبل تشغيل الذكاء الاصطناعي
    if (!handleCVCreation()) {
        return; 
    }

    const loading = document.getElementById('loading');
    const resultBox = document.getElementById('resultBox');

    loading.classList.remove('hidden');
    resultBox.innerHTML = '';

    // صياغة البرومبت بدقة واحترافية عالية تمنع نمطية الذكاء الاصطناعي
    const promptMessage = `قم بصياغة سيرة ذاتية احترافية وموجزة باللغة العربية للشخص التالي:
    الاسم: ${fullName}
    الوظيفة المستهدفة: ${jobTitle}
    الخبرات الحالية: ${experience || 'مبتدئ يبحث عن فرصته الأولى'}
    المهارات: ${skills || 'تواصل، عمل جماعي، تنظيم'}
    
    شروط الصياغة الصارمة:
    1. اكتب بأسلوب بشري طبيعي ومباشر، وتجنب تماماً الكلمات الابتذالية والمقدمات الإنشائية الطويلة (مثل: يسعدني، أتقدم، متطلع لـ).
    2. استخدم أفعالاً قوية ومباشرة في بداية النقاط (مثل: إدارة، تطوير، تنسيق، تنفيذ، تصميم).
    3. ركز على إبراز القيمة العملية والمهام والنتائج بدقة.
    4. نسق النص في أقسام واضحة مستخدماً النقاط (•) للفصل بين المهام والمهارات لسهولة القراءة من قِبل مسؤولي التوظيف.`;

    const url = `https://text.pollinations.ai/`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                messages: [{ role: "user", content: promptMessage }],
                system: "أنت مستشار توظيف خبير (HR Consultant). تكتب سير ذاتية دقيقة، واقعية، ومقنعة لأصحاب العمل، بعيداً عن حشو الذكاء الاصطناعي والعبارات المكررة."
            })
        });

        const aiResult = await response.text();

        if (aiResult && aiResult.trim().length > 0) {
            resultBox.innerHTML = `<div style="white-space: pre-line; color: #fff; text-align: right; direction: rtl; line-height: 1.8; font-size: 16px;">${aiResult}</div>`;
        } else {
            throw new Error("استجابة فارغة");
        }
    } catch (error) {
        // الحل الاحتياطي المطور بأسلوب بشري دقيق جداً واحترافي
        resultBox.innerHTML = `
        <div style="white-space: pre-line; color: #fff; text-align: right; direction: rtl; line-height: 1.8; font-size: 16px;">
        📌 **الملف المهني الشخصي**
        • **الاسم:** ${fullName}
        • **المسمى الوظيفي المستهدف:** ${jobTitle}

        🎯 **الخلاصة المهنية:**
        متخصص في مجال (${jobTitle})، أمتلك الشغف لتطوير المهارات العملية وتطبيق المعرفة الأكاديمية والشخصية للمساهمة في تحقيق أهداف الفريق بكفاءة، مع التركيز على الإنتاجية وحل المشكلات البيئية للعمل.

        🛠️ **المهارات والقدرات الأساسية:**
        ${skills ? skills.split('،').map(s => `• ${s.trim()}`).join('\n') : '• تنظيم المهام وإدارة الوقت بفعالية\n• مهارات التواصل الفعال والعمل الجماعي المشترك\n• القدرة على التحليل وحل المشكلات التقنية أو الإدارية'}

        📜 **الخبرات المهنية والأنشطة:**
        ${experience ? experience : '• التركيز على بناء وتطوير المشاريع الشخصية والتطبيق العملي المستمر.\n• البحث عن الفرصة المهنية الأولى للمساهمة الفورية واكتساب الخبرة الميدانية.'}
        </div>`;
    } finally {
        loading.classList.add('hidden');
    }
});
