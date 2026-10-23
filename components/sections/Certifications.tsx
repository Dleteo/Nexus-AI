"use client";

import Image from "next/image";
import { useState } from "react";
import { certifications, totalTrainingHours } from "../../data/certifications";
import SectionHeader from "../ui/SectionHeader";

type CertificationFilter = "all" | "Course completion" | "Attendance certificate";

function formatHours(hours: number) {
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)} ${hours === 1 ? "hour" : "hours"}`;
}

function formatTotalHours(hours: number) {
  return Number.isInteger(hours) ? hours.toString() : hours.toFixed(1);
}

export default function Certifications() {
  const [filter, setFilter] = useState<CertificationFilter>("all");
  const courseCompletions = certifications.filter(
    (certification) => certification.credentialType === "Course completion",
  );
  const attendanceCertificates = certifications.filter(
    (certification) => certification.credentialType === "Attendance certificate",
  );
  const filteredCertifications =
    filter === "all"
      ? certifications
      : certifications.filter((certification) => certification.credentialType === filter);

  const filters: { value: CertificationFilter; label: string; count: number }[] = [
    { value: "all", label: "All records", count: certifications.length },
    { value: "Course completion", label: "Course completions", count: courseCompletions.length },
    { value: "Attendance certificate", label: "Attendance certificates", count: attendanceCertificates.length },
  ];

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

        <div className="mx-auto mb-10 grid max-w-5xl gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-5 text-center">
            <p className="text-3xl font-semibold tabular-nums text-white sm:text-4xl">
              {certifications.length}
            </p>
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-gray-400">
              Total records
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-5 text-center">
            <p className="text-3xl font-semibold tabular-nums text-white sm:text-4xl">
              {courseCompletions.length}
            </p>
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-gray-400">
              Course completions
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-5 text-center">
            <p className="text-3xl font-semibold tabular-nums text-white sm:text-4xl">
              {attendanceCertificates.length}
            </p>
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-gray-400">
              Attendance certificates
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.04] px-5 py-5 text-center">
            <p className="text-3xl font-semibold tabular-nums text-cyan-300 sm:text-4xl">
              {formatTotalHours(totalTrainingHours)}
            </p>
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-gray-400">
              Total training hours
            </p>
          </div>
        </div>

        <div className="mb-8 flex flex-col items-center gap-4">
          <div
            role="group"
            aria-label="Filter certificates by record type"
            className="flex flex-wrap justify-center gap-2"
          >
            {filters.map((item) => {
              const selected = filter === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setFilter(item.value)}
                  className={
                    selected
                      ? "rounded-full border border-cyan-300 bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950 transition"
                      : "rounded-full border border-white/15 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:border-cyan-300/50 hover:text-white"
                  }
                >
                  {item.label}
                  <span className={selected ? "ml-2 text-slate-700" : "ml-2 text-gray-500"}>
                    {item.count}
                  </span>
                </button>
              );
            })}
          </div>
          <p aria-live="polite" className="text-xs text-gray-500">
            Showing {filteredCertifications.length} {filteredCertifications.length === 1 ? "record" : "records"}
          </p>
        </div>

        {filteredCertifications.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredCertifications.map((certification) => (
              <article
                key={certification.id}
                className="group overflow-hidden rounded-3xl border border-white/10 bg-[#080d15] transition duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:shadow-[0_20px_70px_-35px_rgba(34,211,238,0.25)]"
              >
                <a
                  href={certification.image}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open certificate image: ${certification.title}`}
                  className="relative block aspect-[4/3] overflow-hidden border-b border-white/10 bg-white/[0.025] p-3"
                >
                  <Image
                    src={certification.image}
                    alt={`Certificate for ${certification.title}`}
                    fill
                    sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-contain p-3 transition duration-500 group-hover:scale-[1.015]"
                  />
                  <span className="absolute left-5 top-5 rounded-full border border-white/10 bg-black/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-cyan-300">
                    {certification.credentialType}
                  </span>
                </a>

                <div className="p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-400">
                      {certification.issuer}
                    </p>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-gray-300">
                      {formatHours(certification.hours)}
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-semibold leading-snug text-white">
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
                      <a
                        href={certification.image}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
                      >
                        Open certificate
                        <span aria-hidden="true">↗</span>
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-gray-400">
            No records match this filter.
          </p>
        )}

        <p className="mt-8 text-center text-xs leading-5 text-gray-500">
          Training durations come from the source certificates. Attendance certificates are identified as such and are not represented as course-completion credentials.
        </p>
      </div>
    </section>
  );
}
