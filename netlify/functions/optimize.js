exports.handler = async (event, context) => {
    if (event.httpMethod !== "POST") {
        return { 
            statusCode: 405, 
            body: JSON.stringify({ error: "Method Not Allowed" }) 
        };
    }

    try {
        const { promptMessage } = JSON.parse(event.body);
        const API_KEY = process.env.GEMINI_API_KEY;

        if (!API_KEY) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "خطأ: لم يتم ضبط مفتاح Gemini في إعدادات الخادم بعد." })
            };
        }

        // الرابط الصحيح والنهائي المعتمد لنموذج جيميناي فلاش
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

        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
            const aiText = data.candidates[0].content.parts[0].text;
            
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
                body: JSON.stringify({ error: data.error?.message || "فشل نموذج Gemini في معالجة النص." })
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
