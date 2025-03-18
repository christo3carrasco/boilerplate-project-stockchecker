'use strict';

const https = require('https');

// Base de datos en memoria para almacenar los "likes"
const likesDB = {};

// Función para obtener el precio de una acción
const getStockPrice = (symbol, callback) => {
  const options = {
    hostname: 'stock-price-checker-proxy.freecodecamp.rocks',
    path: `/v1/stock/${symbol}/quote`,
    method: 'GET',
  };

  const request = https.request(options, (response) => {
    let data = '';

    // Acumular los datos recibidos
    response.on('data', (chunk) => {
      data += chunk;
    });

    // Cuando se completa la respuesta
    response.on('end', () => {
      try {
        const stockData = JSON.parse(data);

        // Verificar si la respuesta contiene los datos esperados
        if (!stockData || !stockData.symbol || !stockData.latestPrice) {
          return callback(new Error(`Stock ${symbol} not found or invalid data`), null);
        }

        // Devolver los datos en el formato requerido
        callback(null, {
          stock: stockData.symbol,
          price: stockData.latestPrice,
        });
      } catch (error) {
        callback(new Error(`Failed to parse stock data for ${symbol}`), null);
      }
    });
  });

  // Manejar errores de la solicitud
  request.on('error', (error) => {
    callback(new Error(`Failed to fetch stock data for ${symbol}`), null);
  });

  // Finalizar la solicitud
  request.end();
};

// Función para obtener los precios de múltiples acciones y manejar los "likes"
const getStockData = (symbols, like, ip, callback) => {
  const results = [];
  let completedRequests = 0;

  symbols.forEach((symbol) => {
    getStockPrice(symbol, (error, data) => {
      if (error) {
        console.error(error.message);
        results.push({ stock: symbol, error: error.message });
      } else {
        // Inicializar el conteo de "likes" si no existe
        if (!likesDB[symbol]) {
          likesDB[symbol] = { likes: 0, users: new Set() };
        }

        // Si like=true y el usuario no ha dado like antes, incrementar el conteo
        if (like && !likesDB[symbol].users.has(ip)) {
          likesDB[symbol].likes++;
          likesDB[symbol].users.add(ip);
        }

        // Agregar el conteo de "likes" a los datos
        data.likes = likesDB[symbol].likes;
        results.push(data);
      }

      completedRequests++;

      // Cuando todas las solicitudes están completas
      if (completedRequests === symbols.length) {
        // Calcular la diferencia de "likes" si hay dos acciones
        if (results.length === 2) {
          const relLikes = results[0].likes - results[1].likes;
          results[0].rel_likes = relLikes;
          results[1].rel_likes = -relLikes;
          delete results[0].likes;
          delete results[1].likes;
        }

        callback(null, results);
      }
    });
  });
};

// Exportar las funciones del controlador
module.exports = { getStockData };