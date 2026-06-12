exports.handler = async (event, context) => {
    // السماح فقط بطلبات POST لزيادة الأمان
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const { promptMessage } = JSON.parse(event.body);
        const API_KEY = "AQ.Ab8RN6KheAp9j_ESVIZg4F96dHcz1cCd3fYBq1UDw9hdA_SJyA";

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "llama3-8b-8192",
                messages: [{ role: "user", content: promptMessage }]
            })
        });

        const data = await response.json();
        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };
    } catch (error) {
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: "حدث خطأ في الاتصال بالسيرفر الداخلي" }) 
        };
    }
};
