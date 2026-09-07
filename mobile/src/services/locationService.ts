// services/locationService.ts
// Verified Location Service powered by countriesnow.space API with in-memory caching and offline fallback

export interface LocationOption {
  label: string;
  value: string;
}

const API_BASE = "https://countriesnow.space/api/v0.1/countries";

// In-memory caches to prevent redundant network hits
const cache = {
  countries: null as LocationOption[] | null,
  states: new Map<string, LocationOption[]>(),
  cities: new Map<string, LocationOption[]>(),
};

// Fallback Nigerian states in case of network issue
const NIGERIA_STATES_FALLBACK: LocationOption[] = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT Abuja", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
  "Taraba", "Yobe", "Zamfara"
].map((s) => ({ label: s, value: s }));

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

        // Ensure Nigeria is pinned at the top for quick selection
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

    // Default fallback list
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
            // Clean state name (e.g. "Lagos State" -> "Lagos" if needed, or keep clean label)
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

    // If Nigeria, use fallback
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
      // Try both raw state name and with " State" suffix if required by countriesnow
      let response = await fetch(`${API_BASE}/state/cities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country: country.trim(), state: state.trim() }),
      });
      let json = await response.json();

      // If empty and country is Nigeria, retry with " State" suffix
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
};

export default locationService;
