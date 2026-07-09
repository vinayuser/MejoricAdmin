import React, { useMemo } from "react";
import {
  getMentorDomainsForType,
  groupDomainsBySection,
} from "../../data/mentorPlatformConfig";

export default function MentorCategorySelect({
  mentorType,
  selected = [],
  onToggle,
  error,
}) {
  const sections = useMemo(() => {
    const domains = getMentorDomainsForType(mentorType);
    return Object.entries(groupDomainsBySection(domains));
  }, [mentorType]);

  if (!mentorType) {
    return (
      <p className="text-sm text-gray-500">Select mentor type first to see categories.</p>
    );
  }

  return (
    <div>
      {sections.map(([section, domains]) => (
        <div key={section} className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
            {section}
          </p>
          <div className="flex flex-wrap gap-2">
            {domains.map((domain) => {
              const isActive = selected.includes(domain.id);
              return (
                <button
                  key={domain.id}
                  type="button"
                  onClick={() => onToggle(domain.id)}
                  className={`px-3 py-2 rounded-lg border text-sm transition-all text-left ${
                    isActive
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-white text-gray-700 border-gray-300 hover:border-purple-400"
                  }`}
                >
                  {domain.name}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {selected.length > 0 && (
        <p className="text-xs text-gray-500 mt-2">
          {selected.length} categor{selected.length === 1 ? "y" : "ies"} selected
        </p>
      )}

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
