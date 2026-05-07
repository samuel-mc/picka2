import { Fragment } from "react";

function SkeletonLine({ className }: { className?: string }) {
  return (
    <div
      className={[
        "relative overflow-hidden rounded-full bg-slate-200/80",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:bg-linear-to-r before:from-transparent before:via-white/70 before:to-transparent",
        "before:animate-[shimmer_1.2s_infinite]",
        className ?? "",
      ].join(" ")}
    />
  );
}

export function AppBootSkeleton() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(237,95,47,0.18),transparent_34%),linear-gradient(180deg,#f7fbff_0%,#eef5fa_55%,#f9fbfd_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <section className="rounded-[2rem] border border-white/70 bg-white/80 px-5 py-4 shadow-[0_14px_40px_rgba(15,76,129,0.08)] backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-slate-200/80" />
            <div className="flex-1 space-y-2">
              <SkeletonLine className="h-4 w-44" />
              <SkeletonLine className="h-3 w-72" />
            </div>
          </div>
        </section>

        <section className="space-y-6">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Fragment key={idx}>
              <article className="overflow-hidden rounded-[1.6rem] border border-white/70 bg-white/90 shadow-[0_18px_55px_rgba(15,76,129,0.10)] backdrop-blur sm:rounded-[2rem]">
                <div className="p-4 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-slate-200/80 sm:h-14 sm:w-14" />
                      <div className="min-w-0 space-y-2">
                        <SkeletonLine className="h-4 w-40" />
                        <SkeletonLine className="h-3 w-28" />
                        <SkeletonLine className="h-3 w-24" />
                      </div>
                    </div>
                    <div className="h-10 w-28 rounded-full bg-slate-200/80" />
                  </div>

                  <div className="mt-5 space-y-3">
                    <SkeletonLine className="h-3 w-full rounded-2xl" />
                    <SkeletonLine className="h-3 w-[92%] rounded-2xl" />
                    <SkeletonLine className="h-3 w-[78%] rounded-2xl" />
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <div className="h-7 w-20 rounded-full bg-slate-200/80" />
                    <div className="h-7 w-24 rounded-full bg-slate-200/80" />
                    <div className="h-7 w-16 rounded-full bg-slate-200/80" />
                  </div>
                </div>

                <footer className="border-t border-slate-100 bg-slate-50/80 px-4 py-4 sm:px-6">
                  <div className="flex justify-between gap-2">
                    <div className="flex gap-2">
                      <div className="h-11 w-20 rounded-full bg-slate-200/80" />
                      <div className="h-11 w-20 rounded-full bg-slate-200/80" />
                      <div className="h-11 w-20 rounded-full bg-slate-200/80" />
                    </div>
                    <div className="flex gap-2">
                      <div className="h-11 w-11 rounded-full bg-slate-200/80" />
                      <div className="h-11 w-11 rounded-full bg-slate-200/80" />
                    </div>
                  </div>
                </footer>
              </article>
            </Fragment>
          ))}
        </section>
      </div>
    </main>
  );
}

