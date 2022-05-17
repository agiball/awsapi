const paypal = require("paypal-rest-sdk");
var router = require("express").Router();

paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id: process.env.PP_CLIENT_ID,
  client_secret: process.env.PP_CLIENT_SECRET,
});

router.get("/pay", (req, res) => {
  const create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: `http://localhost:${process.env.API_PORT}/paypal/success`,
      cancel_url: `http://localhost:${process.env.API_PORT}/paypal/cancel`,
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: "Redhock Bar Soap",
              sku: "001",
              price: "25.00",
              currency: "EUR",
              quantity: 1,
            },
          ],
        },
        amount: {
          currency: "EUR",
          total: "25.00",
        },
        description: "Washing Bar soap",
      },
    ],
  };

  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      throw error;
    } else {
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === "approval_url") {
          res.redirect(payment.links[i].href);
        }
      }
    }
  });
});

router.get("/success", (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: "EUR",
          total: "25.00",
        },
      },
    ],
  };

  // Obtains the transaction details from paypal
  paypal.payment.execute(
    paymentId,
    execute_payment_json,
    function (error, payment) {
      //When error occurs when due to non-existent transaction, throw an error else log the transaction details in the console then send a Success string reposponse to the user.
      if (error) {
        console.log(error.response);
        throw error;
      } else {
        console.log(JSON.stringify(payment));
        res.send("Success");
      }
    }
  );
});
router.get("/cancel", (req, res) => res.send("Cancelled"));

module.exports = router;
