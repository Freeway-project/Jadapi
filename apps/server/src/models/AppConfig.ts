// Import necessary modules
import { Schema, model } from 'mongoose';

// Define the AppConfig schema
const AppConfigSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: 'global',
  },
  appActive: {
    type: Boolean,
    required: true,
    default: false,
  },
  promo: {
    activeCodes: {
      type: [String],
      default: [],
    },
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
  updatedBy: {
    type: String,
    required: true,
  },
  version: {
    type: Number,
    required: true,
    default: 1,
  },
});


const AppConfig = model('AppConfig', AppConfigSchema);
export default AppConfig;