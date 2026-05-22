import { runEvolutionCycle } from "../lib/engine";

async function main() {
  const result = await runEvolutionCycle("manual");
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
