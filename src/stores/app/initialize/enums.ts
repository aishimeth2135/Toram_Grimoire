export const InitializeStatus = {
  ViewLoading: 'view-loading',
  ViewSuccess: 'view-success',
  LocaleLoading: 'locale-loading',
  LocaleSuccess: 'locale-success',
  BeforeFinished: 'before-finished',
  Finished: 'finished',
  Error: 'error',
} as const
export type InitializeStatus = (typeof InitializeStatus)[keyof typeof InitializeStatus]

export const InitItemStatus = {
  Loading: 'loading',
  Success: 'success',
  Error: 'error',
} as const
export type InitItemStatus = (typeof InitItemStatus)[keyof typeof InitItemStatus]
