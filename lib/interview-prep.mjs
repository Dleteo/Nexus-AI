/**
 * User-authored interview prep notes. Checkbox completion is manual review,
 * NOT evidence that automated tests or deployment occurred.
 */
const escapeMd = value => String(value).replace(/&/g,"&amp;").replace(/</g,"&lt;")
  .replace(/>/g,"&gt;").replace(/\r/g,"").replace(/^([#*>-]|\d+\.)\s/gm,"\\$&")
  .slice(0,1800);

export function buildInterviewPrepMarkdown(study, labels, checked) {
  if (!study || typeof study.title !== "string" ||
      !Array.isArray(study.approach) || !Array.isArray(study.limitations) ||
      !Array.isArray(study.evidence) || !Array.isArray(checked) || checked.length !== 4 ||
      checked.some(item=>typeof item !== "boolean") ||
      !Array.isArray(labels) || labels.length !== 4 ||
      labels.some(item=>typeof item !== "string")) throw new Error("invalid-interview-data");
  const title=escapeMd(study.title);
  const lines=[
    "# Interview preparation — "+title,
    "",
    "Manual review checklist (not automated test evidence):",
    ...labels.map((label,i)=>"- ["+(checked[i]?"x":" ")+"] "+escapeMd(label)),
    "",
    "## Problem",
    escapeMd(study.problem || ""),
    "",
    "## Technical decisions",
    ...study.approach.slice(0,12).map(item=>"- "+escapeMd(item)),
    "",
    "## Source and tests to inspect",
    ...study.evidence.slice(0,12)
      .filter(item=>item&&typeof item.url==="string"&&item.url.startsWith("https://github.com/"))
      .map(item=>"- "+escapeMd(item.label)+": "+item.url),
    "",
    "## Limitations to explain",
    ...study.limitations.slice(0,12).map(item=>"- "+escapeMd(item)),
    "",
    "Review status reflects your own preparation only. It does not indicate a test run, AI inference, or a production deployment.",
    "",
  ];
  return lines.join("\n");
}
