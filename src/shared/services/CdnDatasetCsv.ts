import Papa from 'papaparse'

const maxCsvBytes = 8 * 1024 * 1024
export const maxManifestBytes = 16 * 1024
const datasetTextDecoder = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true })

export function decodeDatasetManifest(bytes: ArrayBuffer): unknown {
  if (bytes.byteLength > maxManifestBytes) {
    throw new Error('Dataset manifest exceeds its size limit')
  }
  return JSON.parse(datasetTextDecoder.decode(bytes))
}

export type CdnCsvFile = {
  file: string
  sha256: string
  byteLength: number
  recordCount: number
}

export type ReadCdnCsv = (file: CdnCsvFile, header: readonly string[]) => Promise<string[][]>

export function positiveInt(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0
}

export function manifestObject(value: unknown): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Invalid dataset manifest object')
  }
  return value as Record<string, unknown>
}

export function parseCsvFile(value: unknown, stem: string): CdnCsvFile {
  const { file, sha256, byteLength, recordCount } = manifestObject(value)
  if (
    typeof sha256 !== 'string' ||
    !/^[0-9a-f]{64}$/.test(sha256) ||
    file !== `${stem}.${sha256}.csv` ||
    !positiveInt(byteLength) ||
    byteLength > maxCsvBytes ||
    (recordCount !== 0 && !positiveInt(recordCount))
  ) {
    throw new Error('Invalid dataset file descriptor')
  }
  return { file, sha256, byteLength, recordCount }
}

export async function parseCdnCsv(
  bytes: ArrayBuffer,
  file: CdnCsvFile,
  header: readonly string[]
): Promise<string[][]> {
  if (bytes.byteLength !== file.byteLength || bytes.byteLength > maxCsvBytes) {
    throw new Error('Dataset CSV byte length mismatch')
  }
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  const hash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join(
    ''
  )
  if (hash !== file.sha256) {
    throw new Error('Dataset CSV checksum mismatch')
  }
  const text = datasetTextDecoder.decode(bytes)
  const { data, errors } = Papa.parse<string[]>(text, { delimiter: ',', newline: '\r\n' })
  if (
    text.startsWith('\uFEFF') ||
    errors.length ||
    data.length !== file.recordCount + 1 ||
    data.some(row => row.length !== header.length) ||
    !header.every((cell, index) => data[0][index] === cell)
  ) {
    throw new Error('Invalid dataset CSV layout')
  }
  return data
}
