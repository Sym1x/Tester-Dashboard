import fg from "fast-glob";
import { readFile, writeFile } from "fs/promises";
import { parseFeature } from "./parseFeature.js";

export async function loadAllFeatures() {
  const paths = await fg(`${process.env.CUCUMBER_CWD}/features/**/*.feature`);
  const results = [];

  for (const path of paths) {
    const text = await readFile(path, "utf8");
    const feature = parseFeature(text);

    results.push({
      ...feature
    });
  }

  return results;
}

export async function writeSummaryFile(outputPath = "./feature-summary.json") {
  const featureData = await loadAllFeatures();

  await writeFile(
    outputPath,
    JSON.stringify(featureData, null, 2),
    "utf8"
  );

  console.log(`Summary written to ${outputPath}`);
}


writeSummaryFile();