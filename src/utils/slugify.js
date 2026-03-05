const slugify = require("slugify");
const { Blogs } = require("../models");
const path = require("path");

async function generateUniqueSlug(title) {
  let baseSlug = slugify(title, {
    lower: true,
    strict: true,
  });

  let slug = baseSlug;
  let count = 1;

  while (await Blogs.findOne({ where: { slug } })) {
    slug = `${baseSlug}-${count}`;
    count++;
  }

  return slug;
}

const publicIdCreation = (file, id = null) => {
  const ext = path.extname(file.originalname);
  let baseName = path.basename(file.originalname, ext);
  if (id) {
    baseName = `${baseName}_${id}`;
  }
  const publicId = `${baseName}_${Date.now()}`;
  return publicId;
};

module.exports = { generateUniqueSlug, publicIdCreation };
