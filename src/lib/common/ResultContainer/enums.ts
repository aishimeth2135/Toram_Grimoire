export const ResultContainerTypes = {
  Number: 'number',
  String: 'string',
} as const
export type ResultContainerTypes = (typeof ResultContainerTypes)[keyof typeof ResultContainerTypes]

export const TextResultContainerPartTypes = {
  Separate: 'separate',
  GlossaryTag: 'glossary-tag',
  BreakLine: 'break-line',
  Other: 'other',
} as const
export type TextResultContainerPartTypes =
  (typeof TextResultContainerPartTypes)[keyof typeof TextResultContainerPartTypes]

export const CommonTextParseItemIds = {
  Separate: 'separate',
  Value: 'value',
  GlossaryTag: 'glossary-tag',
  Mark: 'mark',
  Underline: 'underline',
  BreakLine: 'break-line',
} as const
export type CommonTextParseItemIds =
  (typeof CommonTextParseItemIds)[keyof typeof CommonTextParseItemIds]
