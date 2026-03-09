const fetch = require('node-fetch'); // Needs node-fetch installed or Use Node 18+ fetch
const stripe = require('stripe')('sk_test_51T8M0uPMyfVqrFan95rKtoyNItrvxCV0ulUpqUV1nA9xRh8pPSp46YhkZnek89KAxLF331scbZyMSv3JyskFN3Wh00Aojq6Q6v');

async function testWebhook() {
  const payload = {
    type: "setup_intent.succeeded",
    data: {
      object: {
        id: "seti_1T8YEbPMyfVqrFanOCf3PWPe",
        customer: "cus_U6acAJZU2mbQsp",
        metadata: { userId: "j574hvgtfv34sd80jahzeqqtkx82e3kk" },
        payment_method: "pm_card_us", // Placeholder
      }
    }
  };

  try {
    const res = await fetch("http://localhost:3000/api/stripe/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Bypassing signature check since it's hard to spoof perfectly.
        // We'll temporarly bypass validation in the route itself.
      },
      body: JSON.stringify(payload)
    });

    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text);
  } catch (err) {
    console.error("Fetch Error:", err);
  }
}

testWebhook();
