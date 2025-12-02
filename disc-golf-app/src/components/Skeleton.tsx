interface SkeletonProps {
  className?: string;
}

// Base skeleton with shimmer effect
export const Skeleton = ({ className = '' }: SkeletonProps) => (
  <div className={`animate-shimmer rounded-xl ${className}`} />
);

// Text line skeleton
export const SkeletonText = ({ className = '' }: SkeletonProps) => (
  <div className={`animate-shimmer rounded h-4 ${className}`} />
);

// Circle skeleton for avatars/icons
export const SkeletonCircle = ({ className = '' }: SkeletonProps) => (
  <div className={`animate-shimmer rounded-full ${className}`} />
);

// Card skeleton matching the app's card style
export const SkeletonCard = ({ className = '' }: SkeletonProps) => (
  <div className={`bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 ${className}`}>
    <div className="flex items-center space-x-4">
      <SkeletonCircle className="w-12 h-12" />
      <div className="flex-1 space-y-2">
        <SkeletonText className="w-3/4" />
        <SkeletonText className="w-1/2" />
      </div>
    </div>
  </div>
);

// Stat card skeleton for dashboard
export const SkeletonStatCard = ({ className = '' }: SkeletonProps) => (
  <div className={`bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 ${className}`}>
    <div className="flex items-center justify-between mb-4">
      <SkeletonCircle className="w-12 h-12" />
      <Skeleton className="w-16 h-8" />
    </div>
    <SkeletonText className="w-24" />
  </div>
);

// Event card skeleton
export const SkeletonEventCard = ({ className = '' }: SkeletonProps) => (
  <div className={`bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden ${className}`}>
    {/* Image placeholder */}
    <Skeleton className="h-32 sm:h-40 rounded-none" />
    {/* Content */}
    <div className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-1.5">
            <SkeletonCircle className="w-4 h-4" />
            <SkeletonText className="w-24" />
          </div>
          <div className="flex items-center space-x-1.5">
            <SkeletonCircle className="w-4 h-4" />
            <SkeletonText className="w-16" />
          </div>
        </div>
        <SkeletonText className="w-20" />
      </div>
    </div>
  </div>
);

// Leaderboard row skeleton
export const SkeletonLeaderboardRow = ({ className = '' }: SkeletonProps) => (
  <div className={`flex items-center py-4 px-6 border-b border-gray-100 dark:border-slate-700 ${className}`}>
    <div className="w-16">
      <SkeletonCircle className="w-5 h-5" />
    </div>
    <div className="flex items-center space-x-3 flex-1">
      <SkeletonCircle className="w-10 h-10" />
      <div className="space-y-2">
        <SkeletonText className="w-32" />
        <SkeletonText className="w-20" />
      </div>
    </div>
    <SkeletonText className="w-12 mx-4" />
    <SkeletonText className="w-12 mx-4" />
    <Skeleton className="w-16 h-8" />
  </div>
);

// Scorecard list item skeleton
export const SkeletonScorecardItem = ({ className = '' }: SkeletonProps) => (
  <div className={`bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 ${className}`}>
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Skeleton className="w-14 h-14 rounded-2xl" />
        <div className="space-y-2">
          <SkeletonText className="w-40" />
          <SkeletonText className="w-28" />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-right space-y-1">
          <Skeleton className="w-12 h-8" />
          <SkeletonText className="w-10" />
        </div>
        <SkeletonCircle className="w-5 h-5" />
      </div>
    </div>
  </div>
);

// Dashboard hero skeleton
export const SkeletonHero = ({ className = '' }: SkeletonProps) => (
  <div className={`rounded-3xl bg-gradient-to-r from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-600 p-8 md:p-12 ${className}`}>
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <SkeletonCircle className="w-6 h-6" />
        <SkeletonText className="w-24" />
      </div>
      <Skeleton className="h-12 w-3/4 max-w-md" />
      <SkeletonText className="w-1/2 max-w-xs" />
    </div>
  </div>
);

// Content card skeleton (for dashboard sidebar cards)
export const SkeletonContentCard = ({ className = '' }: SkeletonProps) => (
  <div className={`bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 ${className}`}>
    {/* Header */}
    <div className="p-6 border-b border-gray-100 dark:border-slate-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <SkeletonCircle className="w-9 h-9" />
          <SkeletonText className="w-32" />
        </div>
        <SkeletonText className="w-16" />
      </div>
    </div>
    {/* Content */}
    <div className="p-6 space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="p-4 rounded-xl border border-gray-100 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div className="flex-1 space-y-2">
              <SkeletonText className="w-3/4" />
              <SkeletonText className="w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default Skeleton;

