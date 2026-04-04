const SSLCommerzPayment = require('sslcommerz-lts');

const store_id = process.env.SSLCOMMERZ_STORE_ID;
const store_passwd = process.env.SSLCOMMERZ_STORE_PASSWORD;
const is_live = process.env.SSLCOMMERZ_IS_LIVE === 'true';

if (!store_id || !store_passwd) {
  throw new Error('SSLCommerz store_id or store_passwd not provided in environment variables');
}

export const sslcommerz = new SSLCommerzPayment(store_id, store_passwd, is_live);
