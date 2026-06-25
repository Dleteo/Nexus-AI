type SectionHeaderProps = {
  label: string;
  title: string;
  description: string;
  centered?: boolean;
};

export default function SectionHeader({
  label,
  title,
  description,
  centered = false,
}: SectionHeaderProps) {
  const wrapperClassName = centered
    ? "mb-14 text-center"
    : "mb-14 max-w-2xl";

  const descriptionClassName = centered
    ? "mx-auto mt-5 max-w-2xl text-lg text-gray-400"
    : "mt-5 text-lg text-gray-400";

  return (
    <div className={wrapperClassName}>
      <p className="mb-3 text-sm uppercase tracking-[0.35em] text-cyan-400">
        {label}
      </p>

      <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
        {title}
      </h2>

      <p className={descriptionClassName}>{description}</p>
    </div>
  );
}