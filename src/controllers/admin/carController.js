const { Op } = require("sequelize");
const { Cars, Brands, FuelTypes, CarCategories, CarsPricings, CarImages, sequelize, CarContents } = require("../../models");
const CloudinaryService = require("../../services/external/cloudinary.service");
const { publicIdCreation } = require("../../utils/slugify");

const showAllCars = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const { search = "", fuel_type = "", is_active = "", transmission = "" } = req.query;

    const carWhere = {};

    // Search by name or brand
    if (search) {
      carWhere[Op.or] = [{ name: { [Op.like]: `%${search}%` } }, { model: { [Op.like]: `%${search}%` } }];
    }

    // Filter by fuel type
    if (fuel_type) {
      carWhere.fuel_type = fuel_type;
    }

    // Filter by availability
    if (is_active !== "") {
      carWhere.is_active = is_active === "true";
    }

    // Filter by transmission
    if (transmission) {
      carWhere.transmission = transmission;
    }

    const { rows: cars, count } = await Cars.findAndCountAll({
      where: carWhere,
      include: [
        {
          model: Brands,
          attributes: ["brand_name"],
        },
        {
          model: FuelTypes,
          attributes: ["fuel"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    res.render("admin/car/showCars", {
      cars,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      query: req.query,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
};

const createCarPage = async (req, res, next) => {
  try {
    const brands = await Brands.findAll({ attributes: ["id", "brand_name"] });
    const categories = await CarCategories.findAll({ attributes: ["id", "category"] });
    const fuelTypes = await FuelTypes.findAll({ attributes: ["id", "fuel"] });
    res.render("admin/car/createCars", {
      brands,
      categories,
      fuelTypes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
};

const createCar = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      name,
      model,
      color,
      brand_id,
      category_id,
      fuel_type_id,
      transmission,
      seating_capacity,
      is_active = true,
      is_premium = false,
      order_by = 0,
      pricings = [],
    } = req.body;

    // ── Validate required basic fields ──
    if (!name || !model || !color || !brand_id || !category_id || !fuel_type_id || !transmission || !seating_capacity) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, model, color, brand_id, category_id, fuel_type_id, transmission, seating_capacity.",
      });
    }

    // ── Validate pricing array ──
    if (!Array.isArray(pricings) || pricings.length === 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "At least one pricing tier is required.",
      });
    }

    for (let i = 0; i < pricings.length; i++) {
      const p = pricings[i];
      if (!p.base_price || !p.duration_hours || !p.included_km || !p.extra_hour_charge || !p.extra_km_charge) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: `Pricing tier #${i + 1} is missing required fields: base_price, duration_hours, included_km, extra_hour_charge, extra_km_charge.`,
        });
      }
    }

    // ── Create the car ──
    const car = await Cars.create(
      {
        name,
        model,
        color,
        brand_id,
        category_id,
        fuel_type_id,
        transmission,
        seating_capacity,
        is_active,
        is_premium,
        order_by,
      },
      { transaction: t },
    );

    // ── Create pricing tiers ──
    const pricingRecords = pricings.map((p) => ({
      car_id: car.id,
      base_price: p.base_price,
      duration_hours: p.duration_hours,
      included_km: p.included_km,
      extra_hour_charge: p.extra_hour_charge,
      extra_km_charge: p.extra_km_charge,
      is_outstation: p.is_outstation || false,
    }));

    await CarsPricings.bulkCreate(pricingRecords, { transaction: t });

    await t.commit();

    return res.status(201).json({
      success: true,
      message: "Car created successfully.",
      data: { id: car.id, ...car.toJSON() },
    });
  } catch (error) {
    await t.rollback();
    console.error("createCar error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

const uploadCarImages = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const carId = parseInt(req.params.id);

    // ── Check car exists ──
    const car = await Cars.findByPk(carId);
    if (!car) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: `Car with ID ${carId} not found.`,
      });
    }

    const files = req.files;
    if (!files || files.length === 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "No files uploaded.",
      });
    }

    // ── If any new file is primary, clear existing primary flag ──
    const hasPrimary = files.some((_, i) => req.body[`is_primary_${i}`] === "true");
    if (hasPrimary) {
      await CarImages.update({ is_primary: false }, { where: { car_id: carId }, transaction: t });
    }

    // ── Upload each file to Cloudinary and build DB records ──
    const imageRecords = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isPrimary = req.body[`is_primary_${i}`] === "true";
      const withBg = req.body[`with_bg_${i}`] !== "false"; // default true
      const isVideo = file.mimetype.startsWith("video/");

      // Derive extension from mimetype: "image/jpeg" → "jpeg"
      const ext = file.mimetype.split("/")[1];

      // image_name stored in DB — used by the VIRTUAL getter to build image_url
      const imageName = `car_${carId}_${Date.now()}_${i}.${ext}`;

      // public_id for Cloudinary (no extension — Cloudinary stores it separately)

      const publicId = publicIdCreation(file, carId);

      const cloudinaryOptions = {
        resource_type: isVideo ? "video" : "image",
        public_id: publicId,
        overwrite: false,
      };

      const result = await CloudinaryService.uploadFile(file, `sunvenus_backend/cars/${carId}`, cloudinaryOptions);

      imageRecords.push({
        car_id: carId,
        image_name: imageName, // e.g. "car_5_1710000000000_0.jpeg"
        image_path: result.secure_url, // full Cloudinary HTTPS URL (stored as backup)
        public_id: result.public_id, // e.g. "cars/5/car_5_1710000000000_0"
        file_type: isVideo ? "VIDEO" : "IMAGE",
        is_primary: isPrimary,
        with_bg: withBg,
      });
    }

    await CarImages.bulkCreate(imageRecords, { transaction: t });

    await t.commit();

    return res.status(201).json({
      success: true,
      message: `${imageRecords.length} file(s) uploaded successfully.`,
      data: imageRecords,
    });
  } catch (error) {
    await t.rollback();
    console.error("uploadCarImages error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

const deleteCar = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const carId = parseInt(req.params.id);

    if (!carId || isNaN(carId)) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Invalid car ID.",
      });
    }

    // ── Check car exists ──
    const car = await Cars.findByPk(carId);
    if (!car) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: `Car with ID ${carId} not found.`,
      });
    }
    // ── Delete from Cloudinary (outside transaction — external service) ──
    // for (const image of images) {
    // if (image.public_id) {
    try {
      await CloudinaryService.delete(`sunvenus_backend/cars/${carId}`);
    } catch (cloudErr) {
      // Log but don't abort — DB cleanup should still proceed
      console.warn(`Cloudinary delete failed for public_id `, cloudErr.message);
    }
    // }
    // }

    // ── Delete DB records in order ──
    await CarsPricings.destroy({ where: { car_id: carId }, transaction: t });
    await CarImages.destroy({ where: { car_id: carId }, transaction: t });
    await CarContents.destroy({ where: { car_id: carId }, transaction: t });
    await car.destroy({ transaction: t });

    await t.commit();

    return res.status(200).json({
      success: true,
      message: `Car "${car.name}" deleted successfully.`,
    });
  } catch (error) {
    await t.rollback();
    console.error("deleteCar error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

const getEditCarPage = async (req, res) => {
  try {
    const carId = parseInt(req.params.id);

    const car = await Cars.findByPk(carId, {
      include: [
        {
          model: CarsPricings,
        },
        {
          model: CarCategories,
        },
        {
          model: CarImages,
        },
        {
          model: Brands,
        },
        {
          model: FuelTypes,
        },
      ],
    });

    if (!car) return res.status(404).send("Car not found.");

    const [brandsData, categoriesData, fuelTypesData] = await Promise.all([
      Brands.findAll({ order: [["brand_name", "ASC"]] }),
      CarCategories.findAll({ order: [["category", "ASC"]] }),
      FuelTypes.findAll(),
    ]);
    const carData = car.toJSON();
    const pricings = carData.CarsPricings || carData.Pricings || carData.cars_pricings || carData.pricings || [];
    console.log(pricings);

    return res.render("admin/car/editCars", {
      car: { ...carData, CarsPricings: pricings }, // guarantee the key
      brands: brandsData,
      categories: categoriesData,
      fuelTypes: fuelTypesData,
    });
  } catch (error) {
    console.error("getEditCarPage error:", error);
    return res.status(500).send("Internal server error.");
  }
};

const updateCar = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const carId = parseInt(req.params.id);

    const car = await Cars.findByPk(carId);
    if (!car) {
      await t.rollback();
      return res.status(404).json({ success: false, message: "Car not found." });
    }

    const {
      name,
      model,
      color,
      brand_id,
      category_id,
      fuel_type_id,
      transmission,
      seating_capacity,
      is_active,
      is_premium,
      order_by = 0,
      pricings = [],
    } = req.body;

    // ── Validate required basic fields ──
    if (!name || !model || !color || !brand_id || !category_id || !fuel_type_id || !transmission || !seating_capacity) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, model, color, brand_id, category_id, fuel_type_id, transmission, seating_capacity.",
      });
    }

    // ── Validate pricings ──
    if (!Array.isArray(pricings) || pricings.length === 0) {
      await t.rollback();
      return res.status(400).json({ success: false, message: "At least one pricing tier is required." });
    }

    for (let i = 0; i < pricings.length; i++) {
      const p = pricings[i];
      if (!p.base_price || !p.duration_hours || !p.included_km || !p.extra_hour_charge || !p.extra_km_charge) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: `Pricing tier #${i + 1} is missing required fields.`,
        });
      }
    }

    // ── Update car basic fields ──
    await car.update(
      { name, model, color, brand_id, category_id, fuel_type_id, transmission, seating_capacity, is_active, is_premium, order_by },
      { transaction: t },
    );

    // ── Sync pricing tiers ──
    const incomingIds = pricings.filter((p) => p.id).map((p) => p.id);

    // Delete tiers removed in the UI
    await CarsPricings.destroy({
      where: {
        car_id: carId,
        id: { [require("sequelize").Op.notIn]: incomingIds.length ? incomingIds : [0] },
      },
      transaction: t,
    });

    for (const p of pricings) {
      if (p.id) {
        // Update existing tier
        await CarsPricings.update(
          {
            base_price: p.base_price,
            duration_hours: p.duration_hours,
            included_km: p.included_km,
            extra_hour_charge: p.extra_hour_charge,
            extra_km_charge: p.extra_km_charge,
            is_outstation: p.is_outstation || false,
          },
          { where: { id: p.id, car_id: carId }, transaction: t },
        );
      } else {
        // Create new tier
        await CarsPricings.create(
          {
            car_id: carId,
            base_price: p.base_price,
            duration_hours: p.duration_hours,
            included_km: p.included_km,
            extra_hour_charge: p.extra_hour_charge,
            extra_km_charge: p.extra_km_charge,
            is_outstation: p.is_outstation || false,
          },
          { transaction: t },
        );
      }
    }

    await t.commit();

    // Re-fetch with associations for response
    const updatedCar = await Cars.findByPk(carId, {
      include: [{ model: CarsPricings }],
    });

    return res.status(200).json({
      success: true,
      message: "Car updated successfully.",
      data: updatedCar,
    });
  } catch (error) {
    await t.rollback();
    console.error("updateCar error:", error);
    return res.status(500).json({ success: false, message: "Internal server error.", error: error.message });
  }
};

