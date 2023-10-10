const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({
  origin: 'http://localhost:8080', // ou a origem do seu cliente (frontend)
  methods: 'GET,PUT,,POST,DELETE',
  credentials: true,
}));

app.read('/api/publishers', (req, res) => {
  // Sua lógica para manipular a solicitação
  res.json({ data: 'dados da API' });
});

app.listen(7052, () => {
  console.log('Servidor iniciado na porta 7052');
});