export const MENTOR_PLATFORM_CONFIG = {
  emotional: {
    label: "Emotional Mentor",
    domains: [
      { id: "e01", name: "Venting & Immediate Support", section: "Immediate Support" },
      { id: "e02", name: "Stress & Overthinking", section: "Immediate Support" },
      { id: "e03", name: "Confidence & Self-Worth", section: "Self & Identity" },
      { id: "e04", name: "Anxiety & Emotional Burnout", section: "Self & Identity" },
      { id: "e05", name: "Emotional Healing & Inner Child", section: "Self & Identity" },
      { id: "e06", name: "Anger & Emotional Control", section: "Self & Identity" },
      { id: "e07", name: "Grief & Loss", section: "Life Transitions" },
      { id: "e08", name: "Life Transitions & Change", section: "Life Transitions" },
      { id: "e09", name: "Loneliness & Social Anxiety", section: "Life Transitions" },
      { id: "e10", name: "Relationships & Communication", section: "Relationships" },
      { id: "e11", name: "Family Dynamics", section: "Relationships" },
      { id: "e12", name: "Romantic Relationships & Heartbreak", section: "Relationships" },
      { id: "e13", name: "Workplace Stress & Conflict", section: "Work & Career" },
      { id: "e14", name: "Burnout & Recovery", section: "Work & Career" },
      { id: "e15", name: "Career Anxiety & Imposter Syndrome", section: "Work & Career" },
      { id: "e16", name: "Student & Academic Pressure", section: "Work & Career" },
      { id: "e17", name: "Purpose & Meaning", section: "Deeper Work" },
      { id: "e18", name: "Identity & Self-Discovery", section: "Deeper Work" },
      { id: "e19", name: "Trauma-Informed Support", section: "Deeper Work" },
      { id: "e20", name: "Emotional Regulation & Mindfulness", section: "Deeper Work" },
      { id: "e21", name: "Life Coaching", section: "Coaching" },
      { id: "e22", name: "Relationship Coaching", section: "Coaching" },
    ],
  },
  professional: {
    label: "Professional Mentor",
    domains: [
      { id: "p-early", name: "Early Career Mentor", section: "The Bedrock" },
      { id: "p11", name: "Communication & Public Speaking", section: "The Bedrock" },
      { id: "p12", name: "Product & Tech Career Mentor", section: "The Bedrock" },
      { id: "p-health", name: "Health & Lifestyle Mentor", section: "The Bedrock" },
      { id: "p06", name: "Startup & Entrepreneurship Mentor", section: "The Catalyst" },
      { id: "p01", name: "Career Transition Coach", section: "The Catalyst" },
      { id: "p02", name: "HR & Workplace Mentor", section: "The Catalyst" },
      { id: "p-freelance", name: "Freelancer & Creator Mentor", section: "The Catalyst" },
      { id: "p05", name: "Executive & Leadership Coach", section: "The Summit" },
      { id: "p05-sr", name: "Executive & Leadership Coach (Sr.)", section: "The Summit" },
      { id: "p-women-lead", name: "Women Leadership Coach", section: "The Summit" },
      { id: "p-women-work", name: "Women in Workforce Mentor", section: "The Summit" },
      { id: "p03", name: "CA / Financial Clarity Mentor", section: "Specialized Guidance" },
      { id: "p04", name: "Legal Clarity Mentor", section: "Specialized Guidance" },
      { id: "p-parent", name: "Parenting & Family Mentor", section: "Specialized Guidance" },
      { id: "p09", name: "Study Abroad & Academic Mentor", section: "Specialized Guidance" },
      { id: "p-corp", name: "Corporate Performance Mentor", section: "Specialized Guidance" },
    ],
  },
};

export function getMentorDomainsForType(mentorType) {
  return MENTOR_PLATFORM_CONFIG[mentorType]?.domains || [];
}

export function resolveMentorDomain(mentorType, domainId) {
  return getMentorDomainsForType(mentorType).find((d) => d.id === domainId) || null;
}

export function resolveMentorDomains(mentorType, domainIds = []) {
  const ids = Array.isArray(domainIds) ? domainIds : [domainIds].filter(Boolean);
  return ids
    .map((id) => resolveMentorDomain(mentorType, id))
    .filter(Boolean);
}

export function groupDomainsBySection(domains) {
  return domains.reduce((acc, domain) => {
    const section = domain.section || "Other";
    if (!acc[section]) acc[section] = [];
    acc[section].push(domain);
    return acc;
  }, {});
}