const deleteCarImage = async (req, res) => {
  try {
    const carId = parseInt(req.params.id);
    const imageId = parseInt(req.params.imageId);

    // Fixed: was using wrong model name `CarImage`
    const image = await CarImages.findOne({ where: { id: imageId, car_id: carId } });
    if (!image) {
      return res.status(404).json({ success: false, message: "Image not found." });
    }

    // Delete from Cloudinary
    if (image.public_id) {
      try {
        const resourceType = image.file_type === "VIDEO" ? "video" : "image";
        await CloudinaryService.delete(image.public_id, resourceType);
      } catch (cloudErr) {
        console.warn(`Cloudinary delete failed for "${image.public_id}":`, cloudErr.message);
      }
    }

    await image.destroy();

    return res.status(200).json({ success: true, message: "Image deleted successfully." });
  } catch (error) {
    console.error("deleteCarImage error:", error);
    return res.status(500).json({ success: false, message: "Internal server error.", error: error.message });
  }
};

const setCarImagePrimary = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const carId = parseInt(req.params.id);
    const imageId = parseInt(req.params.imageId);

    const image = await CarImages.findOne({ where: { id: imageId, car_id: carId } });
    if (!image) {
      await t.rollback();
      return res.status(404).json({ success: false, message: "Image not found." });
    }

    // Unset all primary for this car
    await CarImages.update({ is_primary: false }, { where: { car_id: carId }, transaction: t });

    // Set the target as primary
    await image.update({ is_primary: true }, { transaction: t });

    await t.commit();

    return res.status(200).json({ success: true, message: "Primary image updated." });
  } catch (error) {
    await t.rollback();
    console.error("setCarImagePrimary error:", error);
    return res.status(500).json({ success: false, message: "Internal server error.", error: error.message });
  }
};

