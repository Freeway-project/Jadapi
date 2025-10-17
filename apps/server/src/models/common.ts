import { Schema } from "mongoose";

export const E164_REGEX = /^\+?[1-9]\d{1,14}$/; // basic E.164 phone check

export const GeoSchema = new Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { _id: false }
);