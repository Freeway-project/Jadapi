import { Schema, model, Document, Types } from "mongoose";
import { E164_REGEX } from "./common";

export interface ContactDoc extends Document<Types.ObjectId> {
  ownerUserId: Types.ObjectId;     // the user who owns this contact book entry
  uuid: string;                    // public UUID for receiver lookup
  name: string;
  phone?: string;
  addressId?: Types.ObjectId;      // optional saved address
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema = new Schema<ContactDoc>(
  {
    ownerUserId: { type: Schema.Types.ObjectId, ref: "User", index: true, required: true },
    uuid: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: {
      type: String,
      validate: {
        validator: (v: string) => !v || E164_REGEX.test(v),
        message: "phone must be E.164 like +16045551234",
      },
    },
    addressId: { type: Schema.Types.ObjectId, ref: "Address" },
  },
  { timestamps: true }
);

export const Contact = model<ContactDoc>("Contact", ContactSchema);