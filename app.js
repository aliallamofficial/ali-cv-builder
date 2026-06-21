// 📄 خيار تحميل بصيغة PDF والطباعة المباشرة المتوافقة مع التطبيقات
document.getElementById('downloadPdfBtn').addEventListener('click', () => {
    const cvElement = document.getElementById('cvTemplateArea');
    const cvContent = cvElement.innerHTML;
    const isEn = cvElement.style.textAlign === 'left';
    const direction = isEn ? 'ltr' : 'rtl';

    // إنشاء إطار خفي (iframe) للطباعة دون فتح صفحة أو نافذة جديدة تسبب مشاكل داخل التطبيق
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`<html dir="${direction}"><head><title>السيرة_الذاتية</title><style>body{font-family:sans-serif; padding:20px; color:#000; background:#fff;}</style></head><body>${printContent}</body></html>`);
    doc.close();

    // تشغيل أمر الحفظ كـ PDF والطباعة من داخل الإطار الخفي
    iframe.contentWindow.focus();
    iframe.contentWindow.print();

    // تنظيف العنصر المؤقت بعد ثوانٍ بسيطة
    setTimeout(() => {
        document.body.removeChild(iframe);
    }, 1000);
});