const viewCarDetails = async (req, res) => {
  const car = await Cars.findByPk(req.params.id, {
    include: [{ model: CarsPricings }, { model: CarImages }, { model: Brands }, { model: CarCategories }, { model: FuelTypes }],
  });
  if (!car) return res.redirect("/admin/cars");
  res.render("admin/car/viewCarDetails", { car });
};

const getContentPage = async (req, res) => {
  try {
    const carId = parseInt(req.params.id);

    // Fetch the car row so we can show its name/model/color in the topbar
    const carResult = await Cars.findOne({
      where: { id: carId },
      include: [
        {
          model: Brands,
        },
      ],
    });

    if (!carResult) {
      return res.status(404).send("Car not found");
    }

    const car = carResult;

    // Also fetch existing content (if any) so the form can be pre-filled on page load
    const contentResult = await CarContents.findOne({ where: { car_id: carId } });

    const existingContent = contentResult || null;

    return res.render("admin/car/carContent", {
      car,
      existingContent: JSON.stringify(existingContent), // passed to EJS, used by JS to pre-fill
    });
  } catch (err) {
    console.error("[carContent.getContentPage]", err);
    return res.status(500).send("Internal server error");
  }
};

/* ─────────────────────────────────────────
   GET /admin/car/:id/content/data
   Returns existing content as JSON (for AJAX pre-fill if needed)
───────────────────────────────────────── */
const getContentData = async (req, res) => {
  try {
    const carId = parseInt(req.params.id);

    const result = await db.query(`SELECT content, updated_at FROM car_content WHERE car_id = $1`, [carId]);

    if (!result.rows.length) {
      return res.json({ success: true, data: null });
    }

    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("[carContent.getContentData]", err);
    return res.status(500).json({ success: false, message: "Failed to fetch content" });
  }
};

