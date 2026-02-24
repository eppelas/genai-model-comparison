#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const projectDir = process.cwd();
const casesRoot = path.resolve(process.argv[2] || '..');
const outputPath = path.resolve(process.argv[3] || './manifest.js');

const imageExtensions = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.gif',
  '.bmp',
  '.tif',
  '.tiff',
]);

const ignoredDirs = new Set([
  '.git',
  'node_modules',
  'dist',
  '_ai-cases-light-gallery',
]);

const modelMatchers = [
  { key: 'reference', name: 'Reference', regex: /\boriginal\b|\breference\b/i },
  { key: 'gpt-image-1-5', name: 'GPT Image 1.5', regex: /\bgpt\s*image\s*1\.5/i },
  { key: 'imagen-4', name: 'Imagen 4', regex: /\bimagen\s*4/i },
  { key: 'seedream-4-5', name: 'Seedream 4.5', regex: /\bseedream\s*4\.5/i },
  { key: 'flux-1-dev', name: 'Flux.1-dev', regex: /\bflux(?:\.1)?(?:-?dev)?/i },
  { key: 'gemini-nano-banana', name: 'Gemini Nano Banana', regex: /\bgemini\s*nano\s*banana/i },
  { key: 'qwen-image', name: 'Qwen Image', regex: /\bqwen\s*image/i },
  { key: 'grok', name: 'Grok', regex: /\bgrok/i },
  { key: 'mv7', name: 'Mv7', regex: /\bmv\s*7/i },
  { key: 'sdxl-1-0', name: 'SDXL 1.0', regex: /\bsdxl\s*1\.0/i },
  {
    key: 'stable-diffusion-3-5-large',
    name: 'Stable Diffusion 3.5 Large',
    regex: /\bstable\s*diffusion\s*3\.5\s*large/i,
  },
  { key: 'hidream-i1-full', name: 'HiDream.I1-full', regex: /\bhidream\.?i1-?full/i },
  { key: 'z-image-turbo', name: 'Z Image Turbo', regex: /\bz\s*image\s*turbo/i },
];

