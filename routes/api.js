'use strict';

const { getMultipleStockPrices } = require("../controllers/stockPrices");

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(function (req, res){
      
      const { stock } = req.query;

      if (!stock) {
        return res.status(400).json({ error: 'Missing stock query parameter' });
      }
    
      // Convertir el parámetro stock en un arreglo (puede ser un string o un arreglo)
      const symbols = Array.isArray(stock) ? stock : [stock];
    
      // Usar el controlador para obtener los datos
      getMultipleStockPrices(symbols, (error, data) => {
        if (error) {
          console.error('Error:', error.message);
          return res.status(500).json({ error: error.message });
        }
    
        // Devolver los datos en la respuesta
        res.json({ stockData: data });
      });

    });
    
};
