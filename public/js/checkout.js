const stripe = Stripe('pk_test_vH1bBTTcdLgZolLqgrpXS4eh00E6S89mas');

const redirect = async () => {
  const response = await fetch('/create-order', {
    method: 'POST'
  });
  console.log(response);
  const data = await response.json();
  console.log(data);
  const {error} = await stripe.redirectToCheckout({
  // Make the id field from the Checkout Session creation API response
  // available to this file, so you can provide it as parameter here
  // instead of the {{CHECKOUT_SESSION_ID}} placeholder.
  sessionId: data.session_id
  })
  console.log(error);
  // If `redirectToCheckout` fails due to a browser or network
  // error, display the localized error message to your customer
  // using `error.message`.
}