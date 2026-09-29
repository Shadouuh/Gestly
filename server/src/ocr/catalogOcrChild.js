import fs from 'fs/promises';
import { analyzeCatalogImageFromPath } from './catalogOcrService.js';

const [runId, workingDir, imagePath, originalname, outputPath] = process.argv.slice(2);

const main = async () => {
  if (!workingDir || !imagePath || !outputPath) {
    throw new Error('Faltan argumentos para ejecutar catalogOcrChild');
  }

  const result = await analyzeCatalogImageFromPath({
    runId,
    workingDir,
    imagePath,
    originalname,
  });

  await fs.writeFile(outputPath, JSON.stringify(result), 'utf8');
};

main().catch((error) => {
  console.error('[ocr-child] fatal error:', error);
  process.exit(1);
});
