"use client";

import Image from "next/image";
import { useState } from "react";
import { certifications, totalTrainingHours } from "../../data/certifications";
import SectionHeader from "../ui/SectionHeader";

type CertificationFilter = "all" | "Course completion" | "Attendance certificate" | "Training record";

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
  const trainingRecords = certifications.filter(
    (certification) => certification.credentialType === "Training record",
  );
  const filteredCertifications =
    filter === "all"
      ? certifications
      : certifications.filter((certification) => certification.credentialType === filter);

  const filters: { value: CertificationFilter; label: string; count: number }[] = [
    { value: "all", label: "All records", count: certifications.length },
    { value: "Course completion", label: "Course completions", count: courseCompletions.length },
    { value: "Attendance certificate", label: "Attendance certificates", count: attendanceCertificates.length },
    ...(trainingRecords.length > 0 ? [{ value: "Training record" as const, label: "Training records", count: trainingRecords.length }] : []),
  ];

  return (
    <section
      id="certifications"
      className="scroll-mt-24 border-t border-[#34322F] bg-[#171819] px-5 py-16 text-[#F4F1EB] sm:px-8 sm:py-20"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          centered
          label="Continuous learning"
          title="Certifications & Training"
          description="Structured learning in web development, software engineering, AI-assisted development, and cybersecurity. Course hours represent training time, not professional work experience."
        />

        <div className="mx-auto mb-10 grid max-w-5xl gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-[#34322F] bg-[#34322F] px-5 py-5 text-center">
            <p className="text-3xl font-semibold tabular-nums text-[#F4F1EB] sm:text-4xl">
              {certifications.length}
            </p>
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-[#BDB6AB]">
              Total records
            </p>
          </div>

          <div className="rounded-2xl border border-[#34322F] bg-[#34322F] px-5 py-5 text-center">
            <p className="text-3xl font-semibold tabular-nums text-[#F4F1EB] sm:text-4xl">
              {courseCompletions.length}
            </p>
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-[#BDB6AB]">
              Course completions
            </p>
          </div>

          <div className="rounded-2xl border border-[#34322F] bg-[#34322F] px-5 py-5 text-center">
            <p className="text-3xl font-semibold tabular-nums text-[#F4F1EB] sm:text-4xl">
              {attendanceCertificates.length}
            </p>
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-[#BDB6AB]">
              Attendance certificates
            </p>
          </div>

          <div className="rounded-2xl border border-[#4B463D] bg-[#34322F] px-5 py-5 text-center">
            <p className="text-3xl font-semibold tabular-nums text-[#D9B77B] sm:text-4xl">
              {formatTotalHours(totalTrainingHours)}
            </p>
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-[#BDB6AB]">
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
                      ? "rounded-full border border-cyan-300 bg-[#D9B77B] px-4 py-2.5 text-sm font-semibold text-[#F4F1EB] transition"
                      : "rounded-full border border-[#34322F] bg-[#34322F] px-4 py-2.5 text-sm font-medium text-[#E6E1D8] transition hover:border-[#4B463D] hover:text-[#F4F1EB]"
                  }
                >
                  {item.label}
                  <span className={selected ? "ml-2 text-[#AFA89E]" : "ml-2 text-[#BDB6AB]"}>
                    {item.count}
                  </span>
                </button>
              );
            })}
          </div>
          <p aria-live="polite" className="text-xs text-[#BDB6AB]">
            Showing {filteredCertifications.length} {filteredCertifications.length === 1 ? "record" : "records"}
          </p>
        </div>

        {filteredCertifications.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredCertifications.map((certification) => (
              <article
                key={certification.id}
                className="group overflow-hidden rounded-3xl border border-[#34322F] bg-[#1D1E20] transition duration-300 hover:-translate-y-1 hover:border-[#4B463D] hover:shadow-[0_20px_70px_-35px_rgba(119,72,45,0.18)]"
              >
                <a
                  href={certification.image}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open certificate image: ${certification.title}`}
                  className="relative block aspect-[4/3] overflow-hidden border-b border-[#34322F] bg-[#34322F] p-3"
                >
                  <Image
                    src={certification.image}
                    alt={`Certificate for ${certification.title}`}
                    fill
                    sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-contain p-3 transition duration-500 group-hover:scale-[1.015]"
                  />
                  <span className="absolute left-5 top-5 rounded-full border border-[#34322F] bg-[#34322F] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#D9B77B]">
                    {certification.credentialType}
                  </span>
                </a>

                <div className="p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#D9B77B]">
                      {certification.issuer}
                    </p>
                    <span className="rounded-full border border-[#34322F] bg-[#34322F] px-3 py-1 text-xs font-medium text-[#E6E1D8]">
                      {formatHours(certification.hours)}
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-semibold leading-snug text-[#F4F1EB]">
                    {certification.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-[#BDB6AB]">
                    {certification.description}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#BDB6AB]">
                    <span>{certification.date}</span>
                    {certification.instructor ? (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{certification.instructor}</span>
                      </>
                    ) : null}
                  </div>

                  <div className="mt-6 border-t border-[#34322F] pt-4">
                    {certification.credentialUrl ? (
                      <a
                        href={certification.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#D9B77B] transition hover:text-[#F4F1EB] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
                      >
                        Verify credential
                        <span aria-hidden="true">↗</span>
                      </a>
                    ) : (
                      <a
                        href={certification.image}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#D9B77B] transition hover:text-[#F4F1EB] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
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
          <p className="rounded-2xl border border-dashed border-[#34322F] p-10 text-center text-[#BDB6AB]">
            No records match this filter.
          </p>
        )}

        <p className="mt-8 text-center text-xs leading-5 text-[#BDB6AB]">
          Training hours reflect certificate details or information provided by the learner. Training records without verified issuers or dates are labeled transparently and are not presented as course-completion credentials.
        </p>
      </div>
    </section>
  );
}
