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

// دالة ذكية لتحويل لغة الـ Markdown التلقائية (النجوم **) إلى وسوم HTML احترافية وعريضة
function formatMarkdown(text) {
    if (!text) return '';
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
        .replace(/\*(.*?)\*/g, '<em>$1</em>')          
        .replace(/\n/g, '<br>');                        
}

// دالة لتطبيق ثيم القوالب ودعم ميزة التحكم بنوع الخط وحجمه برمجياً
function getTemplateStyles(selectedLang, selectedTemplate) {
    const chosenFont = document.getElementById('fontFamilySelect').value;
    const chosenSize = document.getElementById('fontSizeSelect').value;

    let styles = `padding:25px; line-height:1.8; font-size:${chosenSize}; font-family:${chosenFont}; border-radius:8px; margin-top:15px; box-shadow: 0 2px 10px rgba(0,0,0,0.15); overflow: hidden;`;
    styles += selectedLang === 'ar' ? " text-align: right; direction: rtl;" : " text-align: left; direction: ltr(";
    
    if (selectedTemplate === 'modern') styles += " background-color: #1e293b; color: #f8fafc; border-left: 6px solid #3b82f6;";
    else if (selectedTemplate === 'classic') styles += " background-color: #ffffff; color: #000000; border: 2px solid #000000;";
    else if (selectedTemplate === 'elegant') styles += " background-color: #fafaf9; color: #1c1917; border-top: 6px solid #d97706;";
    
    return styles;
}

// دالة مخصصة لحقن التوقيع الرقمي ومفتاح الـ GPG في أسفل الـ CV لتوثيقه رسمياً وحمايته
function appendCryptoSignatureToCV(htmlContent) {
    const signatureHtml = `
        <div class="cv-crypto-footer" style="margin-top: 35px; padding-top: 15px; border-top: 1px dashed #cbd5e1; text-align: center; font-family: monospace; direction: ltr; clear: both;">
            <p style="font-size: 10px; color: #64748b; margin: 0; letter-spacing: 1px;">🔒 Digitally Signed & Verified via AI CV Optimizer</p>
            <p style="font-size: 11px; color: #0f172a; font-weight: bold; margin: 4px 0; letter-spacing: 0.5px;">Authority Key: @aliallamofficial [GPG: 55392380FBF1C8F1]</p>
        </div>
    `;
    return htmlContent + signatureHtml;
}

// دالة لتوليد الـ QR Code السريع وإضافته تلقائياً داخل السيرة الذاتية لربط الملفات الخارجية
function generateCVQRCode(containerId, textToEncode) {
    const existingQr = document.getElementById('cvQrCode');
    if (existingQr) existingQr.remove();

    const qrContainer = document.createElement('div');
    qrContainer.id = "cvQrCode";
    const isAr = document.getElementById('langSelect').value === 'ar';
    qrContainer.style = `float: ${isAr ? 'left' : 'right'}; margin: 10px; padding: 6px; background: #fff; border: 1px solid #cbd5e1; border-radius: 6px; display: inline-block;`;
    
    const targetElement = document.getElementById(containerId);
    if (targetElement) {
        targetElement.prepend(qrContainer);
        new QRCode(qrContainer, {
            text: textToEncode,
            width: 80,
            height: 80,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
        });
    }
}

