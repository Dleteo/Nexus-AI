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
  const wrapperClassName = centered ? "mb-14 text-center" : "mb-14 max-w-2xl";
  const descriptionClassName = centered
    ? "mx-auto mt-5 max-w-2xl text-base leading-7 text-[#756155]"
    : "mt-5 text-base leading-7 text-[#756155]";

  return (
    <div className={wrapperClassName}>
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#AD5637]">{label}</p>
      <h2 className="text-3xl font-semibold tracking-tight text-[#302923] sm:text-4xl">{title}</h2>
      <p className={descriptionClassName}>{description}</p>
    </div>
  );
}
