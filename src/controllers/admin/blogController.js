const { Blogs, BlogSections, BlogFeatures, sequelize } = require("../../models");
const CloudinaryService = require("../../services/external/cloudinary.service");
const ErrorHandler = require("../../utils/ErrorHandler");
const { responseHandler, extractPublicId } = require("../../utils/helper");
const { generateUniqueSlug, publicIdCreation } = require("../../utils/slugify");

const listBlogs = async (req, res) => {
  try {
    const blogs = (await Blogs.findAll()) || [];
    res.render("admin/blogs/index.ejs", {
      blogs,
    });
  } catch (error) {
    console.log(error);
  }
};

const createBlogPage = async (req, res) => {
  try {
    res.render("admin/blogs/create.ejs", {
      tags: [
        {
          name: "car",
        },
        {
          name: "maybach",
        },
      ],
    });
  } catch (error) {
    console.log(error);
  }
};

const createBlog = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { title, status, meta_title, meta_description, meta_keywords } = req.body;

    // ── Validate required text fields ──────────────────────────────────────
    if (!title || !meta_title || !meta_description) {
      await t.rollback();
      return res.status(400).json({
        message: "Title, meta title, and meta description are required",
      });
    }

    // ── Hero image ─────────────────────────────────────────────────────────
    const heroFile = req.files?.["hero_image"]?.[0];
    let hero_image_url = null;
    if (heroFile) {
      const publicId = publicIdCreation(heroFile);
      const result = await CloudinaryService.uploadFile(heroFile, "sunvenus_backend/blogs", { publicId, useUUID: false });
      console.log(result);
      hero_image_url = result.secure_url || "";
    }

    const rawSections = [].concat(req.body.sections || []); // wrap in array if only 1 section
    const sections = [];

    for (let i = 0; i < rawSections.length; i++) {
      const sec = rawSections[i];
      const type = (sec.type || "").toUpperCase();

      if (type === "TEXT") {
        sections.push({
          type,
          content: sec.content || "",
          image_url: null,
        });
      } else if (type === "IMAGE") {
        // File key still uses the original bracket-notation field name
        const imgFile = req.files?.[`sections[${i}][image]`]?.[0];

        if (!imgFile) {
          await t.rollback();
          return res.status(400).json({
            message: `Section ${i + 1} is IMAGE type but no file was received`,
          });
        }
        const publicId = publicIdCreation(imgFile);
        const result = await CloudinaryService.uploadFile(imgFile, "sunvenus_backend/blogs", { publicId, useUUID: false });
        const imageUrl = result.secure_url || "";
        const imagePublicId = result.public_id || "";

        sections.push({
          type,
          content: null,
          image_url: imageUrl,
          image_public_id: imagePublicId,
        });
      } else {
        console.warn(`[createBlog] Unknown section type "${sec.type}" at index ${i} — skipped`);
      }
    }

    // ── Reconstruct features ───────────────────────────────────────────────
    // Same behaviour: features[0][title] → req.body.features[0] = { title, description }
    const rawFeatures = [].concat(req.body.features || []);

    const features = rawFeatures.map((f) => ({
      title: f.title || "",
      description: f.description || "",
    }));

    // ── Validate features count (2–3 or none) ─────────────────────────────
    if (features.length > 0 && (features.length < 2 || features.length > 3)) {
      await t.rollback();
      return res.status(400).json({
        message: "Features must be between 2 and 3 (or leave empty)",
      });
    }

    // ── Tags ───────────────────────────────────────────────────────────────
    const tagIds = []
      .concat(req.body["tags[]"] || req.body.tags || [])
      .map(Number)
      .filter(Boolean);

    // ── Slug ───────────────────────────────────────────────────────────────
    const slug = await generateUniqueSlug(title);

    // ── Create blog ────────────────────────────────────────────────────────
    const blog = await Blogs.create(
      {
        title,
        slug,
        hero_image: hero_image_url,
        meta_title,
        meta_description,
        meta_keywords: meta_keywords || null,
        status: status || "draft",
      },
      { transaction: t },
    );

    // ── Create sections ────────────────────────────────────────────────────
    for (let k = 0; k < sections.length; k++) {
      await BlogSections.create(
        {
          blog_id: blog.id,
          section_type: sections[k].type,
          content: sections[k].content,
          image_url: sections[k].image_url,
          image_public_id: sections[k].image_public_id,
          sort_order: k + 1,
        },
        { transaction: t },
      );
    }

    // ── Create features ────────────────────────────────────────────────────
    for (let k = 0; k < features.length; k++) {
      await BlogFeatures.create(
        {
          blog_id: blog.id,
          title: features[k].title,
          description: features[k].description,
          sort_order: k + 1,
        },
        { transaction: t },
      );
    }

    // ── Attach tags ────────────────────────────────────────────────────────
    if (tagIds.length > 0) {
      const validTagIds = tagIds.filter((id) => id < 9000); // >= 9000 = client-only temp IDs
      if (validTagIds.length > 0) {
        await blog.setTags(validTagIds, { transaction: t });
      }
    }

    await t.commit();

    return res.status(201).json({
      message: "Blog created successfully",
      redirectUrl: "/admin/blogs",
      data: { id: blog.id, slug: blog.slug },
    });
  } catch (err) {
    await t.rollback();
    console.error("[createBlog]", err);
    return res.status(500).json({ error: err.message });
  }
};

