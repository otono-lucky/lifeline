// services/locationService.ts
// Verified Location Service powered by countriesnow.space & OpenStreetMap Nominatim / Photon API
// Provides Country/State/LGA cascading choices + real-time keyword location suggestions
// scoped and biased by Country, State, and City of Residence

export interface LocationOption {
  label: string;
  value: string;
}

export interface LocationSuggestion {
  placeId: string;
  formattedAddress: string;
  mainText: string;
  secondaryText: string;
  streetAddress: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
}

const API_BASE = "https://countriesnow.space/api/v0.1/countries";

// In-memory caches to prevent redundant network hits
const cache = {
  countries: null as LocationOption[] | null,
  states: new Map<string, LocationOption[]>(),
  cities: new Map<string, LocationOption[]>(),
  suggestions: new Map<string, LocationSuggestion[]>(),
};

// Fallback Nigerian states in case of network issue
const NIGERIA_STATES_FALLBACK: LocationOption[] = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT Abuja", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
  "Taraba", "Yobe", "Zamfara"
].map((s) => ({ label: s, value: s }));

// Country to ISO 3166-1 alpha-2 mapping for search filtering
const COUNTRY_TO_ISO2: Record<string, string> = {
  nigeria: "ng",
  ghana: "gh",
  "united states": "us",
  "united states of america": "us",
  usa: "us",
  "united kingdom": "gb",
  uk: "gb",
  canada: "ca",
  "south africa": "za",
  kenya: "ke",
  uganda: "ug",
  rwanda: "rw",
  tanzania: "tz",
  cameroon: "cm",
  germany: "de",
  france: "fr",
  ireland: "ie",
  australia: "au",
  "new zealand": "nz",
  india: "in",
  "united arab emirates": "ae",
  uae: "ae",
};

const parseNominatimItems = (
  items: any[],
  fallbackCountry: string,
  filterState?: string,
  filterCity?: string
): LocationSuggestion[] => {
  if (!Array.isArray(items)) return [];

  const parsed: LocationSuggestion[] = items.map((item: any) => {
    const addr = item.address || {};
    const street =
      addr.road || addr.pedestrian || addr.building || addr.neighbourhood || addr.suburb || item.name || "";
    const city =
      addr.city || addr.town || addr.village || addr.suburb || addr.county || "";
    const state = (addr.state || "").replace(/\s+State$/i, "");
    const country = addr.country || fallbackCountry || "";

    const parts = (item.display_name || "").split(",");
    const mainText = parts[0]?.trim() || street || item.name;
    const secondaryText = parts.slice(1, 4).join(",").trim();

    return {
      placeId: String(item.place_id || Math.random()),
      formattedAddress: item.display_name,
      mainText,
      secondaryText,
      streetAddress: mainText,
      city: city || mainText,
      state: state || "",
      country: country || "",
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
    };
  });

  // If state filter is specified, prioritize/rank matches in the same state first
  if (filterState) {
    const normState = filterState.toLowerCase().trim();
    parsed.sort((a, b) => {
      const aMatches = a.state.toLowerCase().includes(normState) ? 1 : 0;
      const bMatches = b.state.toLowerCase().includes(normState) ? 1 : 0;
      return bMatches - aMatches;
    });
  }

  // If city filter is specified, prioritize matches in the same city/LGA
  if (filterCity) {
    const normCity = filterCity.toLowerCase().trim();
    parsed.sort((a, b) => {
      const aMatches = a.city.toLowerCase().includes(normCity) ? 1 : 0;
      const bMatches = b.city.toLowerCase().includes(normCity) ? 1 : 0;
      return bMatches - aMatches;
    });
  }

  return parsed;
};