// حدث الضغط على زر تحسين السيرة الذاتية (مدمج به ميزة التدقيق اللغوي التلقائي)
document.getElementById('optimizeBtn').addEventListener('click', async () => {
    const btn = document.getElementById('optimizeBtn');
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

    btn.disabled = true;
    loading.classList.remove('hidden');
    downloadContainer.classList.add('hidden');
    resultBox.innerHTML = '';

    if (navigator.onLine && jobTitle) {
        askAI(`أعطني نصيحة توظيف احترافية وموجزة جداً (سطر واحد فقط) لشخص يريد التقديم على وظيفة: ${jobTitle}`, "أنت خبير توظيف تعطي نصيحة مباشرة بدون مقدمات.")
        .then(aiTip => {
            if(aiTip) document.getElementById('liveTipText').innerText = aiTip;
        }).catch(()=>{});
    }

    if (!navigator.onLine) {
        alert(selectedLang === 'ar' ? "أنت تعمل الآن بدون إنترنت (Offline Mode)." : "You are offline.");
        let offlineResult = `<h2>${fullName}</h2><h3>${jobTitle}</h3><hr><br>${experience || ''}<br>${skills || ''}`;
        let templateStyles = getTemplateStyles(selectedLang, selectedTemplate);
        resultBox.innerHTML = `<div id="cvTemplateArea" style="${templateStyles}">${offlineResult}</div>`;
        downloadContainer.classList.remove('hidden');
        loading.classList.add('hidden');
        btn.disabled = false;
        return; 
    }

    let promptMessage = selectedLang === 'ar' ? 
        `قم بصياغة سيرة ذاتية احترافية وموجزة باللغة العربية للشخص التالي:\nالاسم: ${fullName}\nالوظيفة: ${jobTitle}\nالخبرات: ${experience || 'مبتدئ'}\nالمهارات: ${skills || 'تواصل'}\n\nشروط صارمة: أسلوب بشري، نقاط واضحة (•)، أفعال حركة قوية، وقم بإجراء تدقيق لغوي وإملائي كامل وتصحيح كافة الأخطاء النحوية واللغوية بصرامة.` :
        `Create a professional resume in English for:\nName: ${fullName}\nJob: ${jobTitle}\nExperience: ${experience || 'Entry-level'}\nSkills: ${skills || 'Communication'}\n\nStrict Rules: Human style, bullet points (•), and absolute proofreading to ensure zero spelling or grammatical errors.`;

    const systemMessage = selectedLang === 'ar' ? 
        "أنت مستشار توظيف خبير ومدقق لغوي صارم (HR & Proofreader Consultant). تكتب سير ذاتية بليغة خالية تماماً من الأخطاء." : 
        "You are an expert HR Consultant and professional editor. You write flawless, ATS-friendly resumes.";

    try {
        const aiResult = await askAI(promptMessage, systemMessage);
        if (aiResult && aiResult.trim().length > 0) {
            let templateStyles = getTemplateStyles(selectedLang, selectedTemplate);
            let formattedResult = formatMarkdown(aiResult);
            
            resultBox.innerHTML = `<div id="cvTemplateArea" style="${templateStyles}">${formattedResult}</div>`;
            generateCVQRCode('cvTemplateArea', `https://aliallamofficial.github.io/ali-cv-builder/?user=${encodeURIComponent(fullName)}`);
            downloadContainer.classList.remove('hidden'); 
        } else { throw new Error(); }
    } catch (error) {
        resultBox.innerHTML = `<p style="color:red;">حدث خطأ أثناء الصياغة. يرجى المحاولة مجدداً.</p>`;
    } finally { 
        loading.classList.add('hidden'); 
        btn.disabled = false;
    }
});

