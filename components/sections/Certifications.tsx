import { certifications, totalTrainingHours } from "../../data/certifications";
import SectionHeader from "../ui/SectionHeader";

function formatHours(hours: number) {
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)} ${hours === 1 ? "hour" : "hours"}`;
}

export default function Certifications() {
  const formattedTotalHours = Number.isInteger(totalTrainingHours)
    ? totalTrainingHours.toString()
    : totalTrainingHours.toFixed(1);

  return (
    <section
      id="certifications"
      className="scroll-mt-20 border-y border-white/5 bg-gradient-to-b from-slate-950/70 via-black to-black px-6 py-24 text-white"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          centered
          label="Continuous learning"
          title="Certifications & Training"
          description="Structured learning in web development, software engineering, and AI-assisted development. Course hours represent training time, not professional work experience."
        />

        <div className="mx-auto mb-12 grid max-w-3xl gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5 text-center">
            <p className="text-3xl font-semibold tabular-nums text-white sm:text-4xl">
              {certifications.length}
            </p>
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.18em] text-gray-400">
              Certificates and completions
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.04] px-6 py-5 text-center">
            <p className="text-3xl font-semibold tabular-nums text-cyan-300 sm:text-4xl">
              {formattedTotalHours}
            </p>
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.18em] text-gray-400">
              Total training hours
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {certifications.map((certification, index) => (
            <article
              key={certification.id}
              className="group overflow-hidden rounded-3xl border border-white/10 bg-[#080d15] transition duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:shadow-[0_20px_70px_-35px_rgba(34,211,238,0.25)]"
            >
              <div className="relative flex min-h-52 flex-col justify-between overflow-hidden border-b border-white/10 bg-gradient-to-br from-slate-900 via-[#090f1a] to-black p-6 sm:min-h-56">
                <div
                  aria-hidden="true"
                  className="absolute -right-12 -top-16 h-48 w-48 rounded-full border border-cyan-400/10"
                />
                <div
                  aria-hidden="true"
                  className="absolute -right-5 -top-9 h-32 w-32 rounded-full border border-cyan-400/10"
                />

                <div className="relative flex items-center justify-between gap-3">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
                    Learning record
                  </span>
                  <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-gray-300">
                    {certification.credentialType}
                  </span>
                </div>

                <div className="relative mt-7">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-gray-500">
                    {certification.issuer}
                  </p>
                  <div className="mt-3 flex items-end justify-between gap-4">
                    <p className="max-w-xs text-2xl font-semibold tracking-tight text-white">
                      {String(index + 1).padStart(2, "0")}
                      <span className="ml-2 text-base font-normal text-gray-400">
                        / {String(certifications.length).padStart(2, "0")}
                      </span>
                    </p>
                    <span className="text-right text-sm font-medium text-cyan-200">
                      {formatHours(certification.hours)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-semibold leading-snug text-white">
                  {certification.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-gray-400">
                  {certification.description}
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                  <span>{certification.date}</span>
                  {certification.instructor ? (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{certification.instructor}</span>
                    </>
                  ) : null}
                </div>

                <div className="mt-6 border-t border-white/10 pt-4">
                  {certification.credentialUrl ? (
                    <a
                      href={certification.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
                    >
                      Verify credential
                      <span aria-hidden="true">↗</span>
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-500">
                      <span aria-hidden="true">◆</span>
                      Certificate of attendance
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-8 text-center text-xs leading-5 text-gray-500">
          Training durations come from the source certificates. Attendance certificates are identified as such and are not represented as course-completion credentials.
        </p>
      </div>
    </section>
  );
}
