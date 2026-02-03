import React, { useState, useEffect } from 'react';
import Input from '../../../components/Input';

const API_BASE = 'https://countriesnow.space/api/v0.1/countries';

const ResidenceStep = ({ data, onChange, errors = {} }) => {
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState({ countries: false, states: false, cities: false });

    useEffect(() => {
        setLoading(prev => ({ ...prev, countries: true }));
        fetch(`${API_BASE}/info?returns=none`)
            .then(res => res.json())
            .then(res => {
                const countryOptions = res.data
                    .map(c => ({ label: c.name, value: c.name }))
                    .sort((a, b) => a.label.localeCompare(b.label));
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
                    const stateOptions = res.data.states
                        .map(s => ({ label: s.name, value: s.name }))
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
                    const cityOptions = res.data
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

            <Input
                label="House Address"
                name="residenceAddress"
                value={data.residenceAddress}
                onChange={onChange}
                placeholder="No. 123, Faith Avenue..."
                error={errors.residenceAddress}
            />
        </div>
    );
};

export default ResidenceStep;
