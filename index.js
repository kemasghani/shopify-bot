require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

app.get('/webhook', async (req, res) => {
    try {
        const shopifyUrl = `https://${process.env.SHOPIFY_SHOP_NAME}/admin/api/2024-01/orders.json?status=any&limit=5`;

        const response = await axios.get(shopifyUrl, {
            headers: {
                'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN,
                'Content-Type': 'application/json'
            }
        });

        const orders = response.data.orders;

        if (!orders || orders.length === 0) {
            return res.json({ reply: "Saat ini belum ada orderan di Shopify kamu." });
        }

        let replyText = "Daftar 5 Orderan Terakhir:\n\n";

        orders.forEach((order, index) => {
            const customerName = order.customer ? order.customer.first_name : 'Guest';
            replyText += `${index + 1}. Order: ${order.name}\n`;
            replyText += `   Pelanggan: ${customerName}\n`;
            replyText += `   Total: ${order.current_total_price} ${order.currency}\n`;
            replyText += `   Status Bayar: ${order.financial_status}\n\n`;
        });

        return res.json({ reply: replyText.trim() });

    } catch (error) {
        console.error("Error mengambil data Shopify:", error.response ? error.response.data : error.message);
        return res.status(500).json({ reply: "Maaf, terjadi kesalahan pada server saat menghubungi Shopify." });
    }
});

module.exports = app;