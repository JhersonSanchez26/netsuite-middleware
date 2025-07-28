const express = require('express');
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

// Ruta raíz para saber que el middleware está activo
app.get('/', (req, res) => {
  res.type('text/plain');
  res.send('Middleware de NetSuite activo ✅');
});

// Configura tus credenciales de NetSuite aquí
const consumerKey = 'cd00529c7c5337fd9f4b832e59481f38cc58470d84923739fb5a0c5bc59f388a';
const consumerSecret = 'a2ee737e5ce09b92343b211d1454d124224f7c532d7c0de8be219f3d904783bf';
const token = '7568886dde99af968ca5bf87fc24a7aa620f319ee6ef2a7b301e135b6ffcfd27';
const tokenSecret = '4efaa0435970ab5e51f27b1f172bf921dd4ab0d30d96e0bd6a6e923ace3078eb';
const realm = '6367566';

// URL de tu Suitelet o RESTlet en NetSuite
const netsuiteUrl = 'https://6367566.app.netsuite.com/app/site/hosting/scriptlet.nl?script=1454&deploy=2';

const oauth = OAuth({
  consumer: { key: consumerKey, secret: consumerSecret },
  signature_method: 'HMAC-SHA256',
  hash_function(base_string, key) {
    return crypto.createHmac('sha256', key).update(base_string).digest('base64');
  }
});

// Ruta para consultar datos de NetSuite
app.get('/netsuite-data', async (req, res) => {
  try {
    const request_data = {
      url: netsuiteUrl,
      method: 'GET'
    };

    const headers = oauth.toHeader(oauth.authorize(request_data, {
      key: token,
      secret: tokenSecret
    }));

    headers.Authorization += `, realm="${realm}"`;

    const response = await axios.get(netsuiteUrl, { headers });

    res.type('application/json'); // asegúrate de que la respuesta sea JSON
    res.json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error('Error al consultar NetSuite:', error.message);
    res.status(500).json({
      success: false,
      message: error.message,
      detail: error.response ? error.response.data : null
    });
  }
});

app.listen(port, () => {
  console.log(`Middleware escuchando en http://localhost:${port}`);
});
