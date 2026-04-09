import Transaction from '../schemas/transactionSchema.js';

export const createTransaction = async (req, res) => {
    try {
        const {
            email,
            amount,
            currency,
            items,
            reference,
            paymentType,
            status,
            stripePaymentIntent,
            state,
            lga,
            deliveryFee
        } = req.body;

        const exists = await Transaction.findOne({ reference });
        if (exists) {
            return res.status(409).json({ status: 'fail', message: 'transaction already recorded' });
        }

        const transaction = new Transaction({
            email,
            amount,
            currency,
            items,
            reference,
            paymentType,
            status,
            stripePaymentIntent,
            state,
            lga,
            deliveryFee
        });

        await transaction.save();
        res.status(201).json({ status: 'success', transaction });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: 'could not create transaction' });
    }
};

export const getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ createdAt: -1 });
        res.json(transactions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: 'could not fetch transactions' });
    }
};

// generic webhook handler for payment providers (Paystack, Stripe, etc.)
export const handleWebhook = async (req, res) => {
    /*
      This endpoint can be configured in your payment provider dashboard to
      call when a transaction succeeds. The request body typically contains
      details such as amount, reference, status, and optionally provider-specific
      data (e.g. stripePaymentIntent).

      For a real integration you should
      1. verify the request signature/header for authenticity
      2. parse the payload according to provider docs
      3. look up existing transaction by reference to avoid duplicates
      4. update/create record accordingly
    */
    try {
        const payload = req.body;
        const reference = payload.reference || payload.data?.reference || payload.data?.id;
        if (!reference) {
            return res.status(400).send('missing reference');
        }
        // avoid duplicate
        let tx = await Transaction.findOne({ reference });
        if (!tx) {
            tx = new Transaction({
                email: payload.email || payload.data?.customer?.email || '',
                amount: payload.amount || payload.data?.amount || 0,
                currency: payload.currency || payload.data?.currency || 'NGN',
                items: payload.items || [],
                reference,
                paymentType: payload.paymentType || 'webhook',
                status: payload.status || payload.data?.status || 'success',
                stripePaymentIntent: payload.data?.payment_intent || ''
            });
            await tx.save();
        } else {
            // update status if changed
            tx.status = payload.status || payload.data?.status || tx.status;
            await tx.save();
        }
        res.status(200).send('ok');
    } catch (err) {
        console.error('webhook error', err);
        res.status(500).send('error');
    }
};