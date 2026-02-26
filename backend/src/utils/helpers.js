function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function formatTime(timeString) {
  if (!timeString) return '';
  return timeString.substring(0, 5);
}

function formatPrice(price) {
  if (typeof price === 'string') {
    price = parseFloat(price);
  }
  return price ? price.toLocaleString('ru-RU') + ' ₽' : '0 ₽';
}

function calculateAge(birthYear) {
  if (!birthYear) return null;
  const currentYear = new Date().getFullYear();
  return currentYear - birthYear;
}

function calculateTripPrice(pricePerPerson, passengers) {
  return (pricePerPerson || 0) * (passengers || 1);
}

function calculateParcelPrice(weight, pricePerKg, minPrice) {
  const calculated = (weight || 0) * (pricePerKg || 0);
  return Math.max(calculated, minPrice || 0);
}

module.exports = {
  formatDate,
  formatTime,
  formatPrice,
  calculateAge,
  calculateTripPrice,
  calculateParcelPrice
};