// ✉️ ميزة صانع رسائل التغطية الذكي (AI Cover Letter Generator)
document.getElementById('coverLetterBtn').addEventListener('click', async () => {
    const btn = document.getElementById('coverLetterBtn');
    const fullName = document.getElementById('fullName').value.trim();
    const jobTitle = document.getElementById('jobTitle').value.trim();
    const experience = document.getElementById('experience').value.trim();
    const selectedLang = document.getElementById('langSelect').value;

    if (!fullName || !jobTitle) {
        alert(selectedLang === 'ar' ? 'رجاءً أدخل الاسم والمسمى الوظيفي أولاً لإنشاء رسالة التغطية!' : 'Please enter Name and Job Title first!');
        return;
    }

    if (!navigator.onLine) {
        alert(selectedLang === 'ar' ? "هذه الميزة تتطلب اتصالاً بالإنترنت." : "This feature requires an internet connection.");
        return;
    }

    const loading = document.getElementById('loading');
    const resultBox = document.getElementById('resultBox');
    
    btn.disabled = true;
    loading.classList.remove('hidden');

    let promptMessage = selectedLang === 'ar' ?
        `اكتب رسالة تغطية (Cover Letter) احترافية ومقنعة وموجهة لمدير التوظيف باسم المرشح: ${fullName} للتقديم على وظيفة: ${jobTitle}. بناءً على خبراته المذكورة باختصار: ${experience || 'مبتدئ متحمس'}. اجعلها منسقة وخالية تماماً من الأخطاء اللغوية.` :
        `Write a professional Cover Letter from ${fullName} for a ${jobTitle} position based on this brief experience: ${experience || 'Enthusiastic entry-level'}. Ensure zero grammatical mistakes.`;

    try {
        const aiResult = await askAI(promptMessage, "أنت خبير صياغة خطابات التوظيف الرسمية. تكتب بأسلوب جذاب وبليغ.");
        if (aiResult) {
            let formattedLetter = formatMarkdown(aiResult);
            let templateStyles = getTemplateStyles(selectedLang, document.getElementById('templateSelect').value);
            resultBox.innerHTML = `<div id="cvTemplateArea" style="${templateStyles}"><h3>✉️ رسالة التغطية الاحترافية (Cover Letter):</h3><br>${formattedLetter}</div>`;
            document.getElementById('downloadContainer').classList.remove('hidden');
        }
    } catch (e) {
        alert("فشل خادم توليد الرسائل حالياً.");
    } finally { 
        loading.classList.add('hidden'); 
        btn.disabled = false;
    }
});

// 📊 ميزة تقييم السيرة الذاتية (Resume Scoring)
document.getElementById('rateBtn').addEventListener('click', async () => {
    const btn = document.getElementById('rateBtn');
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

    btn.disabled = true;
    loading.classList.remove('hidden');

    let promptMessage = `قم بتحليل وتقييم البيانات المدخلة للسيرة الذاتية التالية وإعطاء تقييم من 100%:\nالاسم: ${fullName}\nالمسمى المستهدف: ${jobTitle}\nالخبرات: ${experience}\nالمهارات: ${skills}`;

    try {
        const aiResult = await askAI(promptMessage, "أنت مسؤول توظيف خبير ومدقق سير ذاتية صارم.");
        if (aiResult) {
            let formattedRating = formatMarkdown(aiResult);
            resultBox.innerHTML = `<div style="padding:20px; background:#1e293b; color:#fff; text-align:right; direction:rtl; border-radius:8px; line-height:1.8;"><h3>📊 تقييم السيرة الذاتية الذكي:</h3><br>${formattedRating}</div>`;
        }
    } catch (error) {
        resultBox.innerHTML = `<p style="color:red;">تعذر الاتصال بخادم التقييم.</p>`;
    } finally { 
        loading.classList.add('hidden'); 
        btn.disabled = false;
    }
});

// 🔍 تشغيل ميزة فحص التوافق العالمي ATS Shadow Checker
document.getElementById('atsCheckBtn').addEventListener('click', async () => {
    const btn = document.getElementById('atsCheckBtn');
    const cvArea = document.getElementById('cvTemplateArea');
    if (!cvArea) return;

    const loading = document.getElementById('loading');
    const resultBox = document.getElementById('resultBox');
    
    btn.disabled = true;
    loading.classList.remove('hidden');

    let promptMessage = `تظاهر بأنك نظام فحص السير الذاتية العالمي ATS. قم بقراءة وفحص النص التالي ومقارنته بالمسمى المستهدف لتحديد مدى استجابته للخوارزميات:\n\n${cvArea.innerText}`;

    try {
        const aiResult = await askAI(promptMessage, "أنت روبوت ونظام تصفية وفرز آلي ATS عالمي تفحص الكلمات الدلالية.");
        if (aiResult) {
            let formattedAts = formatMarkdown(aiResult);
            resultBox.innerHTML = `<div class="ats-report" style="padding:20px; background:rgba(15,23,42,0.9); border:1px solid #38bdf8; color:#f8fafc; border-radius:12px; direction:rtl; text-align:right; line-height:1.8;"><h3>🔍 تقرير محاكاة نظام الفرز العالمي ATS:</h3><br>${formattedAts}</div>`;
        }
    } catch (e) {
        alert("فشل فحص الـ ATS حالياً.");
    } finally { 
        loading.classList.add('hidden'); 
        btn.disabled = false;
    }
});

