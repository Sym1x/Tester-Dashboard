export function parseFeature(text) {
  const lines = text.split(/\r?\n/);

  let feature = null;
  let currentScenario = null;
  let currentTags = [];
  let state = null; // "feature-desc" | "background" | "scenario" | "examples"

  for (let rawLine of lines) {
    const line = rawLine.trim();

    // Skip empty lines
    if (!line) continue;

    // TAGS
    if (line.startsWith("@")) {
      currentTags = line.split(" ").map(t => t.trim());
      continue;
    }

    // FEATURE
    if (line.startsWith("Feature:")) {
      feature = {
        name: line.replace("Feature:", "").trim(),
        tags: currentTags,
        description: "",
        background: { steps: [] },
        scenarios: []
      };

      currentTags = [];
      state = "feature-desc";
      continue;
    }

    // BACKGROUND
    if (line.startsWith("Background:")) {
      state = "background";
      continue;
    }

    // SCENARIO
    if (
      line.startsWith("Scenario:") ||
      line.startsWith("Scenario Outline:")
    ) {
      currentScenario = {
        name: line.replace(/Scenario( Outline)?:/, "").trim(),
        type: line.startsWith("Scenario Outline")
          ? "Scenario Outline"
          : "Scenario",
        tags: currentTags,
        steps: [],
        examples: []
      };

      currentTags = [];
      feature.scenarios.push(currentScenario);
      state = "scenario";
      continue;
    }

    // EXAMPLES
    if (line.startsWith("Examples:")) {
      state = "examples";
      continue;
    }

    // STEPS
    if (/^(Given|When|Then|And|But)/i.test(line)) {
      if (state === "background") {
        feature.background.steps.push(line);
      } else if (state === "scenario") {
        currentScenario.steps.push(line);
      }
      continue;
    }

    // EXAMPLES TABLE ROW
    if (state === "examples" && line.startsWith("|")) {
      const cells = line
        .split("|")
        .map(c => c.trim())
        .filter(Boolean);

      currentScenario.examples.push(cells);
      continue;
    }

    // FEATURE DESCRIPTION
    if (state === "feature-desc") {
      feature.description +=
        (feature.description ? "\n" : "") + line;
      continue;
    }
  }

  return feature;
}