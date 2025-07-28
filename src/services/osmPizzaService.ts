// src/services/osmPizzaService.ts - OpenStreetMap Pizza Discovery Service
import { supabase } from "./supabase";
import { Pizzeria, PizzeriaInsert } from "../types";
import { calculateDistance } from "../utils";

// OpenStreetMap Overpass API endpoint
const OVERPASS_API = "https://overpass-api.de/api/interpreter";

interface OSMNode {
  type: "node";
  id: number;
  lat: number;
  lon: number;
  tags: {
    name?: string;
    amenity?: string;
    cuisine?: string;
    phone?: string;
    website?: string;
    "addr:street"?: string;
    "addr:housenumber"?: string;
    "addr:city"?: string;
    "addr:state"?: string;
    "addr:postcode"?: string;
    opening_hours?: string;
    brand?: string;
    "brand:wikidata"?: string;
  };
}

interface OSMWay {
  type: "way";
  id: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags: OSMNode["tags"];
}

interface OverpassResponse {
  version: number;
  generator: string;
  elements: (OSMNode | OSMWay)[];
}

/**
 * Search for pizza places using OpenStreetMap Overpass API
 */
export const searchPizzaPlacesOSM = async (
  latitude: number,
  longitude: number,
  radiusKm: number = 10
): Promise<{
  success: boolean;
  pizzerias: Pizzeria[];
  error?: string;
}> => {
  try {
    // Overpass QL query for pizza places
    // Searches for amenity=restaurant with cuisine=pizza or name containing "pizza"
    const overpassQuery = `
      [out:json][timeout:25];
      (
        node["amenity"="restaurant"]["cuisine"~"pizza"](around:${
          radiusKm * 1000
        },${latitude},${longitude});
        way["amenity"="restaurant"]["cuisine"~"pizza"](around:${
          radiusKm * 1000
        },${latitude},${longitude});
        node["amenity"="fast_food"]["cuisine"~"pizza"](around:${
          radiusKm * 1000
        },${latitude},${longitude});
        way["amenity"="fast_food"]["cuisine"~"pizza"](around:${
          radiusKm * 1000
        },${latitude},${longitude});
        node["name"~"[Pp]izza"]["amenity"~"restaurant|fast_food"](around:${
          radiusKm * 1000
        },${latitude},${longitude});
        way["name"~"[Pp]izza"]["amenity"~"restaurant|fast_food"](around:${
          radiusKm * 1000
        },${latitude},${longitude});
      );
      out center meta;
    `;

    const response = await fetch(OVERPASS_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `data=${encodeURIComponent(overpassQuery)}`,
    });

    if (!response.ok) {
      throw new Error(`OpenStreetMap API error: ${response.status}`);
    }

    const data: OverpassResponse = await response.json();

    // Transform OSM data to our Pizzeria format
    const pizzerias: Pizzeria[] = data.elements
      .filter((element) => element.tags?.name) // Only include places with names
      .map((element) => transformOSMToPizzeria(element, latitude, longitude))
      .filter(Boolean) as Pizzeria[];

    return {
      success: true,
      pizzerias,
    };
  } catch (error) {
    console.error("Error searching OpenStreetMap:", error);
    return {
      success: false,
      pizzerias: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * Transform OSM element to our Pizzeria format
 */
const transformOSMToPizzeria = (
  element: OSMNode | OSMWay,
  userLat: number,
  userLon: number
): Pizzeria | null => {
  const { tags } = element;

  if (!tags?.name) return null;

  // Get coordinates - for ways, use center, for nodes use lat/lon
  const lat = element.type === "way" ? element.center?.lat : element.lat;
  const lon = element.type === "way" ? element.center?.lon : element.lon;

  if (!lat || !lon) return null;

  // Build address from parts
  const addressParts = [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:city"],
    tags["addr:state"],
    tags["addr:postcode"],
  ].filter(Boolean);

  const address =
    addressParts.length > 0
      ? addressParts.join(" ")
      : `${lat.toFixed(6)}, ${lon.toFixed(6)}`; // Fallback to coordinates

  // Determine business type based on brand info
  const businessType: string =
    tags.brand || tags["brand:wikidata"] ? "chain" : "independent";

  // Extract cuisine styles from cuisine tag
  const cuisineStyles = tags.cuisine
    ? tags.cuisine.split(";").map((c) => c.trim().toLowerCase())
    : ["pizza"];

  // Calculate distance from user
  const distance = calculateDistance(userLat, userLon, lat, lon);

  return {
    id: `osm_${element.type}_${element.id}`, // Temporary ID until saved to DB
    name: tags.name,
    address,
    latitude: lat,
    longitude: lon,
    phone: tags.phone || null,
    website: tags.website || null,
    verified: false, // OSM data is not verified by us
    photos: null,
    description: null,
    hours: tags.opening_hours ? { raw: tags.opening_hours } : null,
    price_range: null, // OSM doesn't typically have pricing
    business_type: businessType,
    cuisine_styles: cuisineStyles,
    api_source: "openstreetmap",
    yelp_id: null,
    rating_external: null,
    review_count_external: null,
    last_updated: new Date().toISOString(),
    created_at: new Date().toISOString(),
  } as Pizzeria;
};

/**
 * Smart pizza discovery - check DB first, then OSM
 */
export const discoverPizzaPlaces = async (
  latitude: number,
  longitude: number,
  radiusKm: number = 10
): Promise<{
  success: boolean;
  pizzerias: Pizzeria[];
  fromCache: number;
  fromAPI: number;
  error?: string;
}> => {
  try {
    // Step 1: Check our database first
    const { data: cachedPizzerias, error: dbError } = await supabase
      .from("pizzerias")
      .select("*")
      .gte("latitude", latitude - radiusKm / 69)
      .lte("latitude", latitude + radiusKm / 69)
      .gte(
        "longitude",
        longitude - radiusKm / (69 * Math.cos((latitude * Math.PI) / 180))
      )
      .lte(
        "longitude",
        longitude + radiusKm / (69 * Math.cos((latitude * Math.PI) / 180))
      );

    if (dbError) {
      console.error("Database query error:", dbError);
    }

    const cached = (cachedPizzerias || [])
      .map((p) => ({
        ...p,
        distance: calculateDistance(
          latitude,
          longitude,
          p.latitude,
          p.longitude
        ),
      }))
      .filter((p) => p.distance <= radiusKm);
    let fromAPI: Pizzeria[] = [];

    // Step 2: If we have few results, supplement with OSM data
    if (cached.length < 5) {
      const osmResult = await searchPizzaPlacesOSM(
        latitude,
        longitude,
        radiusKm
      );

      if (osmResult.success) {
        // Filter out places we already have in DB
        const newPlaces = osmResult.pizzerias.filter(
          (osmPlace) =>
            !cached.some(
              (cachedPlace) =>
                calculateDistance(
                  cachedPlace.latitude,
                  cachedPlace.longitude,
                  osmPlace.latitude,
                  osmPlace.longitude
                ) < 0.05 // Less than ~300 feet apart = same place
            )
        );

        // Cache new places in our database
        if (newPlaces.length > 0) {
          await cacheNewPizzerias(newPlaces);
        }

        fromAPI = newPlaces;
      }
    }

    // Combine results and sort by distance
    const allPizzerias = [...cached, ...fromAPI]
      .map((p) => {
        // Remove distance property if it exists, then add it properly
        const { distance, ...pizzeriaWithoutDistance } = p as any;
        return {
          ...pizzeriaWithoutDistance,
          distance: calculateDistance(
            latitude,
            longitude,
            p.latitude,
            p.longitude
          ),
        };
      })
      .sort((a, b) => a.distance - b.distance);

    return {
      success: true,
      pizzerias: allPizzerias,
      fromCache: cached.length,
      fromAPI: fromAPI.length,
    };
  } catch (error) {
    console.error("Error in pizza discovery:", error);
    return {
      success: false,
      pizzerias: [],
      fromCache: 0,
      fromAPI: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * Cache new pizzerias in our database
 */
const cacheNewPizzerias = async (pizzerias: Pizzeria[]): Promise<void> => {
  try {
    const pizzeriaInserts: PizzeriaInsert[] = pizzerias.map((p) => ({
      name: p.name,
      address: p.address,
      latitude: p.latitude,
      longitude: p.longitude,
      phone: p.phone,
      website: p.website,
      verified: false,
      photos: p.photos,
      description: p.description,
      hours: p.hours,
      price_range: p.price_range,
      business_type: p.business_type,
      cuisine_styles: p.cuisine_styles,
      api_source: p.api_source,
      yelp_id: p.yelp_id,
      rating_external: p.rating_external,
      review_count_external: p.review_count_external,
    }));

    const { error } = await supabase.from("pizzerias").insert(pizzeriaInserts);

    if (error) {
      console.error("Error caching pizzerias:", error);
    } else {
      console.log(`Cached ${pizzerias.length} new pizza places`);
    }
  } catch (error) {
    console.error("Error in cacheNewPizzerias:", error);
  }
};
