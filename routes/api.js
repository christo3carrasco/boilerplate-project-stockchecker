'use strict';

const { getStockData } = require("../controllers/stockPrices");

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(function (req, res){
      
      const { stock, like } = req.query;
      const ip = req.ip; // Obtener la dirección IP del usuario
    
      if (!stock) {
        return res.status(400).json({ error: 'Missing stock query parameter' });
      }
    
      // Convertir el parámetro stock en un arreglo (puede ser un string o un arreglo)
      const symbols = Array.isArray(stock) ? stock : [stock];
    
      // Usar el controlador para obtener los datos
      getStockData(symbols, like === 'true', ip, (error, data) => {
        if (error) {
          console.error('Error:', error.message);
          return res.status(500).json({ error: error.message });
        }
    
        // Devolver los datos en la respuesta
        if (data.length === 1) {
          res.json({ stockData: data[0] });
        } else {
          res.json({ stockData: data });
        }
      });

    });
    
};
