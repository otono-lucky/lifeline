import React, { useState, useEffect } from "react";
import Input from "../../../components/Input";
import { churchService } from "../../../api/services";

// Mock API for churches (to be replaced by church onboarding feature later)

const ChurchStep = ({ data, onChange, errors = {}, setErrors }) => {
  const [churches, setChurches] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchChurches = async () => {
    try {
      setLoading(true);

      const res = await churchService.getPublicChurches();

      if (!res.success) {
        setChurches([]);
        return;
      }

      const formattedChurches = res.data?.churches?.map((church) => ({
        value: church.id,
        label: church.officialName,
      }));

      const sortedChurches = formattedChurches.sort((a, b) =>
        a.label.localeCompare(b.label),
      );

      setChurches(sortedChurches);
    } catch (error) {
      console.error("Error fetching churches:", error);

      if (setErrors) {
        setErrors((prev) => ({
          ...prev,
          churchId: "Failed to load churches. Please try again.",
        }));
    }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChurches().then(() => console.log("Fetched churches"));
  }, []);

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
          Find Your Tribe
        </h2>
        <p className="text-slate-500">
          Where’s your spiritual home base on Sundays?
        </p>
      </div>

      <div className="space-y-4">
        <Input
          label={loading ? "Loading Churches..." : "Select your Church"}
          type="select"
          name="churchId"
          value={data.churchId}
          disabled={loading}
          onChange={onChange}
          options={churches}
          error={errors.churchId}
        />
        <p className="text-sm text-slate-500 mt-2 italic">
          We use this to connect you with verified members of your church
          community.
        </p>
      </div>

      <div className="pt-6 border-t border-slate-100">
        <label className="text-sm font-semibold text-slate-700 ml-1">
          Matching Preference
        </label>
        <p className="text-xs text-slate-400 ml-1 mb-4">
          Who would you like to meet?
        </p>

        <div className="space-y-3">
          {[
            {
              id: "my_church",
              label: "My Church Only",
              sub: "Loyalty Level: Expert 🛡️",
            },
            {
              id: "my_church_plus",
              label: "My Church & Others",
              sub: "I'm an equal opportunity believer 🤝",
            },
            {
              id: "other_churches",
              label: "Other Churches Only",
              sub: "A fresh spiritual start ✨",
            },
          ].map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() =>
                onChange({
                  target: { name: "matchPreference", value: option.id },
                })
              }
              className={`w-full p-4 rounded-2xl border text-left transition-all duration-200 group ${
                data.matchPreference === option.id
                  ? "border-blue-600 bg-blue-50 ring-2 ring-blue-500/10"
                  : errors.matchPreference
                    ? "border-red-200 bg-red-50/20"
                    : "border-slate-100 bg-white hover:border-blue-300 hover:bg-slate-50/50"
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4
                    className={`text-sm font-bold ${
                      data.matchPreference === option.id
                        ? "text-blue-900"
                        : "text-slate-700"
                    }`}
                  >
                    {option.label}
                  </h4>
                  <p
                    className={`text-xs ${
                      data.matchPreference === option.id
                        ? "text-blue-600"
                        : "text-slate-400"
                    }`}
                  >
                    {option.sub}
                  </p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    data.matchPreference === option.id
                      ? "border-blue-600 bg-blue-600"
                      : errors.matchPreference
                        ? "border-red-300 bg-white"
                        : "border-slate-200 bg-white"
                  }`}
                >
                  {data.matchPreference === option.id && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              </div>
            </button>
          ))}
          {errors.matchPreference && (
            <p className="text-xs text-red-500 ml-1">
              {errors.matchPreference}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChurchStep;
