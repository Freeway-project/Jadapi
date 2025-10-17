/**
 * Seed script for initial service areas
 * Run this to set up delivery areas for Vancouver, Burnaby, Surrey, Richmond
 */

import { ServiceArea } from "../models/ServiceArea";

export async function seedInitialServiceAreas() {
  console.log("🌱 Seeding initial service areas...");

  const serviceAreas = [
    {
      name: "Vancouver",
      type: "city" as const,
      province: "BC",
      country: "CA",
      postalCodePatterns: [
        "V5K", "V5L", "V5M", "V5N", "V5P", "V5R", "V5S", "V5T", "V5V", "V5W", "V5X", "V5Y", "V5Z",
        "V6A", "V6B", "V6C", "V6E", "V6G", "V6H", "V6J", "V6K", "V6L", "V6M", "V6N", "V6P", 
        "V6R", "V6S", "V6T", "V6V", "V6W", "V6X", "V6Y", "V6Z"
      ],
      isActive: true,
      deliveryFee: 5.99,
      estimatedDeliveryHours: 2
    },
    {
      name: "Burnaby", 
      type: "city" as const,
      province: "BC",
      country: "CA",
      postalCodePatterns: ["V5A", "V5B", "V5C", "V5E", "V5G", "V5H", "V5J"],
      isActive: true,
      deliveryFee: 7.99,
      estimatedDeliveryHours: 3
    },
    {
      name: "Surrey",
      type: "city" as const,
      province: "BC", 
      country: "CA",
      postalCodePatterns: ["V3R", "V3S", "V3T", "V3V", "V3W", "V3X", "V4A", "V4N", "V4P"],
      isActive: true,
      deliveryFee: 9.99,
      estimatedDeliveryHours: 4
    },
    {
      name: "Richmond",
      type: "city" as const,
      province: "BC",
      country: "CA", 
      postalCodePatterns: ["V6V", "V6W", "V6X", "V6Y", "V7A", "V7B", "V7C", "V7E"],
      isActive: true,
      deliveryFee: 6.99,
      estimatedDeliveryHours: 3
    },
    {
      name: "North Vancouver",
      type: "city" as const,
      province: "BC",
      country: "CA",
      postalCodePatterns: ["V7G", "V7H", "V7J", "V7K", "V7L", "V7M", "V7N", "V7P", "V7R"],
      isActive: true,
      deliveryFee: 8.99,
      estimatedDeliveryHours: 4
    },
    {
      name: "West Vancouver",
      type: "city" as const,
      province: "BC",
      country: "CA",
      postalCodePatterns: ["V7S", "V7T", "V7V", "V7W"],
      isActive: false, // Start with this disabled
      deliveryFee: 12.99,
      estimatedDeliveryHours: 5
    }
  ];

  try {
    for (const areaData of serviceAreas) {
      const existingArea = await ServiceArea.findOne({
        name: areaData.name,
        province: areaData.province
      });

      if (!existingArea) {
        const area = new ServiceArea(areaData);
        await area.save();
        console.log(`✅ Created service area: ${areaData.name}`);
      } else {
        console.log(`⏭️  Service area already exists: ${areaData.name}`);
      }
    }

    console.log("🎉 Service areas seeded successfully!");
    
    // Show summary
    const activeAreas = await ServiceArea.find({ isActive: true }).select('name');
    console.log(`📊 Active delivery areas: ${activeAreas.map(a => a.name).join(', ')}`);
    
  } catch (error) {
    console.error("❌ Error seeding service areas:", error);
    throw error;
  }
}

// If run directly
if (require.main === module) {
  // You would need to connect to MongoDB first
  // seedInitialServiceAreas().then(() => process.exit(0));
  console.log("Import this function in your app and call it after MongoDB connection");
}