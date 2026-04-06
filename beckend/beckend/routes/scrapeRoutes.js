const express = require("express");
const router = express.Router();
const axios = require("axios");
const cheerio = require("cheerio");
const { protect, admin } = require("../middleware/auth");

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-IN,en;q=0.9,hi;q=0.8",
  "Accept-Encoding": "gzip, deflate, br",
  Referer: "https://www.google.com/",
  "Cache-Control": "no-cache",
};

async function fetchHtml(url) {
  // Strategy 1: Direct fetch
  try {
    const res = await axios.get(url, { timeout: 8000, headers: HEADERS, maxRedirects: 5 });
    if (res.data && res.data.length > 500) return res.data;
  } catch (_) {}

  // Strategy 2: Via allorigins proxy
  try {
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const res = await axios.get(proxyUrl, { timeout: 10000, headers: { "User-Agent": HEADERS["User-Agent"] } });
    if (res.data && res.data.length > 500) return res.data;
  } catch (_) {}

  // Strategy 3: Via corsproxy
  try {
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    const res = await axios.get(proxyUrl, { timeout: 10000, headers: HEADERS });
    if (res.data && res.data.length > 500) return res.data;
  } catch (_) {}

  return null;
}

function extractData(html, url) {
  const $ = cheerio.load(html);

  const getMeta = (prop) =>
    $(`meta[property="${prop}"]`).attr("content") ||
    $(`meta[name="${prop}"]`).attr("content") ||
    "";

  // ── JSON-LD (richest source) ────────────────────────────────
  let jsonTitle = "", jsonDesc = "", jsonPrice = "", jsonImages = [], jsonRating = "";
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html());
      const item = Array.isArray(data) ? data[0] : data;
      if (item["@type"] === "Product" || item.name) {
        if (!jsonTitle && item.name) jsonTitle = item.name;
        if (!jsonDesc && item.description) jsonDesc = item.description;
        if (!jsonPrice && item.offers) {
          const offer = Array.isArray(item.offers) ? item.offers[0] : item.offers;
          jsonPrice = String(offer?.price || "");
        }
        if (!jsonRating && item.aggregateRating) {
          jsonRating = String(item.aggregateRating.ratingValue || "");
        }
        if (item.image) {
          const imgs = Array.isArray(item.image) ? item.image : [item.image];
          jsonImages.push(...imgs.filter(i => typeof i === "string"));
        }
      }
    } catch (_) {}
  });

  // ── Open Graph ──────────────────────────────────────────────
  const ogTitle = getMeta("og:title") || getMeta("twitter:title");
  const ogDesc = getMeta("og:description") || getMeta("description");
  const ogImage = getMeta("og:image");
  const ogPrice = getMeta("og:price:amount") || getMeta("product:price:amount");

  // ── Page title fallback ─────────────────────────────────────
  const pageTitle = $("title").text()
    .replace(/\s*[-|–]\s*(Meesho|Amazon|Flipkart|Buy Online|Shop|Online).*/i, "")
    .trim();

  // ── Price fallback: scan visible text ──────────────────────
  let scrapedPrice = "";
  if (!jsonPrice && !ogPrice) {
    const bodyText = $("body").text();
    const match = bodyText.match(/(?:₹|Rs\.?)\s*([0-9,]+)/);
    if (match) scrapedPrice = match[1].replace(/,/g, "");
  }

  // ── Images ─────────────────────────────────────────────────
  const images = [...new Set([
    ...jsonImages,
    ...(ogImage ? [ogImage] : []),
    ...$('meta[property="og:image"]').map((_, el) => $(el).attr("content")).get(),
  ])].filter(Boolean).slice(0, 5);

  return {
    title: (jsonTitle || ogTitle || pageTitle || "").trim().slice(0, 200),
    description: (jsonDesc || ogDesc || "").trim().slice(0, 2000),
    price: (jsonPrice || ogPrice || scrapedPrice || "").replace(/[^0-9.]/g, ""),
    images,
    rating: (jsonRating || "").replace(/[^0-9.]/g, ""),
  };
}

// POST /api/scrape  — admin only
router.post("/", protect, admin, async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ success: false, message: "URL is required" });

  const html = await fetchHtml(url);

  if (!html) {
    return res.status(502).json({
      success: false,
      message: "Could not fetch this page. Please fill details manually.",
    });
  }

  const data = extractData(html, url);
  res.json({ success: true, data: { ...data, sourceUrl: url } });
});

module.exports = router;
