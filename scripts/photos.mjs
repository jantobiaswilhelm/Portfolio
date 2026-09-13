#!/usr/bin/env node
/**
 * Reads originals from photos/<folder>/, emits responsive derivatives into
 * public/images/photos/<folder>/, and writes the manifest to src/data/photos.json.
 *
 * Run with: npm run photos
 *
 * Incremental: a file is reprocessed only when its derivatives are missing or
 * older than the original. Safe to run repeatedly.
 */
import { readdir, stat, mkdir, writeFile, readFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import exifr from 'exifr'
import {
  WIDTHS,
  FORMATS,
  parseFolder,
  resolveAlt,
  buildManifest,
  widthsFor,
  orientedSize,
} from './photos-lib.mjs'

const ROOT = process.cwd()
const SRC_DIR = path.join(ROOT, 'photos')
const OUT_DIR = path.join(ROOT, 'public', 'images', 'photos')
const MANIFEST = path.join(ROOT, 'src', 'data', 'photos.json')
const IMAGE_RE = /\.(jpe?g|png|tiff?|webp)$/i

async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, 'utf8'))
  } catch {
    return fallback
  }
}

async function mtimeOf(file) {
  try {
    return (await stat(file)).mtimeMs
  } catch {
    return 0
  }
}

/** True when any derivative that SHOULD exist is missing or older than the original. */
async function isStale(originalPath, outDir, name, targetWidths) {
  const original = await mtimeOf(originalPath)
  for (const width of targetWidths) {
    for (const { ext } of FORMATS) {
      const derivative = path.join(outDir, `${name}-${width}.${ext}`)
      if ((await mtimeOf(derivative)) < original) return true
    }
  }
  return false
}

async function makeLqip(pipeline) {
  const buf = await pipeline
    .clone()
    .resize(20, null, { fit: 'inside' })
    .webp({ quality: 30 })
    .toBuffer()
  return `data:image/webp;base64,${buf.toString('base64')}`
}

async function processFile(folder, fileName, place, year, overrides) {
  const originalPath = path.join(SRC_DIR, folder, fileName)
  const outDir = path.join(OUT_DIR, folder)
  const name = path.parse(fileName).name
  const id = `${folder}/${name}`

  await mkdir(outDir, { recursive: true })

  const pipeline = sharp(originalPath).rotate() // honour EXIF orientation
  const meta = await pipeline.metadata()
  const { w, h } = orientedSize(meta)

  if (!w || !h) {
    console.warn(`  skipped ${id}: could not read dimensions`)
    return null
  }

  const targetWidths = widthsFor(w)
  const stale = await isStale(originalPath, outDir, name, targetWidths)
  if (stale) {
    for (const width of targetWidths) {
      const resized = pipeline.clone().resize(width, null, { fit: 'inside' })
      for (const { ext, options } of FORMATS) {
        const target = path.join(outDir, `${name}-${width}.${ext}`)
        const format = ext === 'jpg' ? 'jpeg' : ext
        await resized.clone()[format](options).toFile(target)
      }
    }
  }

  // Missing or unreadable EXIF costs this photo its metadata, not the whole run.
  let exif = {}
  try {
    exif =
      (await exifr.parse(originalPath, {
        pick: ['Make', 'Model', 'LensModel', 'FocalLength', 'FNumber', 'ISO', 'DateTimeOriginal'],
      })) ?? {}
  } catch {
    console.warn(`  ${id}: no readable EXIF, continuing without camera metadata`)
  }

  const camera = [exif.Make, exif.Model].filter(Boolean).join(' ').trim() || null
  const { alt, altIsDefault } = resolveAlt(fileName, overrides, place, year)

  return {
    id,
    w,
    h,
    widths: targetWidths,
    alt,
    altIsDefault,
    place,
    year: year ?? null,
    camera,
    lens: exif.LensModel ?? null,
    focalLength: exif.FocalLength ? `${Math.round(exif.FocalLength)}mm` : null,
    aperture: exif.FNumber ? `f/${exif.FNumber}` : null,
    iso: exif.ISO ?? null,
    takenAt: exif.DateTimeOriginal ? new Date(exif.DateTimeOriginal).toISOString() : undefined,
    lqip: await makeLqip(pipeline),
    regenerated: stale,
  }
}

async function main() {
  let folders = []
  try {
    const entries = await readdir(SRC_DIR, { withFileTypes: true })
    folders = entries.filter((e) => e.isDirectory()).map((e) => e.name)
  } catch {
    console.warn(`photos/ not found. Writing an empty manifest.`)
  }

  const hero = await readJson(path.join(SRC_DIR, 'hero.json'), null)
  const photos = []
  let regenerated = 0

  for (const folder of folders) {
    const { place, year } = parseFolder(folder)
    const overrides = await readJson(path.join(SRC_DIR, folder, 'captions.json'), {})
    const files = (await readdir(path.join(SRC_DIR, folder))).filter((f) => IMAGE_RE.test(f))

    for (const fileName of files.sort()) {
      const photo = await processFile(folder, fileName, place, year, overrides)
      if (!photo) continue
      if (photo.regenerated) regenerated++
      delete photo.regenerated
      photos.push(photo)
    }
  }

  const manifest = buildManifest(photos, hero?.id ?? null)
  await mkdir(path.dirname(MANIFEST), { recursive: true })
  await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n')

  const defaults = photos.filter((p) => p.altIsDefault).length
  console.log(`\n${photos.length} photo(s), ${regenerated} regenerated.`)
  if (hero?.id && !manifest.heroId) {
    console.warn(`hero.json names "${hero.id}", which is not in the set. Hero will fall back.`)
  }
  if (!manifest.heroId) console.warn(`No hero photo set. Add photos/hero.json to choose one.`)
  if (defaults > 0) {
    console.warn(
      `${defaults} photo(s) still use the default "<Place>, <Year>" alt text. ` +
        `Add descriptions in photos/<folder>/captions.json.`,
    )
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
