const { bot } = require('../bot');
const { pool } = require('../database/connection');

async function notifyClientOrderCreated(orderId) {
  try {
    const orderQuery = await pool.query(
      `SELECT o.*, u.telegram_id 
       FROM orders o 
       JOIN users u ON o.client_id = u.id 
       WHERE o.id = $1`,
      [orderId]
    );
    
    if (orderQuery.rows.length === 0) return;
    
    const order = orderQuery.rows[0];
    const message = `✅ Ваш заказ №${order.id} принят. Ищем водителя...`;
    
    await bot.telegram.sendMessage(order.telegram_id, message);
  } catch (error) {
    console.error('Notify client order created error:', error);
  }
}

async function notifyClientDriverAccepted(orderId) {
  try {
    const orderQuery = await pool.query(
      `SELECT o.*, d.full_name, d.car_brand, d.car_model, d.car_number, d.phone, u.telegram_id
       FROM orders o 
       JOIN users u ON o.client_id = u.id
       JOIN drivers d ON o.driver_id = d.id
       WHERE o.id = $1`,
      [orderId]
    );
    
    if (orderQuery.rows.length === 0) return;
    
    const order = orderQuery.rows[0];
    const message = `🚗 Водитель ${order.full_name} принял ваш заказ №${order.id}\n\n` +
      `Авто: ${order.car_brand} ${order.car_model}, ${order.car_number}\n` +
      `Телефон: ${order.phone}`;
    
    await bot.telegram.sendMessage(order.telegram_id, message);
  } catch (error) {
    console.error('Notify client driver accepted error:', error);
  }
}

async function notifyClientDriverOnWay(orderId) {
  try {
    const orderQuery = await pool.query(
      `SELECT o.*, u.telegram_id FROM orders o JOIN users u ON o.client_id = u.id WHERE o.id = $1`,
      [orderId]
    );
    
    if (orderQuery.rows.length === 0) return;
    
    const order = orderQuery.rows[0];
    await bot.telegram.sendMessage(order.telegram_id, '🚗 Водитель выехал к вам');
  } catch (error) {
    console.error('Notify client driver on way error:', error);
  }
}

async function notifyClientTripStarted(orderId) {
  try {
    const orderQuery = await pool.query(
      `SELECT o.*, u.telegram_id FROM orders o JOIN users u ON o.client_id = u.id WHERE o.id = $1`,
      [orderId]
    );
    
    if (orderQuery.rows.length === 0) return;
    
    const order = orderQuery.rows[0];
    await bot.telegram.sendMessage(order.telegram_id, '🎉 Ваша поездка началась. Хорошего пути!');
  } catch (error) {
    console.error('Notify client trip started error:', error);
  }
}

async function notifyClientOrderCompleted(orderId) {
  try {
    const orderQuery = await pool.query(
      `SELECT o.*, u.telegram_id FROM orders o JOIN users u ON o.client_id = u.id WHERE o.id = $1`,
      [orderId]
    );
    
    if (orderQuery.rows.length === 0) return;
    
    const order = orderQuery.rows[0];
    const webAppUrl = `${process.env.WEB_APP_URL}/review/${orderId}`;
    
    await bot.telegram.sendMessage(
      order.telegram_id,
      '✨ Заказ завершён. Оцените поездку!',
      {
        reply_markup: {
          inline_keyboard: [[
            { text: '⭐ Оценить', web_app: { url: webAppUrl } }
          ]]
        }
      }
    );
  } catch (error) {
    console.error('Notify client order completed error:', error);
  }
}

async function notifyClientOrderCancelled(orderId, reason) {
  try {
    const orderQuery = await pool.query(
      `SELECT o.*, u.telegram_id FROM orders o JOIN users u ON o.client_id = u.id WHERE o.id = $1`,
      [orderId]
    );
    
    if (orderQuery.rows.length === 0) return;
    
    const order = orderQuery.rows[0];
    const message = `❌ К сожалению, водитель отменил заказ №${order.id}.\n` +
      `Причина: ${reason || 'Не указана'}. Ищем другого...`;
    
    await bot.telegram.sendMessage(order.telegram_id, message);
  } catch (error) {
    console.error('Notify client order cancelled error:', error);
  }
}