const modelOrder = modelMatchers.map((item) => item.name);

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function inferModel(fileName) {
  const stem = fileName.replace(/\.[^.]+$/, '');

  // Pass 1: direct model name match in original filename.
  for (const matcher of modelMatchers) {
    if (matcher.regex.test(stem)) {
      return { key: matcher.key, name: matcher.name };
    }
  }

  // Fusara is a platform, not a model. If the filename contains Fusara,
  // strip platform words and try to recover a real model name.
  const hasFusaraPlatformTag =
    /\bfusara\b/i.test(stem) ||
    /generated\s+image\s+from\s+fusara\s+ai/i.test(stem) ||
    /fusara\s+ai\s+project\s+image/i.test(stem);

  if (hasFusaraPlatformTag) {
    const withoutPlatform = stem
      .replace(/generated\s+image\s+from\s+fusara\s+ai/gi, ' ')
      .replace(/fusara\s+ai\s+project\s+image/gi, ' ')
      .replace(/\bfusara\b/gi, ' ')
      .replace(/\(\s*\d+\s*\)/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    for (const matcher of modelMatchers) {
      if (matcher.regex.test(withoutPlatform)) {
        return { key: matcher.key, name: matcher.name };
      }
    }

    return { key: 'unknown', name: 'Unknown' };
  }

  const plain = stem.replace(/[_-]+/g, ' ').trim();
  if (plain.length > 0) {
    return { key: 'other', name: 'Other' };
  }

  return { key: 'unknown', name: 'Unknown' };
}

function getImageDimensions(filePath) {
  try {
    const output = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', filePath], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });

    const widthMatch = output.match(/pixelWidth:\s*(\d+)/);
    const heightMatch = output.match(/pixelHeight:\s*(\d+)/);
    if (!widthMatch || !heightMatch) return null;

    const width = Number.parseInt(widthMatch[1], 10);
    const height = Number.parseInt(heightMatch[1], 10);
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return null;

    return { width, height, aspect: width / height };
  } catch {
    return null;
  }
}

function readImageFiles(caseDir) {
  return fs
    .readdirSync(caseDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .filter((entry) => imageExtensions.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => {
      const fullPath = path.join(caseDir, entry.name);
      const stat = fs.statSync(fullPath);
      const model = inferModel(entry.name);
      const dims = getImageDimensions(fullPath);
      const relativePath = path.relative(projectDir, fullPath).split(path.sep).join('/');

      return {
        fileName: entry.name,
        model: model.name,
        modelKey: model.key,
        width: dims?.width ?? null,
        height: dims?.height ?? null,
        aspect: dims?.aspect ?? null,
        src: encodeURI(relativePath),
        modifiedAt: stat.mtime.toISOString(),
        sizeBytes: stat.size,
      };
    });
}

function sortImages(items) {
  const orderIndex = new Map(modelOrder.map((name, index) => [name, index]));
  return items.sort((a, b) => {
    const aIndex = orderIndex.has(a.model) ? orderIndex.get(a.model) : Number.MAX_SAFE_INTEGER;
    const bIndex = orderIndex.has(b.model) ? orderIndex.get(b.model) : Number.MAX_SAFE_INTEGER;

    if (aIndex !== bIndex) return aIndex - bIndex;
    if (a.model !== b.model) return a.model.localeCompare(b.model);
    return a.fileName.localeCompare(b.fileName);
  });
}

function collectCases() {
  const entries = fs
    .readdirSync(casesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => !ignoredDirs.has(entry.name))
    .filter((entry) => !entry.name.startsWith('.'))
    .sort((a, b) => a.name.localeCompare(b.name));

  return entries
    .map((entry) => {
      const caseDir = path.join(casesRoot, entry.name);
      const images = sortImages(readImageFiles(caseDir));
      if (images.length === 0) return null;

      const uniqueModels = Array.from(new Set(images.map((image) => image.model)));
      const knownAspects = images.map((image) => image.aspect).filter((value) => Number.isFinite(value));

      let orientationMode = 'mixed';
      let targetAspect = 1.25;
      if (knownAspects.length > 0) {
        const landscapeCount = knownAspects.filter((value) => value > 1.1).length;
        const portraitCount = knownAspects.filter((value) => value < 0.9).length;

        if (landscapeCount >= portraitCount * 1.2) orientationMode = 'landscape';
        else if (portraitCount >= landscapeCount * 1.2) orientationMode = 'portrait';

        const sortedAspects = [...knownAspects].sort((a, b) => a - b);
        const mid = Math.floor(sortedAspects.length / 2);
        targetAspect = sortedAspects[mid];
      }

      return {
        id: slugify(entry.name) || `case-${Math.random().toString(36).slice(2, 8)}`,
        name: entry.name,
        imageCount: images.length,
        orientationMode,
        targetAspect,
        models: uniqueModels,
        images,
      };
    })
    .filter(Boolean);
}

if (!fs.existsSync(casesRoot)) {
  console.error(`Cases root not found: ${casesRoot}`);
  process.exit(1);
}

const cases = collectCases();
const totalImages = cases.reduce((sum, item) => sum + item.imageCount, 0);
const totalModels = Array.from(new Set(cases.flatMap((item) => item.models))).length;

const manifest = {
  generatedAt: new Date().toISOString(),
  casesRoot,
  summary: {
    totalCases: cases.length,
    totalImages,
    totalModels,
  },
  cases,
};

const output = `window.AI_CASES_MANIFEST = ${JSON.stringify(manifest, null, 2)};\n`;
fs.writeFileSync(outputPath, output, 'utf8');

console.log(`Manifest written to ${outputPath}`);
console.log(`Cases: ${cases.length}`);
console.log(`Images: ${totalImages}`);
console.log(`Models: ${totalModels}`);
