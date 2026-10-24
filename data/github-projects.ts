export type GithubProject = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  technologies: string[];
  repoUrl: string;
  demoUrl: string;
  detail: string;
};

export const selectedGithubProjects: GithubProject[] = [
  {
    id: "todo",
    title: "Task Tracker",
    subtitle: "Productivity · Browser storage",
    description: "A lightweight task manager where you can add, complete and remove tasks. Items are saved locally in the browser so they survive a page refresh.",
    technologies: ["HTML", "CSS", "JavaScript", "localStorage"],
    repoUrl: "https://github.com/Dleteo/-To-Do-App-whit-JavaScript",
    demoUrl: "https://dleteo.github.io/-To-Do-App-whit-JavaScript/",
    detail: "Shows DOM events, UI state and local persistence.",
  },
  {
    id: "hangman",
    title: "Hangman Game",
    subtitle: "Interactive game · DOM",
    description: "A browser word-guessing game with letter selection, win/loss states and an option to add words. Built as a JavaScript interaction exercise.",
    technologies: ["HTML", "CSS", "JavaScript"],
    repoUrl: "https://github.com/Dleteo/hangman-game",
    demoUrl: "https://dleteo.github.io/hangman-game/",
    detail: "Shows game flow, conditionals and interactive feedback.",
  },
  {
    id: "encoder",
    title: "Text Encoder / Decoder",
    subtitle: "Text utility · String transformations",
    description: "A text transformation exercise that replaces vowels using predefined rules, then reverses those substitutions. This is not secure encryption.",
    technologies: ["HTML", "CSS", "JavaScript"],
    repoUrl: "https://github.com/Dleteo/Encriptor",
    demoUrl: "https://dleteo.github.io/Encriptor/",
    detail: "Shows input validation and reversible string manipulation.",
  },
];
