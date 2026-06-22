// دالة التحقق من حد الاستخدام اليومي المخصص (5 مرات في اليوم)
function handleCVCreation() {
    const maxAllowedPerDay = 5; 
    const today = new Date().toDateString(); 
    
    let savedDate = localStorage.getItem('cv_creation_date');
    let creationCount = parseInt(localStorage.getItem('cv_creation_count')) || 0;

    if (savedDate !== today) {
        localStorage.setItem('cv_creation_date', today);
        creationCount = 0;
        localStorage.setItem('cv_creation_count', creationCount);
    }

    if (creationCount >= maxAllowedPerDay) {
        alert("عذراً، لقد وصلت للحد الأقصى المسموح به اليوم (5 مرات). يمكنك المحاولة مجدداً غداً!");
        return false;
    }

    creationCount += 1;
    localStorage.setItem('cv_creation_count', creationCount);
    return true;
}

// دالة عامة لإرسال الطلبات إلى API الذكاء الاصطناعي
async function askAI(promptMessage, systemMessage) {
    const url = `https://text.pollinations.ai/`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            messages: [{ role: "user", content: promptMessage }],
            system: systemMessage
        })
    });
    return await response.text();
}

// دالة لتطبيق ثيم القوالب على النتيجة المطبوعة والمستخرجة
function getTemplateStyles(selectedLang, selectedTemplate) {
    let styles = "padding:25px; line-height:1.8; font-size:16px; border-radius:8px; margin-top:15px; box-shadow: 0 2px 10px rgba(0,0,0,0.15); font-family: sans-serif;";
    styles += selectedLang === 'ar' ? " text-align: right; direction: rtl;" : " text-align: left; direction: ltr;";
    
    if (selectedTemplate === 'modern') styles += " background-color: #1e293b; color: #f8fafc; border-left: 6px solid #3b82f6;";
    else if (selectedTemplate === 'classic') styles += " background-color: #ffffff; color: #000000; border: 2px solid #000000; font-family: 'Times New Roman', serif;";
    else if (selectedTemplate === 'elegant') styles += " background-color: #fafaf9; color: #1c1917; border-top: 6px solid #d97706;";
    
    return styles;
}

// حدث الضغط على زر تحسين السيرة الذاتية
document.getElementById('optimizeBtn').addEventListener('click', async () => {
    const fullName = document.getElementById('fullName').value.trim();
    const jobTitle = document.getElementById('jobTitle').value.trim();
    const experience = document.getElementById('experience').value.trim();
    const skills = document.getElementById('skills').value.trim();
    const selectedLang = document.getElementById('langSelect').value;
    const selectedTemplate = document.getElementById('templateSelect').value;

    if (!fullName || !jobTitle) {
        alert(selectedLang === 'ar' ? 'رجاءً أدخل الاسم والمسمى الوظيفي على الأقل!' : 'Please enter Name and Job Title!');
        return;
    }

    if (!handleCVCreation()) return; 

    const loading = document.getElementById('loading');
    const resultBox = document.getElementById('resultBox');
    const downloadContainer = document.getElementById('downloadContainer');

    loading.classList.remove('hidden');
    downloadContainer.classList.add('hidden');
    resultBox.innerHTML = '';

    let promptMessage = selectedLang === 'ar' ? 
        `قم بصياغة سيرة ذاتية احترافية وموجزة باللغة العربية للشخص التالي:\nالاسم: ${fullName}\nالوظيفة: ${jobTitle}\nالخبرات: ${experience || 'مبتدئ'}\nالمهارات: ${skills || 'تواصل، عمل جماعي'}\n\nشروط صارمة: أسلوب بشري بدون مقدمات ذكاء اصطناعي، نقاط واضحة (•)، أفعال حركة قوية.` :
        `Create a professional and concise resume in English for:\nName: ${fullName}\nJob: ${jobTitle}\nExperience: ${experience || 'Entry-level'}\nSkills: ${skills || 'Communication'}\n\nStrict Rules: Human style, strong action verbs, clear bullet points (•).`;

    const systemMessage = selectedLang === 'ar' ? 
        "أنت مستشار توظيف خبير (HR Consultant). تكتب سير ذاتية دقيقة، واقعية، ومقنعة لأصحاب العمل، بعيداً عن حشو الذكاء الاصطناعي." : 
        "You are an expert HR Consultant. You write precise, ATS-friendly, and realistic resumes without fluff.";

    try {
        const aiResult = await askAI(promptMessage, systemMessage);
        if (aiResult && aiResult.trim().length > 0) {
            let templateStyles = getTemplateStyles(selectedLang, selectedTemplate);
            resultBox.innerHTML = `<div id="cvTemplateArea" style="${templateStyles}">${aiResult.replace(/\n/g, '<br>')}</div>`;
            downloadContainer.classList.remove('hidden'); 
        } else { throw new Error(); }
    } catch (error) {
        resultBox.innerHTML = `<p style="color:red;">حدث خطأ أثناء الصياغة. يرجى التحقق من الاتصال بالشبكة.</p>`;
    } finally { loading.classList.add('hidden'); }
});