const blogJsonData = async (req, res, next) => {
  try {
    const { id } = req.params;
    // console.log(id);

    if (!id) throw new ErrorHandler(404, "Id missing");
    const blog = await Blogs.findOne({
      where: { id },
      include: [
        {
          model: BlogFeatures,
          as: "features",
        },
        {
          model: BlogSections,
          as: "sections",
        },
      ],
    });
    if (!blog) {
      throw new ErrorHandler(404, "No blog found");
    }
    responseHandler(res, 200, "Blog Data", { blog });
  } catch (error) {
    // next(error);
    res.status(500).json({
      success: false,
      mesage: error.message || "Internal Server Error",
    });
  }
};

const updateBlogPage = async (req, res) => {
  try {
    res.render("admin/blogs/update.ejs");
  } catch (error) {
    console.log(error);
  }
};

const updateBlog = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const blogId = req.params.id;

    // ── Fetch existing blog ────────────────────────────────────────────────
    const blog = await Blogs.findByPk(blogId, {
      include: [
        { model: BlogSections, as: "sections" },
        { model: BlogFeatures, as: "features" },
      ],
      transaction: t,
    });

    if (!blog) {
      await t.rollback();
      return res.status(404).json({ message: "Blog not found" });
    }

    // ── Validate required text fields ──────────────────────────────────────
    const { title, status, meta_title, meta_description, meta_keywords } = req.body;

    if (!title || !meta_title || !meta_description) {
      await t.rollback();
      return res.status(400).json({
        message: "Title, meta title, and meta description are required",
      });
    }

    // ── Hero image ─────────────────────────────────────────────────────────
    // Only replace if a new file was uploaded; otherwise keep existing value
    const heroFile = req.files?.["hero_image"]?.[0];
    let hero_image_url = blog.hero_image; // keep current by default

    if (heroFile) {
      // Delete old hero image from Cloudinary if it exists
      if (blog.hero_image) {
        const oldPublicId = extractPublicId(blog.hero_image); // implement per your util
        if (oldPublicId) {
          await CloudinaryService.delete(oldPublicId).catch((e) => console.warn("[updateBlog] Failed to delete old hero image:", e.message));
        }
      }
      const publicId = publicIdCreation(heroFile);
      const result = await CloudinaryService.uploadFile(heroFile, "sunvenus_backend/blogs", {
        publicId,
        useUUID: false,
      });
      hero_image_url = result.secure_url || "";
    }

    // ── Parse & process incoming sections ─────────────────────────────────
    // Frontend sends sections[i][type] (same convention as create)
    const rawSections = [].concat(req.body.sections || []);
    const processedSections = [];

    for (let i = 0; i < rawSections.length; i++) {
      const sec = rawSections[i];
      const type = (sec.section_type || sec.type || "").toUpperCase();
      const existingDbId = sec.id ? Number(sec.id) : null; // present when editing an existing section

      if (type === "TEXT") {
        processedSections.push({
          id: existingDbId,
          type,
          content: sec.content || "",
          image_url: null,
          image_public_id: null,
        });
      } else if (type === "IMAGE") {
        // Check for a freshly uploaded replacement file first
        const imgFile = req.files?.[`sections[${i}][image]`]?.[0];

        if (imgFile) {
          // New file uploaded — delete the old Cloudinary asset if this is a replacement
          if (existingDbId && sec.image_public_id) {
            await CloudinaryService.delete(sec.image_public_id).catch((e) =>
              console.warn(`[updateBlog] Failed to delete old section image at index ${i}:`, e.message),
            );
          }

          const publicId = publicIdCreation(imgFile);
          const result = await CloudinaryService.uploadFile(imgFile, "sunvenus_backend/blogs", {
            publicId,
            useUUID: false,
          });

          processedSections.push({
            id: existingDbId,
            type,
            content: null,
            image_url: result.secure_url || "",
            image_public_id: result.public_id || "",
          });
        } else if (sec.image_url) {
          // No new file — client kept the existing image, just pass it through
          processedSections.push({
            id: existingDbId,
            type,
            content: null,
            image_url: sec.image_url,
            image_public_id: sec.image_public_id || null,
          });
        } else {
          // IMAGE section with neither a file nor an existing URL — reject
          await t.rollback();
          return res.status(400).json({
            message: `Section ${i + 1} is IMAGE type but no file or existing image was provided`,
          });
        }
      } else {
        console.warn(`[updateBlog] Unknown section type "${sec.section_type || sec.type}" at index ${i} — skipped`);
      }
    }

    // ── Parse & validate features ──────────────────────────────────────────
    const rawFeatures = [].concat(req.body.features || []);

    const processedFeatures = rawFeatures.map((f) => ({
      id: f.id ? Number(f.id) : null,
      title: f.title || "",
      description: f.description || "",
    }));

    if (processedFeatures.length > 0 && (processedFeatures.length < 2 || processedFeatures.length > 3)) {
      await t.rollback();
      return res.status(400).json({
        message: "Features must be between 2 and 3 (or leave empty)",
      });
    }

    // ── Tags ───────────────────────────────────────────────────────────────
    const tagIds = []
      .concat(req.body["tags[]"] || req.body.tags || [])
      .map(Number)
      .filter(Boolean);

    // ── Update the blog record itself ──────────────────────────────────────
    await blog.update(
      {
        title,
        hero_image: hero_image_url,
        meta_title,
        meta_description,
        meta_keywords: meta_keywords || null,
        status: status || "draft",
      },
      { transaction: t },
    );

    // ── Reconcile sections ─────────────────────────────────────────────────
    // Strategy: collect incoming db ids → delete removed rows → upsert the rest

    const incomingIds = processedSections.map((s) => s.id).filter(Boolean);

    // Delete sections that were removed on the frontend
    const existingSectionIds = blog.sections.map((s) => s.id);
    const sectionsToDelete = existingSectionIds.filter((id) => !incomingIds.includes(id));

    if (sectionsToDelete.length > 0) {
      // Clean up Cloudinary assets for deleted image sections
      const deletedImageSections = blog.sections.filter((s) => sectionsToDelete.includes(s.id) && s.section_type === "IMAGE" && s.image_public_id);
      for (const s of deletedImageSections) {
        await CloudinaryService.delete(s.image_public_id).catch((e) =>
          console.warn("[updateBlog] Failed to delete removed section image:", e.message),
        );
      }
      await BlogSections.destroy({
        where: { id: sectionsToDelete },
        transaction: t,
      });
    }

    // Upsert remaining sections (update existing, create new)
    for (let k = 0; k < processedSections.length; k++) {
      const sec = processedSections[k];

      if (sec.id) {
        // Update existing
        await BlogSections.update(
          {
            section_type: sec.type,
            content: sec.content,
            image_url: sec.image_url,
            image_public_id: sec.image_public_id,
            sort_order: k + 1,
          },
          { where: { id: sec.id, blog_id: blogId }, transaction: t },
        );
      } else {
        // New section added on the frontend
        await BlogSections.create(
          {
            blog_id: blogId,
            section_type: sec.type,
            content: sec.content,
            image_url: sec.image_url,
            image_public_id: sec.image_public_id,
            sort_order: k + 1,
          },
          { transaction: t },
        );
      }
    }

    // ── Reconcile features ─────────────────────────────────────────────────
    const incomingFeatureIds = processedFeatures.map((f) => f.id).filter(Boolean);

    const existingFeatureIds = blog.features.map((f) => f.id);
    const featuresToDelete = existingFeatureIds.filter((id) => !incomingFeatureIds.includes(id));

    if (featuresToDelete.length > 0) {
      await BlogFeatures.destroy({
        where: { id: featuresToDelete },
        transaction: t,
      });
    }

    for (let k = 0; k < processedFeatures.length; k++) {
      const feat = processedFeatures[k];

      if (feat.id) {
        await BlogFeatures.update(
          {
            title: feat.title,
            description: feat.description,
            sort_order: k + 1,
          },
          { where: { id: feat.id, blog_id: blogId }, transaction: t },
        );
      } else {
        await BlogFeatures.create(
          {
            blog_id: blogId,
            title: feat.title,
            description: feat.description,
            sort_order: k + 1,
          },
          { transaction: t },
        );
      }
    }

    // ── Sync tags ──────────────────────────────────────────────────────────
    // // setTags replaces the full association — same as create
    // const validTagIds = tagIds.filter((id) => id < 9000); // >= 9000 = client-only temp IDs
    // await blog.setTags(validTagIds, { transaction: t });

    await t.commit();

    return res.status(200).json({
      message: "Blog updated successfully",
      data: { id: blog.id, slug: blog.slug },
    });
  } catch (err) {
    await t.rollback();
    console.error("[updateBlog]", err);
    return res.status(500).json({ error: err.message });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id) {
      throw new Error("Id Missing");
    }

    // Find blog with associated sections
    const blog = await Blogs.findByPk(id, {
      include: [
        {
          model: BlogSections,
          as: "sections",
          attributes: ["image_public_id"],
        },
      ],
    });

    // Check if blog exists
    if (!blog) {
      throw new Error("Blog not found");
    }

    // optional: Delete images from Cloudinary (if used)
    if (blog.BlogSections && blog.BlogSections.length > 0) {
      for (const section of blog.sections) {
        if (section.image_public_id) {
          await CloudinaryService.delete(section.image_public_id);
        }
      }
    }

    // Delete blog (will cascade if associations are set properly)
    await blog.destroy({
      individualHooks: true,
    });
    if (req.method == "GET") {
      return res.redirect(req.header("referer"));
    }

    return res.status(200).json({ success: true, mesage: "deleted" });
  } catch (error) {
    // res.redirect("/admin/blogs");
    return res.status(500).json({
      success: false,
      message: error?.message || "Internal Server Error",
    });
  }
};

module.exports = { listBlogs, createBlog, createBlogPage, blogJsonData, updateBlogPage, updateBlog, deleteBlog };
