const express = require("express");
const router = express.Router();
const axios = require("axios");
const cheerio = require("cheerio");
const { protect, admin } = require("../middleware/auth");

// POST /api/scrape  — admin only
// Body: { url: "https://meesho.com/..." }
router.post("/", protect, admin, async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ success: false, message: "URL is required" });

  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        Referer: "https://www.google.com/",
      },
      maxRedirects: 5,
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // ── Extract using Open Graph / meta tags ──────────────────
    const getMeta = (name) =>
      $(`meta[property="${name}"]`).attr("content") ||
      $(`meta[name="${name}"]`).attr("content") ||
      "";

    const title =
      getMeta("og:title") ||
      getMeta("twitter:title") ||
      $("title").text().split("|")[0].split("-")[0].trim() ||
      "";

    const description =
      getMeta("og:description") ||
      getMeta("description") ||
      getMeta("twitter:description") ||
      "";

    // Price — try various patterns
    const priceRaw =
      getMeta("og:price:amount") ||
      getMeta("product:price:amount") ||
      getMeta("twitter:data1") ||
      "";

    let price = "";
    if (priceRaw) {
      price = priceRaw.replace(/[^0-9.]/g, "");
    } else {
      // Try to find price in text
      const priceMatch = html.match(/[₹\$]\s*([0-9,]+(\.[0-9]+)?)/);
      if (priceMatch) price = priceMatch[1].replace(/,/g, "");
    }

    // Images — collect up to 5
    const images = [];
    const ogImage = getMeta("og:image");
    if (ogImage) images.push(ogImage);

    $('meta[property="og:image"]').each((_, el) => {
      const src = $(el).attr("content");
      if (src && !images.includes(src)) images.push(src);
    });

    // Also try product image tags
    $('img[src*="meesho"], img[src*="product"], img[src*="catalog"]').each((_, el) => {
      const src = $(el).attr("src");
      if (src && src.startsWith("http") && !images.includes(src)) images.push(src);
    });

    // Rating
    const ratingRaw = getMeta("og:rating") || getMeta("twitter:data2") || "";
    let rating = "";
    if (ratingRaw) {
      const rm = ratingRaw.match(/([0-9.]+)/);
      if (rm) rating = rm[1];
    }

    // Clean title
    const cleanTitle = title
      .replace(/\s*[-|]\s*(Meesho|Amazon|Flipkart|Buy Online).*/i, "")
      .trim();

    res.json({
      success: true,
      data: {
        title: cleanTitle,
        description: description.trim(),
        price: price || "",
        images: images.slice(0, 5),
        rating: rating,
        sourceUrl: url,
      },
    });
  } catch (err) {
    let message = "Failed to fetch URL";
    if (err.code === "ECONNABORTED" || err.message.includes("timeout")) {
      message = "Request timed out. The website took too long to respond.";
    } else if (err.response?.status === 403) {
      message = "Website blocked the request (403 Forbidden). Try copying details manually.";
    } else if (err.response?.status === 404) {
      message = "Product page not found (404).";
    } else if (err.message) {
      message = err.message;
    }
    res.status(500).json({ success: false, message });
  }
});

module.exports = router;
