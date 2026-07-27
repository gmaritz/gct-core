import { bootstrapApplication } from "./bootstrap/application";

async function main(): Promise<void> {
  await bootstrapApplication();
}

main().catch((error: unknown) => {
  console.error("Fatal startup error", error);
  process.exit(1);
});