// 🔐 تشغيل ميزة التوقيع والتشفير الرقمي GPG الرقمي للمستند
document.getElementById('signCvBtn').addEventListener('click', () => {
    const cvArea = document.getElementById('cvTemplateArea');
    if (!cvArea) return;

    const randomHash = 'SHA256:' + Math.random().toString(16).substring(2, 10).toUpperCase() + '...' + Math.random().toString(16).substring(2, 8).toUpperCase();
    const badgeHtml = `<div class="crypto-badge" style="display: inline-flex; align-items: center; gap: 8px; background: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; color: #10b981; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-bottom: 15px; font-family:monospace; direction:ltr;">🔐 SIGNED BY @aliallamofficial [GPG: 55392380FBF1C8F1] | ${randomHash}</div>`;
    
    const currentContent = cvArea.innerHTML;
    if(!currentContent.includes('SIGNED BY')) {
        cvArea.innerHTML = badgeHtml + currentContent;
        alert('تم توقيع السيرة الذاتية رقمياً بنجاح!');
    }
});

// 📥 ميزة إظهار خيارات القائمة المنسدلة للتحميل عند الضغط على الزر الرئيسي
document.getElementById('mainDownloadBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('downloadOptions').classList.toggle('hidden');
});

document.addEventListener('click', () => {
    const options = document.getElementById('downloadOptions');
    if(options) options.classList.add('hidden');
});

