const Stripe = require('stripe');

const stripe = new Stripe('sk_test_51T8M0uPMyfVqrFan95rKtoyNItrvxCV0ulUpqUV1nA9xRh8pPSp46YhkZnek89KAxLF331scbZyMSv3JyskFN3Wh00Aojq6Q6v');

async function test() {
  try {
    const customers = await stripe.customers.list({ email: "noelpaingoaksoe@gmail.com", limit: 1 });
    let customerId = customers.data[0]?.id;

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        { price: 'price_1T8Mc4PMyfVqrFanODJNlYUM' },
      ],
      payment_behavior: "default_incomplete",
      payment_settings: { 
        save_default_payment_method: "on_subscription",
        payment_method_types: ["card"] 
      },
      expand: ["latest_invoice"],
    });

    const invoiceId = typeof subscription.latest_invoice === 'string' ? subscription.latest_invoice : subscription.latest_invoice.id;
    const invoice = await stripe.invoices.retrieve(invoiceId, { expand: ['payment_intent'] });

    console.log("CLIENT SECRET FROM INVOICE:", invoice.payment_intent?.client_secret);
    if (!invoice.payment_intent) {
       console.log("INVOICE JSON:", JSON.stringify(invoice, null, 2));
    }
  } catch (err) {
    console.error("ERROR", err);
  }
}

test();