const saveContent = async (req, res) => {
  try {
    const carId = parseInt(req.params.id);
    const body = req.body;

    // ── Basic validation ──────────────────────────────────────
    if (!body || typeof body !== "object") {
      return res.status(400).json({ success: false, message: "Invalid request body" });
    }

    const { seo, hero, specs, feature_highlight, premium_cards, faq, testimonials } = body;

    if (!seo?.title || !seo?.description || !seo?.h1) {
      return res.status(400).json({ success: false, message: "SEO fields (title, description, h1) are required" });
    }
    if (!hero?.brand || !hero?.model || !hero?.price || !hero?.btn_link) {
      return res.status(400).json({ success: false, message: "Hero fields (brand, model, price, btn_link) are required" });
    }
    if (!specs?.cards?.length) {
      return res.status(400).json({ success: false, message: "At least one spec card is required" });
    }

    // ── Check car exists ──────────────────────────────────────
    const carCheck = await Cars.findOne({
      where: { id: carId },
    });
    if (!carCheck) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }

    // ── Build the content object ───────────────────────────────
    const contentPayload = {
      seo: {
        title: seo.title.trim(),
        description: seo.description.trim(),
        h1: seo.h1.trim(),
      },
      hero: {
        brand: hero.brand.trim(),
        car_name: hero.car_name.trim(),
        description: hero.description?.trim() || "",
        rating: hero.rating?.trim() || "",
        bookings: hero.bookings?.trim() || "",
        price: hero.price.trim(),
        price_label: hero.price_label?.trim() || "",
        btn_text: hero.btn_text?.trim() || "Book Now",
        btn_link: hero.btn_link.trim(),
      },
      specs: {
        heading: specs.heading?.trim() || "Performance & Precision",
        cards: (specs.cards || []).map((c) => ({
          icon: c.icon?.trim() || "",
          value: c.value?.trim() || "",
          label: c.label?.trim() || "",
        })),
      },
      feature_highlight: {
        heading1: feature_highlight?.heading1?.trim() || "",
        heading2: feature_highlight?.heading2?.trim() || "",
        description: feature_highlight?.description?.trim() || "",
        stats: (feature_highlight?.stats || []).map((s) => ({
          value: s.value?.trim() || "",
          label: s.label?.trim() || "",
        })),
      },
      premium_cards: {
        heading: premium_cards?.heading?.trim() || "",
        subtext: premium_cards?.subtext?.trim() || "",
        cards: (premium_cards?.cards || []).map((c) => ({
          title: c.title?.trim() || "",
          description: c.description?.trim() || "",
          badge: c.badge?.trim() || "PREMIUM FEATURE",
        })),
      },
      // faq: {
      //   heading: faq?.heading?.trim() || "Frequently Asked Questions",
      //   items: (faq?.items || []).map((f) => ({
      //     question: f.question?.trim() || "",
      //     answer: f.answer?.trim() || "",
      //   })),
      // },
      // testimonials: {
      //   heading: testimonials?.heading?.trim() || "What Our Customers Say",
      //   items: (testimonials?.items || []).map((t) => ({
      //     name: t.name?.trim() || "",
      //     location: t.location?.trim() || "",
      //     rating: parseInt(t.rating) || 5,
      //     review: t.review?.trim() || "",
      //     date: t.date?.trim() || "",
      //   })),
      // },
    };

    const carContent = await CarContents.findOne({
      where: { car_id: carId },
    });

    if (carContent) {
      carContent.content = contentPayload;
      await carContent.save();
    } else {
      await CarContents.create({
        car_id: carId,
        content: contentPayload,
      });
    }

    return res.json({
      success: true,
      message: "Content saved successfully",
      data: { car_id: carId, updated_at: new Date().toISOString() },
    });
  } catch (err) {
    console.error("[carContent.saveContent]", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  showAllCars,
  createCarPage,
  createCar,
  uploadCarImages,
  deleteCar,
  getEditCarPage,
  updateCar,
  deleteCarImage,
  setCarImagePrimary,
  viewCarDetails,
  getContentData,
  getContentPage,
  saveContent,
};
