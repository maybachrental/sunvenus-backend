const { Op, literal } = require("sequelize");

const buildCarWhere = ({ category_id, fuel_type_id, car_name, brand, model, color }) => {
  const where = {
    is_active: true,
  };

  if (category_id) {
    where.category_id = category_id;
  }

  if (fuel_type_id) {
    where.fuel_type_id = fuel_type_id;
  }

  if (car_name) {
    where.name = {
      [Op.like]: `%${car_name}%`, // use Op.like for MySQL
    };
  }

  if (brand) {
    where.brand = {
      [Op.like]: `%${brand}%`,
    };
  }

  return where;
};

const buildCarSort = (sort_by) => {
  switch (sort_by) {
    case "price_low":
      return [[literal("CarsPricings.base_price"), "ASC"]];

    case "price_high":
      return [[literal("CarsPricings.base_price"), "DESC"]];

    case "newest":
    default:
      return [["created_at", "DESC"]];
  }
};

module.exports = { buildCarWhere, buildCarSort };
