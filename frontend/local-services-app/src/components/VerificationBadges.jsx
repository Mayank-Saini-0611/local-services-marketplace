import {
  BadgeCheck,
  Building2,
  IdCard,
  MailCheck,
  Phone,
  ShieldCheck,
  Star,
  UserCheck,
} from 'lucide-react';

const BADGE_DEFINITIONS = [
  {
    key: 'identityVerified',
    label: 'Identity verified',
    shortLabel: 'Identity',
    description: 'The provider submitted identity documents approved by an administrator.',
    icon: IdCard,
    classes: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800',
  },
  {
    key: 'emailVerified',
    label: 'Email verified',
    shortLabel: 'Email',
    description: 'The provider confirmed their email address.',
    icon: MailCheck,
    classes: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-300 dark:border-violet-800',
  },
  {
    key: 'phoneVerified',
    label: 'Phone verified',
    shortLabel: 'Phone',
    description: 'An administrator confirmed the provider phone number.',
    icon: Phone,
    classes: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-800',
  },
  {
    key: 'backgroundChecked',
    label: 'Background checked',
    shortLabel: 'Background',
    description: 'An administrator completed a background check for this provider.',
    icon: ShieldCheck,
    classes: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800',
  },
  {
    key: 'businessVerified',
    label: 'Business verified',
    shortLabel: 'Business',
    description: 'An administrator verified the provider business information.',
    icon: Building2,
    classes: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-300 dark:border-orange-800',
  },
  {
    key: 'topRated',
    label: 'Top rated',
    shortLabel: 'Top rated',
    description: 'At least three published reviews with an average rating of 4.5 or higher.',
    icon: Star,
    classes: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-300 dark:border-yellow-800',
  },
  {
    key: 'reliable',
    label: 'Reliable provider',
    shortLabel: 'Reliable',
    description: 'At least three completed jobs and an 80% or higher completion rate.',
    icon: UserCheck,
    classes: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/30 dark:text-teal-300 dark:border-teal-800',
  },
];

function getVerification(verification, legacyKycStatus) {
  return {
    ...(verification || {}),
    identityVerified: verification?.identityVerified ?? legacyKycStatus === 'verified',
  };
}

function VerificationBadges({ verification, legacyKycStatus, compact = false, className = '' }) {
  const normalized = getVerification(verification, legacyKycStatus);
  const visibleBadges = BADGE_DEFINITIONS.filter((badge) => normalized[badge.key]);

  if (visibleBadges.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`} aria-label="Provider verification badges">
      {visibleBadges.map(({ key, label, shortLabel, description, icon: Icon, classes }) => (
        <span
          key={key}
          title={`${label}: ${description}`}
          aria-label={`${label}. ${description}`}
          className={`inline-flex items-center gap-1 border rounded-full font-semibold ${classes} ${
            compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
          }`}
        >
          <Icon className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} aria-hidden="true" />
          {compact ? shortLabel : label}
        </span>
      ))}
      {normalized.isVerified && !normalized.identityVerified && (
        <span className="sr-only">
          <BadgeCheck aria-hidden="true" /> Verified provider
        </span>
      )}
    </div>
  );
}

export default VerificationBadges;