async function notifyDriversNewOrder(orderId) {
  try {
    const orderQuery = await pool.query(
      `SELECT o.*, p.trip_price_per_person, p.parcel_price_per_kg, p.parcel_min_price
       FROM orders o
       LEFT JOIN prices p ON o.city_from = p.city_from AND o.city_to = p.city_to
       WHERE o.id = $1`,
      [orderId]
    );
    
    if (orderQuery.rows.length === 0) return;
    
    const order = orderQuery.rows[0];
    
    let typeText;
    switch (order.order_type) {
      case 'trip':
        typeText = '🚗 Поездка';
        break;
      case 'parcel':
        typeText = '📦 Посылка';
        break;
      case 'car_transport':
        typeText = '🚙 Перегон авто';
        break;
    }
    
    const message = `🆕 Новая заявка!\n\n` +
      `${typeText}: ${order.city_from} → ${order.city_to}\n` +
      `Дата: ${order.departure_date}\n` +
      `Сумма: ${order.calculated_price} руб.`;
    
    // Find drivers for this route
    const driverQuery = await pool.query(
      `SELECT u.telegram_id 
       FROM drivers d
       JOIN users u ON d.user_id = u.id
       WHERE d.is_online = TRUE 
       AND d.is_approved = TRUE 
       AND d.is_blocked = FALSE
       AND (d.can_transport_car = TRUE OR $1 != 'car_transport')
       AND EXISTS (
         SELECT 1 FROM jsonb_array_elements(d.working_routes) as route
         WHERE route->>'from' = $2 AND route->>'to' = $3
       )`,
      [order.order_type, order.city_from, order.city_to]
    );
    
    const webAppUrl = `${process.env.WEB_APP_URL}/driver/orders`;
    
    for (const driver of driverQuery.rows) {
      try {
        await bot.telegram.sendMessage(driver.telegram_id, message, {
          reply_markup: {
            inline_keyboard: [[
              { text: 'Открыть заявки', web_app: { url: webAppUrl } }
            ]]
          }
        });
      } catch (error) {
        console.error(`Failed to notify driver ${driver.telegram_id}:`, error.message);
      }
    }
  } catch (error) {
    console.error('Notify drivers new order error:', error);
  }
}

async function notifyDriverOrderCancelled(orderId) {
  try {
    const orderQuery = await pool.query(
      `SELECT o.*, u.telegram_id 
       FROM orders o 
       JOIN users u ON o.driver_id = d.id
       JOIN drivers d ON o.driver_id = d.id
       WHERE o.id = $1`,
      [orderId]
    );
    
    if (orderQuery.rows.length === 0) return;
    
    const order = orderQuery.rows[0];
    await bot.telegram.sendMessage(order.telegram_id, `❌ Заявка №${order.id} отменена клиентом`);
  } catch (error) {
    console.error('Notify driver order cancelled error:', error);
  }
}

async function notifyAdminNewOrder(orderId) {
  try {
    const adminIds = process.env.ADMIN_TELEGRAM_ID ? process.env.ADMIN_TELEGRAM_ID.split(',') : [];
    if (adminIds.length === 0) return;
    
    const orderQuery = await pool.query(
      `SELECT o.*, u.first_name, u.last_name
       FROM orders o
       JOIN users u ON o.client_id = u.id
       WHERE o.id = $1`,
      [orderId]
    );
    
    if (orderQuery.rows.length === 0) return;
    
    const order = orderQuery.rows[0];
    let typeText;
    switch (order.order_type) {
      case 'trip':
        typeText = '🚗 Поездка';
        break;
      case 'parcel':
        typeText = '📦 Посылка';
        break;
      case 'car_transport':
        typeText = '🚙 Перегон авто';
        break;
    }
    
    const message = `📋 Новый заказ №${order.id}:\n` +
      `${typeText} ${order.city_from} → ${order.city_to}, ${order.departure_date}`;
    
    for (const adminId of adminIds) {
      try {
        await bot.telegram.sendMessage(adminId, message);
      } catch (error) {
        console.error(`Failed to notify admin ${adminId}:`, error.message);
      }
    }
  } catch (error) {
    console.error('Notify admin new order error:', error);
  }
}

module.exports = {
  notifyClientOrderCreated,
  notifyClientDriverAccepted,
  notifyClientDriverOnWay,
  notifyClientTripStarted,
  notifyClientOrderCompleted,
  notifyClientOrderCancelled,
  notifyDriversNewOrder,
  notifyDriverOrderCancelled,
  notifyAdminNewOrder
};
