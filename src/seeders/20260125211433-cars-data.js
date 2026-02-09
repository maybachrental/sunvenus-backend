"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("cars", [
      // Luxury Sedans
      { id: 1, name: "NEW SHAPE BMW M5", brand_id: 1, model: "M5", color: "RED", seating_capacity: 5, category_id: 2, fuel_type_id: 1 },
      { id: 2, name: "NEW SHAPE BMW M5", brand_id: 1, model: "M5", color: "WHITE", seating_capacity: 5, category_id: 2, fuel_type_id: 1 },

      {
        id: 3,
        name: "NEW SHAPE MERC E CLASS",
        brand_id: 4,
        model: "E CLASS",
        color: "BLACK",
        seating_capacity: 5,
        category_id: 2,
        fuel_type_id: 1,
      },
      {
        id: 4,
        name: "NEW SHAPE MERC E CLASS",
        brand_id: 4,
        model: "E CLASS",
        color: "WHITE",
        seating_capacity: 5,
        category_id: 2,
        fuel_type_id: 1,
      },

      { id: 5, name: "AUDI A8L", brand_id: 3, model: "A8L", color: "BLACK", seating_capacity: 4, category_id: 2, fuel_type_id: 1 },

      // Luxury SUVs
      { id: 6, name: "AUDI Q7 SUV VIP", brand_id: 3, model: "Q7", color: "RED", seating_capacity: 7, category_id: 3, fuel_type_id: 1 },

      {
        id: 7,
        name: "MERCEDES MAYBACH S500 KIT",
        brand_id: 4,
        model: "S500",
        color: "WHITE",
        seating_capacity: 5,
        category_id: 2,
        fuel_type_id: 1,
      },
      { id: 8, name: "BMW 7 SERIES 740D KIT", brand_id: 1, model: "740D", color: "WHITE", seating_capacity: 5, category_id: 2, fuel_type_id: 2 },

      { id: 9, name: "AUDI A8L", brand_id: 3, model: "A8L", color: "WHITE", seating_capacity: 5, category_id: 2, fuel_type_id: 1 },

      { id: 10, name: "AUDI Q7 SUV VIP", brand_id: 3, model: "Q7", color: "WHITE", seating_capacity: 6, category_id: 3, fuel_type_id: 1 },

      {
        id: 11,
        name: "RANGE ROVER VOGUE",
        brand_id: 4,
        model: "VOGUE",
        color: "BLACK",
        seating_capacity: 5,
        category_id: 3,
        fuel_type_id: 1,
      },

      // Convertible
      {
        id: 12,
        name: "MERCEDES AMG E63 CONVERTIBLE",
        brand_id: 4,
        model: "E63",
        color: "WHITE",
        seating_capacity: 4,
        category_id: 5,
        fuel_type_id: 1,
      },

      // Luxury SUVs
      {
        id: 13,
        name: "MERCEDES MAYBACH GLS600 KIT",
        brand_id: 4,
        model: "GLS600",
        color: "WHITE",
        seating_capacity: 7,
        category_id: 3,
        fuel_type_id: 1,
      },

      // Luxury Sedan
      {
        id: 14,
        name: "MAYBACH ORIGINAL S500",
        brand_id: 4,
        model: "S500",
        color: "WHITE",
        seating_capacity: 5,
        category_id: 2,
        fuel_type_id: 1,
      },

      // Luxury SUV
      {
        id: 15,
        name: "RANGE ROVER VOGUE",
        brand_id: 4,
        model: "VOGUE",
        color: "WHITE",
        seating_capacity: 5,
        category_id: 3,
        fuel_type_id: 1,
      },

      // Ultra Luxury
      {
        id: 16,
        name: "BENTLEY FLYING SPUR W12",
        brand_id: 2,
        model: "W12",
        color: "WHITE",
        seating_capacity: 5,
        category_id: 2,
        fuel_type_id: 1,
      },

      // Limousine
      {
        id: 17,
        name: "MAYBACH V600 LIMOUSINE",
        brand_id: 4,
        model: "V600",
        color: "BLACK",
        seating_capacity: 6,
        category_id: 6,
        fuel_type_id: 1,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("cars", null, {});
  },
};
