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
    { value: "Training record", label: "Training records", count: trainingRecords.length },
  ];

  return (
    <section
      id="certifications"
      className="scroll-mt-24 border-t border-[#E9D9CC] bg-[#FFF8F2] px-5 py-16 text-[#302923] sm:px-8 sm:py-20"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          centered
          label="Continuous learning"
          title="Certifications & Training"
          description="Structured learning in web development, software engineering, AI-assisted development, and cybersecurity. Course hours represent training time, not professional work experience."
        />

        <div className="mx-auto mb-10 grid max-w-5xl gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-[#E9D9CC] bg-[#FFF2E8] px-5 py-5 text-center">
            <p className="text-3xl font-semibold tabular-nums text-[#302923] sm:text-4xl">
              {certifications.length}
            </p>
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-[#756155]">
              Total records
            </p>
          </div>

          <div className="rounded-2xl border border-[#E9D9CC] bg-[#FFF2E8] px-5 py-5 text-center">
            <p className="text-3xl font-semibold tabular-nums text-[#302923] sm:text-4xl">
              {courseCompletions.length}
            </p>
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-[#756155]">
              Course completions
            </p>
          </div>

          <div className="rounded-2xl border border-[#E9D9CC] bg-[#FFF2E8] px-5 py-5 text-center">
            <p className="text-3xl font-semibold tabular-nums text-[#302923] sm:text-4xl">
              {attendanceCertificates.length}
            </p>
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-[#756155]">
              Attendance certificates
            </p>
          </div>

          <div className="rounded-2xl border border-[#E6BDA7] bg-[#FBE3D3] px-5 py-5 text-center">
            <p className="text-3xl font-semibold tabular-nums text-[#AD5637] sm:text-4xl">
              {formatTotalHours(totalTrainingHours)}
            </p>
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-[#756155]">
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
                      ? "rounded-full border border-cyan-300 bg-[#C97955] px-4 py-2.5 text-sm font-semibold text-[#302923] transition"
                      : "rounded-full border border-[#E9D9CC] bg-[#FFF2E8] px-4 py-2.5 text-sm font-medium text-[#40342E] transition hover:border-[#E6BDA7] hover:text-[#302923]"
                  }
                >
                  {item.label}
                  <span className={selected ? "ml-2 text-[#816B5E]" : "ml-2 text-[#756155]"}>
                    {item.count}
                  </span>
                </button>
              );
            })}
          </div>
          <p aria-live="polite" className="text-xs text-[#756155]">
            Showing {filteredCertifications.length} {filteredCertifications.length === 1 ? "record" : "records"}
          </p>
        </div>

        {filteredCertifications.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredCertifications.map((certification) => (
              <article
                key={certification.id}
                className="group overflow-hidden rounded-3xl border border-[#E9D9CC] bg-[#FFFCF8] transition duration-300 hover:-translate-y-1 hover:border-[#E6BDA7] hover:shadow-[0_20px_70px_-35px_rgba(34,211,238,0.25)]"
              >
                <a
                  href={certification.image}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open certificate image: ${certification.title}`}
                  className="relative block aspect-[4/3] overflow-hidden border-b border-[#E9D9CC] bg-[#FFF2E8] p-3"
                >
                  <Image
                    src={certification.image}
                    alt={`Certificate for ${certification.title}`}
                    fill
                    sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-contain p-3 transition duration-500 group-hover:scale-[1.015]"
                  />
                  <span className="absolute left-5 top-5 rounded-full border border-[#E9D9CC] bg-[#F8EEE6] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#AD5637]">
                    {certification.credentialType}
                  </span>
                </a>

                <div className="p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#AD5637]">
                      {certification.issuer}
                    </p>
                    <span className="rounded-full border border-[#E9D9CC] bg-[#FFF2E8] px-3 py-1 text-xs font-medium text-[#40342E]">
                      {formatHours(certification.hours)}
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-semibold leading-snug text-[#302923]">
                    {certification.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-[#756155]">
                    {certification.description}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#756155]">
                    <span>{certification.date}</span>
                    {certification.instructor ? (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{certification.instructor}</span>
                      </>
                    ) : null}
                  </div>

                  <div className="mt-6 border-t border-[#E9D9CC] pt-4">
                    {certification.credentialUrl ? (
                      <a
                        href={certification.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#AD5637] transition hover:text-[#302923] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
                      >
                        Verify credential
                        <span aria-hidden="true">↗</span>
                      </a>
                    ) : (
                      <a
                        href={certification.image}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#AD5637] transition hover:text-[#302923] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
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
          <p className="rounded-2xl border border-dashed border-[#E9D9CC] p-10 text-center text-[#756155]">
            No records match this filter.
          </p>
        )}

        <p className="mt-8 text-center text-xs leading-5 text-[#756155]">
          Training hours reflect certificate details or information provided by the learner. Training records without verified issuers or dates are labeled transparently and are not presented as course-completion credentials.
        </p>
      </div>
    </section>
  );
}