// 🌟 ميزة تقييم السيرة الذاتية الجديدة (Resume Scoring) 🌟
document.getElementById('rateBtn').addEventListener('click', async () => {
    const fullName = document.getElementById('fullName').value.trim();
    const jobTitle = document.getElementById('jobTitle').value.trim();
    const experience = document.getElementById('experience').value.trim();
    const skills = document.getElementById('skills').value.trim();
    const selectedLang = document.getElementById('langSelect').value;

    if (!fullName || !jobTitle) {
        alert(selectedLang === 'ar' ? 'رجاءً أدخل الاسم والمسمى الوظيفي أولاً ليتم التقييم بناءً عليهما!' : 'Please enter Name and Job Title first!');
        return;
    }

    const loading = document.getElementById('loading');
    const resultBox = document.getElementById('resultBox');
    const downloadContainer = document.getElementById('downloadContainer');

    loading.classList.remove('hidden');
    downloadContainer.classList.add('hidden');
    resultBox.innerHTML = '';

    let promptMessage = `قم بتحليل وتقييم البيانات المدخلة للسيرة الذاتية التالية وإعطاء تقييم من 100%:
    الاسم: ${fullName}
    المسمى المستهدف: ${jobTitle}
    الخبرات المكتوبة: ${experience || 'لم يذكر خبرات'}
    المهارات المكتوبة: ${skills || 'لم يذكر مهارات'}
    
    يرجى تقسيم الإجابة إلى:
    1. النسبة المئوية الإجمالية للتقييم (مثال: 65/100) بشكل عريض وواضح في البداية.
    2. نقاط القوة في البيانات الحالية.
    3. نقاط الضعف وما ينقص السيرة الذاتية لتجتاز أنظمة الفرز (ATS).
    4. نصائح ذهبية ومحددة للتطوير فوراً.`;

    try {
        const aiResult = await askAI(promptMessage, "أنت مسؤول توظيف خبير ومدقق سير ذاتية صارم. تعطي تقييمات حقيقية ونقد بناء جداً باللغة العربية.");
        if (aiResult) {
            resultBox.innerHTML = `<div style="padding:20px; background:#1e293b; color:#fff; text-align:right; direction:rtl; border-radius:8px; line-height:1.8;"><h3>📊 تقييم السيرة الذاتية الذكي:</h3>${aiResult.replace(/\n/g, '<br>')}</div>`;
        }
    } catch (error) {
        resultBox.innerHTML = `<p style="color:red;">تعذر الاتصال بخادم التقييم حالياً.</p>`;
    } finally { loading.classList.add('hidden'); }
});

// 📥 ميزة إظهار خيارات القائمة المنسدلة للتحميل عند الضغط على الزر الرئيسي
document.getElementById('mainDownloadBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('downloadOptions').classList.toggle('hidden');
});

// إغلاق القائمة المنسدلة تلقائياً إذا ضغط المستخدم في أي مكان خارجها
document.addEventListener('click', () => {
    document.getElementById('downloadOptions').classList.add('hidden');
});

// 📄 خيار تحميل بصيغة PDF الشامل مع ميزة النسخ التلقائي كحل احتياطي للموبايل
document.getElementById('downloadPdfBtn').addEventListener('click', () => {
    const cvElement = document.getElementById('cvTemplateArea');
    const cvContent = cvElement.innerHTML;
    const cvText = cvElement.innerText;
    const isEn = cvElement.style.textAlign === 'left';
    const direction = isEn ? 'ltr' : 'rtl';

    const fullHtml = `<html dir="${direction}"><head><title>السيرة_الذاتية</title><style>body{font-family:sans-serif; padding:20px; color:#000; background:#fff;}</style></head><body>${cvContent}</body></html>`;
    const pdfUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(fullHtml);

    // محاولة النسخ الفوري للحافظة كأمان للمستخدم
    navigator.clipboard.writeText(cvText).catch(() => {});

    if (typeof median !== 'undefined' && median.download) {
        median.download.downloadFile({ url: pdfUrl, filename: 'السيرة_الذاتية.html' });
        alert("تم بدء التحميل! وتم أيضاً نسخ نص السيرة الذاتية لحافظة جهازك تلقائياً.");
    } else {
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed'; iframe.style.width = '0'; iframe.style.height = '0'; iframe.style.border = '0';
        document.body.appendChild(iframe);
        const doc = iframe.contentWindow.document;
        doc.open(); doc.write(fullHtml); doc.close();
        iframe.contentWindow.focus(); iframe.contentWindow.print();
        setTimeout(() => { document.body.removeChild(iframe); }, 1000);
        alert("تم نسخ نص السيرة الذاتية لحافظة جهازك تلقائياً!");
    }
});

// 📄 خيار تحميل السيرة الذاتية بصيغة Word الشامل مع ميزة النسخ التلقائي كحل احتياطي
document.getElementById('downloadWordBtn').addEventListener('click', () => {
    const cvContent = document.getElementById('cvTemplateArea').innerText;
    const wordUrl = 'data:application/msword;charset=utf-8,\ufeff' + encodeURIComponent(cvContent);

    // محاولة نسخ النص فوراً
    navigator.clipboard.writeText(cvContent).then(() => {
        alert("رائع! تم نسخ نص السيرة الذاتية بالكامل تلقائياً إلى حافظة هاتفك. يمكنك الآن لصقها (.paste) في أي ملف أو تطبيق للتحكم الكامل بها.");
    }).catch(() => {});

    if (typeof median !== 'undefined' && median.download) {
        median.download.downloadFile({ url: wordUrl, filename: 'السيرة_الذاتية.doc' });
    } else {
        const a = document.createElement('a');
        a.href = wordUrl;
        a.download = 'السيرة_الذاتية.doc';
        a.click();
    }
});

// ==========================================
// التعديل الجديد: إخفاء الواجهة الترحيبية المتحركة بعد ثانيتين
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if (splash) {
            splash.style.opacity = '0'; // تأثير تلاشي ناعم
            setTimeout(() => {
                splash.remove(); // إزالة العنصر تماماً من شجرة الـ DOM
            }, 500);
        }
    }, 2000); // العرض مستمر لمدة ثانيتين كاملتين (2000ms)
});