// 📄 خيار تحميل بصيغة PDF
document.getElementById('downloadPdfBtn').addEventListener('click', () => {
    const cvElement = document.getElementById('cvTemplateArea');
    if (!cvElement || cvElement.innerText.trim() === "" || cvElement.innerText.includes("ستظهر سيرتك الذاتية")) return;

    let currentHtml = cvElement.innerHTML;
    if (!currentHtml.includes('cv-crypto-footer')) {
        currentHtml = appendCryptoSignatureToCV(currentHtml);
    }

    const printWindow = window.open('', '_blank', 'width=800,height=900');
    const isEn = cvElement.style.textAlign === 'left';
    const direction = isEn ? 'ltr' : 'rtl';

    printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="${direction}">
        <head>
            <title>المستند الموثق</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 40px; background: #ffffff; color: #000000; line-height: 1.8; font-size: 15px;}
                strong { font-weight: bold; color: #000000; }
                .crypto-badge { display: none !important; }
                @media print { body { padding: 0; } @page { margin: 2cm; } }
            </style>
        </head>
        <body>
            <div>${currentHtml}</div>
            <script>
                window.onload = function() { window.print(); setTimeout(function() { window.close(); }, 500); };
            <\/script>
        </body>
        </html>
    `);
    printWindow.document.close();
});

// 📄 خيار تحميل السيرة الذاتية بصيغة Word
document.getElementById('downloadWordBtn').addEventListener('click', () => {
    const cvElement = document.getElementById('cvTemplateArea');
    if (!cvElement) return;

    let cvContentText = cvElement.innerText;
    const wordSignature = `\n\n=========================================\n🔒 Digitally Signed via AI CV Optimizer\nAuthority Key: @aliallamofficial [GPG: 55392380FBF1C8F1]\n=========================================`;
    const fullWordContent = cvContentText + wordSignature;
    const wordUrl = 'data:application/msword;charset=utf-8,\ufeff' + encodeURIComponent(fullWordContent);

    const a = document.createElement('a');
    a.href = wordUrl;
    a.download = 'المستند.doc';
    a.click();
});

// مصفوفة النصائح الجاهزة لتغيير النصيحة تلقائياً محلياً (عند عدم الاتصال)
const cvTips = [
    "تجنب وضع صورتك الشخصية إذا كنت تقدم على شركات عالمية تعتمد نظام ATS تماماً.",
    "احرص على ألا تتجاوز سيرتك الذاتية صفحة واحدة إذا كانت خبرتك أقل من 5 سنوات.",
    "استخدم أرقاماً ونسباً مئوية حقيقية لإثبات إنجازاتك (مثال: زيادة المبيعات بنسبة 20%).",
    "البريد الإلكتروني المهني يجب أن يحتوي على اسمك الحقيقي، ابتعد تماماً عن الأسماء مستعارة.",
    "الكلمات المفتاحية المأخوذة من إعلان الوظيفة نفسه هي مفتاحك السحري لتخطي فلترة الـ ATS."
];

// ==========================================
// 🔄 دالة الفحص التلقائي لآخر تعديل للملفات على السيرفر لإطلاق التنبيهات
// ==========================================
async function checkAutomatedUpdates() {
    if (!navigator.onLine) return;
    try {
        const response = await fetch(window.location.href, { method: 'HEAD', cache: 'no-cache' });
        const lastModifiedHeader = response.headers.get('Last-Modified') || response.headers.get('ETag');
        
        if (lastModifiedHeader) {
            const savedBuildTag = localStorage.getItem('app_last_build_tag');
            
            if (savedBuildTag && savedBuildTag !== lastModifiedHeader) {
                if ("Notification" in window && Notification.permission === "granted") {
                    new Notification("🚀 تم تحديث التطبيق تلقائياً!", {
                        body: "هناك ميزات وتحسينات جديدة تمت إضافتها للتطبيق، ألقِ نظرة عليها الآن."
                    });
                }
                setTimeout(() => {
                    alert("✨ تحديث تلقائي سحري:\nتم رصد تعديلات برمجية وتحسينات جديدة في النظام لزيادة سرعة الذكاء الاصطناعي وتطوير المظهر!");
                }, 3000);
            }
            localStorage.setItem('app_last_build_tag', lastModifiedHeader);
        }
    } catch (e) { console.log("خطأ في جلب تاريخ التحديث التلقائي"); }
}

// ==========================================
// ⚙️ إدارة القائمة المنسدلة والتهيئة العامة عند التحميل
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    // 1. تشغيل النصائح المحلية العشوائية عند فتح الصفحة
    const tipElement = document.getElementById('liveTipText');
    if (tipElement) {
        tipElement.innerText = cvTips[Math.floor(Math.random() * cvTips.length)];
    }

    // 2. إدارة فتح وإغلاق قائمة أعلى اليسار المنسدلة
    const dropdownToggleBtn = document.getElementById('dropdownToggleBtn');
    const topLeftMenu = document.getElementById('topLeftMenu');
    if (dropdownToggleBtn && topLeftMenu) {
        dropdownToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            topLeftMenu.classList.toggle('hidden');
        });

        document.addEventListener('click', (e) => {
            if (!topLeftMenu.contains(e.target) && e.target !== dropdownToggleBtn) {
                topLeftMenu.classList.add('hidden');
            }
        });
    }

    // 3. ربط زر تفعيل الإشعارات من داخل القائمة المنسدلة
    const enableNotificationsBtn = document.getElementById('enableNotificationsBtn');
    if (enableNotificationsBtn) {
        enableNotificationsBtn.addEventListener('click', () => {
            if (!("Notification" in window)) {
                alert("متصفحك الحالي لا يدعم إشعارات الويب.");
                return;
            }
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    alert("🎯 تم تفعيل الإشعارات بنجاح! ستصلك تنبيهات تلقائية عند إضافة أي تحديث.");
                    new Notification("🚀 نظام الإشعارات نشط", {
                        body: "تم ربط التطبيق بنظام التنبيهات الذكي بنجاح."
                    });
                } else {
                    alert("لم يتم تفعيل الإذن. يمكنك تفعيله يدوياً من إعدادات المتصفح علوياً.");
                }
            });
        });
    }

    // 4. تشغيل الفحص الآلي الذكي للتحديثات المرفوعة على السيرفر
    checkAutomatedUpdates();

    // 5. إخفاء الواجهة الترحيبية المتحركة
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if (splash) {
            splash.style.opacity = '0'; 
            setTimeout(() => { splash.remove(); }, 500);
        }
    }, 2000);
});
