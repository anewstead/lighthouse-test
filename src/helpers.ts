import fs from "node:fs";

export type Score = [string, number];

export type TestItem = {
  baseURL: string;
  absRoute: string;
  relRoute: string;
  fileName: string;
  localPath: string;
  scores: Score[];
};

const loadJSON = (path) => {
  const file = fs.readFileSync(new URL(path, import.meta.url), "utf8");
  return JSON.parse(file);
};

// const pathData = loadJSON("./paths.json");
const pathData = loadJSON("./doodle.json");
const baseURL = pathData.baseURL;

// regex ^\/|\/$/g: Removes the leading and trailing "/" characters.
// regex /\//g: Replaces all remaining "/" characters with "_".
// if going to baseURL (homepage) most likely is empty string so save as "index"
const newTestItem = (route: string): TestItem => {
  let fileName = route.replace(/^\/|\/$/g, "").replace(/\//g, "__");
  fileName = fileName === "" ? "__" : fileName;
  return {
    baseURL: baseURL,
    absRoute: `${baseURL}${route}`,
    relRoute: route,
    fileName,
    localPath: `lighthouse/${fileName}.html`,
    scores: [],
  };
};

// creates array of path objects
// used for tests and results index
export const getTestItems = (): TestItem[] => {
  return pathData.routes.map((route) => {
    return newTestItem(route);
  });
};

// create HTML content with links
export const createIndexFile = (testItems: TestItem[]) => {
  const links = testItems
    .map((item) => {
      return `<p>
        <a href="${item.localPath}">${item.relRoute}</a>
        <br>
        ${item.scores} 
        </p>`;
    })
    .join("");

  const html = `<!DOCTYPE html>
    <html>
    <head>
      <title>Lighthouse Scores</title>
    </head>
    <body>
      <h1>${baseURL}</h1>
      ${links}
    </body>
    </html>`;

  const saveAs = "./test-results/lighthouse.html";
  saveToFile(html, saveAs);
};

// save text to a file
const saveToFile = (text: string, fileName: string) => {
  fs.writeFileSync(fileName, text);
  console.log(`HTML file "${fileName}" created successfully.`);
};
