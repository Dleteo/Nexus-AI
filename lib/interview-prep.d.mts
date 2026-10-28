export type PreparedCaseStudy={
  title:string;problem:string;approach:ReadonlyArray<string>;
  evidence:ReadonlyArray<{label:string;url:string}>;limitations:ReadonlyArray<string>;
};
export function buildInterviewPrepMarkdown(
 study:PreparedCaseStudy,labels:ReadonlyArray<string>,checked:ReadonlyArray<boolean>
):string;
