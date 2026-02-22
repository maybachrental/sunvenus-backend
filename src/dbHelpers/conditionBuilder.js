const { Op, literal } = require("sequelize");

const buildCarWhere = ({ category_id, fuel_type_id, car_name, brand, model, color }) => {
  const where = {
    is_active: true,
  };

  // / Convert comma-separated string to array
  if (category_id) {
    const categoryArray = category_id.split(",").map(id => id.trim());
    where.category_id = {
      [Op.in]: categoryArray,
    };
  }

  if (fuel_type_id) {
    const fuelTypeArray = fuel_type_id.split(",").map(id => id.trim());
    where.fuel_type_id = {
      [Op.in]: fuelTypeArray,
    };
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
};;

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
