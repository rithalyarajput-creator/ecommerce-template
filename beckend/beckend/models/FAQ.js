const mongoose = require("mongoose");
const faqSchema = new mongoose.Schema({
  question: { type: String, required: true, trim: true },
  answer: { type: String, required: true, trim: true },
  category: { type: String, default: "General", enum: ["General","Product","Shipping","Returns","Payment","Care"] },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  showOnHome: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model("FAQ", faqSchema);
