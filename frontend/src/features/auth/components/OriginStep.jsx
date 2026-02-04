import React, { useState, useEffect } from 'react';
import Input from '../../../components/Input';

const API_BASE = 'https://countriesnow.space/api/v0.1/countries';

const OriginStep = ({ data, onChange, errors = {} }) => {
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
        if (data.originCountry) {
            setLoading(prev => ({ ...prev, states: true }));
            fetch(`${API_BASE}/states`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ country: data.originCountry })
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
        if (data.originState) onChange({ target: { name: 'originState', value: '' } });
        if (data.originLga) onChange({ target: { name: 'originLga', value: '' } });
    }, [data.originCountry]);

    useEffect(() => {
        if (data.originCountry && data.originState) {
            setLoading(prev => ({ ...prev, cities: true }));
            fetch(`${API_BASE}/state/cities`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ country: data.originCountry, state: data.originState })
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
        if (data.originLga) onChange({ target: { name: 'originLga', value: '' } });
    }, [data.originCountry, data.originState]);

    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-slate-900 mb-2">The Origin Story</h2>
                <p className="text-slate-500">Every hero has a beginning. Where did your legend start?</p>
            </div>

            <Input
                label={loading.countries ? "Loading Countries..." : "Country of Origin"}
                type="select"
                name="originCountry"
                value={data.originCountry}
                onChange={onChange}
                options={countries}
                disabled={loading.countries}
                error={errors.originCountry}
            />
            <Input
                label={loading.states ? "Loading States..." : "State of Origin"}
                type="select"
                name="originState"
                value={data.originState}
                onChange={onChange}
                options={states}
                disabled={!data.originCountry || loading.states}
                error={errors.originState}
            />
            <Input
                label={loading.cities ? "Loading Cities/LGAs..." : "City/LGA of Origin"}
                type="select"
                name="originLga"
                value={data.originLga}
                onChange={onChange}
                options={cities}
                disabled={!data.originState || loading.cities}
                error={errors.originLga}
            />
        </div>
    );
};

export default OriginStep;
