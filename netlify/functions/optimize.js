exports.handler = async (event, context) => {
    if (event.httpMethod !== "POST") {
        return { 
            statusCode: 405, 
            body: JSON.stringify({ error: "Method Not Allowed" }) 
        };
    }

    try {
        const { promptMessage } = JSON.parse(event.body);
        
        // قراءة مفتاح جوجل السري بأمان
        const API_KEY = process.env.GEMINI_API_KEY;

        if (!API_KEY) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "خطأ: لم يتم ضبط مفتاح Gemini السري في إعدادات الخادم بعد." })
            };
        }

        // رابط الاتصال الرسمي بنظام ذكاء جوجل الاصطناعي Gemini 1.5 Flash
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

        // التأكد من أن جوجل أرسل الرد بنجاح
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            const aiText = data.candidates[0].content.parts[0].text;
            
            // صياغة الرد بنفس الشكل المتوقع في الواجهة ليعمل الكود دون تعديل في app.js
            const formattedResponse = {
                choices: [{
                    message: {
                        content: aiText
                    }
                }]
            };

            return {
                statusCode: 200,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formattedResponse)
            };
        } else {
            return {
                statusCode: 400,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ error: data.error?.message || "فشل ذكاء Gemini في الاستجابة." })
            };
        }

    } catch (error) {
        return { 
            statusCode: 500, 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: "حدث خطأ أثناء الاتصال بسيرفر جوجل الداخلي: " + error.message }) 
        };
    }
};
