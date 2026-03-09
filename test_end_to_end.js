const getStripe = require('./lib/stripe'); // Adjust path if needed
// Actually, let's just make a fetch call locally since the server is running on 3000

async function testCheckoutAndWebhook() {
  console.log("1. Calling /api/stripe/checkout");
  const res = await fetch("http://localhost:3000/api/stripe/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: "j574hvgtfv34sd80jahzeqqtkx82e3kk", email: "noelpaingoaksoe@gmail.com" })
  });

  const data = await res.json();
  console.log("Checkout Response:", data);
}

testCheckoutAndWebhook();
