
export type ICallback = (error?: Error) => void

export interface IRule {
  trigger: string
  validator: (rule: IRule, value: any, callback: ICallback) => void
}

export function required (label = 'Field') {
  return function validator (rule: IRule, value: any, callback: ICallback) {
    if (value.trim().length === 0) {
      callback(new Error(label + ' is required'))
    }
  }
}