export const locationService = {
  /**
   * Fetch list of countries from countriesnow.space API
   */
  getCountries: async (): Promise<LocationOption[]> => {
    if (cache.countries) return cache.countries;

    try {
      const response = await fetch(`${API_BASE}/info?returns=none`);
      const json = await response.json();

      if (!json.error && Array.isArray(json.data)) {
        const countryOptions: LocationOption[] = json.data
          .map((c: any) => ({ label: c.name, value: c.name }))
          .sort((a: LocationOption, b: LocationOption) => a.label.localeCompare(b.label));

        const nigeriaIdx = countryOptions.findIndex((c) => c.value.toLowerCase() === "nigeria");
        if (nigeriaIdx > -1) {
          const [nigeria] = countryOptions.splice(nigeriaIdx, 1);
          countryOptions.unshift(nigeria);
        }

        cache.countries = countryOptions;
        return countryOptions;
      }
    } catch (err) {
      console.warn("[locationService] Failed to fetch countries from API, using fallback:", err);
    }

    const fallback: LocationOption[] = [
      { label: "Nigeria", value: "Nigeria" },
      { label: "Ghana", value: "Ghana" },
      { label: "United Kingdom", value: "United Kingdom" },
      { label: "United States", value: "United States" },
      { label: "Canada", value: "Canada" },
      { label: "South Africa", value: "South Africa" },
      { label: "Kenya", value: "Kenya" },
    ];
    cache.countries = fallback;
    return fallback;
  },

  /**
   * Fetch list of states for a given country
   */
  getStates: async (country: string): Promise<LocationOption[]> => {
    if (!country) return [];
    const normalizedCountry = country.trim();
    if (cache.states.has(normalizedCountry)) {
      return cache.states.get(normalizedCountry)!;
    }

    try {
      const response = await fetch(`${API_BASE}/states`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country: normalizedCountry }),
      });
      const json = await response.json();

      if (!json.error && json.data?.states) {
        const stateOptions: LocationOption[] = json.data.states
          .map((s: any) => {
            const cleanName = s.name.replace(/\s+State$/i, "");
            return { label: cleanName, value: cleanName };
          })
          .sort((a: LocationOption, b: LocationOption) => a.label.localeCompare(b.label));

        cache.states.set(normalizedCountry, stateOptions);
        return stateOptions;
      }
    } catch (err) {
      console.warn(`[locationService] Failed to fetch states for ${country}:`, err);
    }

    if (normalizedCountry.toLowerCase() === "nigeria") {
      cache.states.set(normalizedCountry, NIGERIA_STATES_FALLBACK);
      return NIGERIA_STATES_FALLBACK;
    }

    return [];
  },

  /**
   * Fetch list of cities/LGAs for a given country & state
   */
  getCities: async (country: string, state: string): Promise<LocationOption[]> => {
    if (!country || !state) return [];
    const cacheKey = `${country.trim().toLowerCase()}__${state.trim().toLowerCase()}`;
    if (cache.cities.has(cacheKey)) {
      return cache.cities.get(cacheKey)!;
    }

    try {
      let response = await fetch(`${API_BASE}/state/cities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country: country.trim(), state: state.trim() }),
      });
      let json = await response.json();

      if ((json.error || !json.data?.length) && country.toLowerCase() === "nigeria" && !state.toLowerCase().includes("state")) {
        response = await fetch(`${API_BASE}/state/cities`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ country: country.trim(), state: `${state.trim()} State` }),
        });
        json = await response.json();
      }

      if (!json.error && Array.isArray(json.data) && json.data.length > 0) {
        const cityOptions: LocationOption[] = json.data
          .map((cityName: string) => ({ label: cityName, value: cityName }))
          .sort((a: LocationOption, b: LocationOption) => a.label.localeCompare(b.label));

        cache.cities.set(cacheKey, cityOptions);
        return cityOptions;
      }
    } catch (err) {
      console.warn(`[locationService] Failed to fetch cities for ${country}, ${state}:`, err);
    }

    return [];
  },

  /**
   * Suggest locations based on keyword query in real-time,
   * scoped and biased by country, state, and city of residence.
   */
  suggestLocations: async (
    keyword: string,
    countryOfResidence?: string,
    stateOfResidence?: string,
    cityOfResidence?: string
  ): Promise<LocationSuggestion[]> => {
    const rawQuery = keyword.trim();
    if (rawQuery.length < 2) return [];

    const countryKey = (countryOfResidence || "").toLowerCase().trim();
    const iso2 = COUNTRY_TO_ISO2[countryKey] || (countryKey.length === 2 ? countryKey : "");
    const stateKey = (stateOfResidence || "").trim();
    const cityKey = (cityOfResidence || "").trim();

    const cacheKey = `${iso2}::${stateKey}::${cityKey}::${rawQuery.toLowerCase()}`;
    if (cache.suggestions.has(cacheKey)) {
      return cache.suggestions.get(cacheKey)!;
    }

    const countryFilter = iso2 ? `&countrycodes=${encodeURIComponent(iso2)}` : "";

    // 1. Try search with granular context: [keyword, city, state]
    // e.g. "Admiralty, Lekki, Lagos"
    const queryWithCityAndState = [rawQuery, cityKey, stateKey]
      .filter((part, idx, arr) => part && arr.indexOf(part) === idx)
      .join(", ");

    try {
      const url1 = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        queryWithCityAndState
      )}&format=json&addressdetails=1&limit=5${countryFilter}`;

      const res1 = await fetch(url1, {
        headers: {
          "User-Agent": "LifelineApp/1.0 (faith-dating-onboarding)",
          Accept: "application/json",
        },
      });

      if (res1.ok) {
        const data1 = await res1.json();
        if (Array.isArray(data1) && data1.length > 0) {
          const suggestions = parseNominatimItems(
            data1,
            countryOfResidence || "",
            stateKey,
            cityKey
          );
          cache.suggestions.set(cacheKey, suggestions);
          return suggestions;
        }
      }
    } catch (err) {
      console.warn("[locationService] Nominatim queryWithCityAndState error:", err);
    }

    // 2. If 0 results with city, fallback to [keyword, state]
    // e.g. "Admiralty, Lagos"
    if (stateKey && stateKey !== cityKey) {
      try {
        const queryWithState = [rawQuery, stateKey].join(", ");
        const url2 = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          queryWithState
        )}&format=json&addressdetails=1&limit=5${countryFilter}`;

        const res2 = await fetch(url2, {
          headers: {
            "User-Agent": "LifelineApp/1.0 (faith-dating-onboarding)",
            Accept: "application/json",
          },
        });

        if (res2.ok) {
          const data2 = await res2.json();
          if (Array.isArray(data2) && data2.length > 0) {
            const suggestions = parseNominatimItems(
              data2,
              countryOfResidence || "",
              stateKey,
              cityKey
            );
            cache.suggestions.set(cacheKey, suggestions);
            return suggestions;
          }
        }
      } catch (err) {
        console.warn("[locationService] Nominatim queryWithState error:", err);
      }
    }

    // 3. Fallback to raw keyword with country filter
    try {
      const url3 = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        rawQuery
      )}&format=json&addressdetails=1&limit=5${countryFilter}`;

      const res3 = await fetch(url3, {
        headers: {
          "User-Agent": "LifelineApp/1.0 (faith-dating-onboarding)",
          Accept: "application/json",
        },
      });

      if (res3.ok) {
        const data3 = await res3.json();
        if (Array.isArray(data3) && data3.length > 0) {
          const suggestions = parseNominatimItems(
            data3,
            countryOfResidence || "",
            stateKey,
            cityKey
          );
          cache.suggestions.set(cacheKey, suggestions);
          return suggestions;
        }
      }
    } catch (err) {
      console.warn("[locationService] Nominatim rawQuery error:", err);
    }

    // 4. Fallback to Photon API with country & state filtering
    try {
      const photonQuery = [rawQuery, cityKey, stateKey].filter(Boolean).join(", ");
      const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(photonQuery)}&limit=5`;
      const response = await fetch(photonUrl, {
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        const json = await response.json();
        if (Array.isArray(json?.features) && json.features.length > 0) {
          let features = json.features;
          if (countryKey) {
            const filteredByCountry = features.filter((f: any) => {
              const c = (f.properties?.country || f.properties?.countrycode || "").toLowerCase();
              return c.includes(countryKey) || (iso2 && c === iso2);
            });
            if (filteredByCountry.length > 0) features = filteredByCountry;
          }

          const suggestions: LocationSuggestion[] = features.map((f: any) => {
            const p = f.properties || {};
            const coords = f.geometry?.coordinates || [0, 0];
            const name = p.name || p.street || rawQuery;
            const city = p.city || p.town || p.district || cityKey || "";
            const state = (p.state || stateKey || "").replace(/\s+State$/i, "");
            const country = p.country || countryOfResidence || "";

            const secondaryParts = [p.street, city, state, country].filter(Boolean);
            const secondaryText = secondaryParts.join(", ");

            return {
              placeId: String(p.osm_id || Math.random()),
              formattedAddress: [name, secondaryText].filter(Boolean).join(", "),
              mainText: name,
              secondaryText,
              streetAddress: name,
              city: city || name,
              state: state || "",
              country: country || "",
              latitude: coords[1],
              longitude: coords[0],
            };
          });

          cache.suggestions.set(cacheKey, suggestions);
          return suggestions;
        }
      }
    } catch (photonErr) {
      console.warn("[locationService] Photon suggestion failed:", photonErr);
    }

    return [];
  },
};

export default locationService;
