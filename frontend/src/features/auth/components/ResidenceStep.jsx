import React, { useState, useEffect, useRef } from 'react';
import Input from '../../../components/Input';

const API_BASE = 'https://countriesnow.space/api/v0.1/countries';

const COUNTRY_TO_ISO2 = {
    nigeria: 'ng',
    ghana: 'gh',
    'united states': 'us',
    'united kingdom': 'gb',
    canada: 'ca',
    'south africa': 'za',
    kenya: 'ke',
    uganda: 'ug',
    rwanda: 'rw',
    germany: 'de',
    france: 'fr',
    ireland: 'ie',
    australia: 'au',
};

const ResidenceStep = ({ data, onChange, errors = {} }) => {
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState({ countries: false, states: false, cities: false });

    // Real-time location suggestions
    const [addressQuery, setAddressQuery] = useState(data.residenceAddress || '');
    const [suggestions, setSuggestions] = useState([]);
    const [isSearchingLocation, setIsSearchingLocation] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const debounceTimer = useRef(null);

    useEffect(() => {
        setLoading(prev => ({ ...prev, countries: true }));
        fetch(`${API_BASE}/info?returns=none`)
            .then(res => res.json())
            .then(res => {
                const countryOptions = res.data
                    .map(c => ({ label: c.name, value: c.name }))
                    .sort((a, b) => a.label.localeCompare(b.label));

                const ngIdx = countryOptions.findIndex(c => c.value.toLowerCase() === 'nigeria');
                if (ngIdx > -1) {
                    const [ng] = countryOptions.splice(ngIdx, 1);
                    countryOptions.unshift(ng);
                }

                setCountries(countryOptions);
            })
            .catch(err => console.error('Error fetching countries:', err))
            .finally(() => setLoading(prev => ({ ...prev, countries: false })));
    }, []);

    useEffect(() => {
        if (data.residenceCountry) {
            setLoading(prev => ({ ...prev, states: true }));
            fetch(`${API_BASE}/states`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ country: data.residenceCountry })
            })
                .then(res => res.json())
                .then(res => {
                    const stateOptions = (res.data?.states || [])
                        .map(s => {
                            const clean = s.name.replace(/\s+State$/i, '');
                            return { label: clean, value: clean };
                        })
                        .sort((a, b) => a.label.localeCompare(b.label));
                    setStates(stateOptions);
                })
                .catch(err => console.error('Error fetching states:', err))
                .finally(() => setLoading(prev => ({ ...prev, states: false })));
        } else {
            setStates([]);
        }
        if (!data.sameAsOrigin && data.residenceState) onChange({ target: { name: 'residenceState', value: '' } });
    }, [data.residenceCountry]);

    useEffect(() => {
        if (data.residenceCountry && data.residenceState) {
            setLoading(prev => ({ ...prev, cities: true }));
            fetch(`${API_BASE}/state/cities`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ country: data.residenceCountry, state: data.residenceState })
            })
                .then(res => res.json())
                .then(res => {
                    const cityOptions = (res.data || [])
                        .map(city => ({ label: city, value: city }))
                        .sort((a, b) => a.label.localeCompare(b.label));
                    setCities(cityOptions);
                })
                .catch(err => console.error('Error fetching cities:', err))
                .finally(() => setLoading(prev => ({ ...prev, cities: false })));
        } else {
            setCities([]);
        }
        if (!data.sameAsOrigin && data.residenceCity) onChange({ target: { name: 'residenceCity', value: '' } });
    }, [data.residenceCountry, data.residenceState]);

    // Handle address autocomplete query
    const handleAddressChange = (e) => {
        const val = e.target.value;
        setAddressQuery(val);
        onChange({ target: { name: 'residenceAddress', value: val } });

        if (!val || val.trim().length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        debounceTimer.current = setTimeout(async () => {
            setIsSearchingLocation(true);
            try {
                const countryKey = (data.residenceCountry || '').toLowerCase().trim();
                const iso2 = COUNTRY_TO_ISO2[countryKey] || (countryKey.length === 2 ? countryKey : '');
                const countryFilter = iso2 ? `&countrycodes=${encodeURIComponent(iso2)}` : '';

                // Scope query by city and state if selected: e.g. "Admiralty, Lekki, Lagos"
                const scopedQuery = [val, data.residenceCity, data.residenceState]
                    .filter((part, idx, arr) => part && arr.indexOf(part) === idx)
                    .join(', ');

                let url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(scopedQuery)}&format=json&addressdetails=1&limit=5${countryFilter}`;

                let res = await fetch(url, {
                    headers: { 'User-Agent': 'LifelineWeb/1.0', Accept: 'application/json' },
                });

                let items = [];
                if (res.ok) {
                    items = await res.json();
                }

                // If 0 results with city/state, fallback to raw query with country filter
                if ((!items || items.length === 0) && (data.residenceCity || data.residenceState)) {
                    url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&format=json&addressdetails=1&limit=5${countryFilter}`;
                    res = await fetch(url, {
                        headers: { 'User-Agent': 'LifelineWeb/1.0', Accept: 'application/json' },
                    });
                    if (res.ok) items = await res.json();
                }

                if (Array.isArray(items)) {
                    setSuggestions(items);
                    setShowSuggestions(items.length > 0);
                }
            } catch (err) {
                console.warn('Location suggestion fetch failed:', err);
            } finally {
                setIsSearchingLocation(false);
            }
        }, 350);
    };

    const handleSelectSuggestion = (item) => {
        const addr = item.address || {};
        const street = addr.road || addr.pedestrian || addr.building || item.display_name.split(',')[0];
        const city = addr.city || addr.town || addr.village || addr.suburb || addr.county || '';
        const state = (addr.state || '').replace(/\s+State$/i, '');

        setAddressQuery(street);
        onChange({ target: { name: 'residenceAddress', value: street } });
        if (state && !data.residenceState) {
            onChange({ target: { name: 'residenceState', value: state } });
        }
        if (city && !data.residenceCity) {
            onChange({ target: { name: 'residenceCity', value: city } });
        }

        setShowSuggestions(false);
        setSuggestions([]);
    };

    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Current Base</h2>
                <p className="text-slate-500">Where can we find you if we send 🍕? (We probably won't, though.)</p>
            </div>

            <div className="flex items-center gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 mb-2">
                <input
                    type="checkbox"
                    id="sameAsOrigin"
                    name="sameAsOrigin"
                    checked={data.sameAsOrigin}
                    onChange={onChange}
                    className="w-5 h-5 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="sameAsOrigin" className="text-sm font-semibold text-blue-900 cursor-pointer">
                    Same as Place of Origin
                </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    label={loading.countries ? "Loading Countries..." : "Country of Residence"}
                    type="select"
                    name="residenceCountry"
                    value={data.residenceCountry}
                    onChange={onChange}
                    options={countries}
                    disabled={data.sameAsOrigin || loading.countries}
                    error={errors.residenceCountry}
                />
                <Input
                    label={loading.states ? "Loading States..." : "State of Residence"}
                    type="select"
                    name="residenceState"
                    value={data.residenceState}
                    onChange={onChange}
                    options={states}
                    disabled={data.sameAsOrigin || !data.residenceCountry || loading.states}
                    error={errors.residenceState}
                />
            </div>

            <Input
                label={loading.cities ? "Loading Cities..." : "City of Residence"}
                type="select"
                name="residenceCity"
                value={data.residenceCity}
                onChange={onChange}
                options={cities}
                disabled={data.sameAsOrigin || !data.residenceState || loading.cities}
                error={errors.residenceCity}
            />

            {/* House Address with Location Keyword Suggestions */}
            <div className="relative">
                <Input
                    label={
                        <span className="flex items-center justify-between">
                            <span>House Address / Location</span>
                            {(data.residenceCity || data.residenceState || data.residenceCountry) && (
                                <span className="text-xs text-blue-600 font-medium">
                                    Scoped to: {[data.residenceCity, data.residenceState, data.residenceCountry].filter(Boolean).join(', ')}
                                </span>
                            )}
                        </span>
                    }
                    name="residenceAddress"
                    value={addressQuery}
                    onChange={handleAddressChange}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    placeholder="Type street, landmark, or area (e.g. Admiralty Way)..."
                    error={errors.residenceAddress}
                />

                {isSearchingLocation && (
                    <div className="absolute right-3 top-10 text-xs text-slate-400 animate-pulse">
                        Searching...
                    </div>
                )}

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                        <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs font-semibold uppercase text-slate-400">
                            <span>
                                Verified Places ({[data.residenceCity, data.residenceState, data.residenceCountry].filter(Boolean).join(', ') || 'Global'})
                            </span>
                            <button
                                type="button"
                                onClick={() => setShowSuggestions(false)}
                                className="text-blue-600 hover:text-blue-800"
                            >
                                Close
                            </button>
                        </div>
                        <ul className="max-h-56 overflow-y-auto divide-y divide-slate-100">
                            {suggestions.map((item, idx) => (
                                <li
                                    key={`${item.place_id}_${idx}`}
                                    onClick={() => handleSelectSuggestion(item)}
                                    className="p-3 hover:bg-blue-50/60 cursor-pointer text-left transition-colors"
                                >
                                    <div className="font-semibold text-sm text-slate-800">
                                        {item.display_name.split(',')[0]}
                                    </div>
                                    <div className="text-xs text-slate-400 truncate">
                                        {item.display_name}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResidenceStep;
