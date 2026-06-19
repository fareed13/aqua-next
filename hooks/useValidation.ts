'use client'

type ValidationResult = true | string

export function isRequired(v: unknown): ValidationResult {
  return !!v || 'Field is required'
}

export function whitespaceCheck(v: unknown): ValidationResult {
  if (typeof v === 'string' && v.startsWith(' ')) {
    return 'Whitespace not allowed at the beginning'
  }
  return true
}

export function selectRequired(v: unknown[]): ValidationResult {
  return (v && v.length > 0) || 'Item is required'
}

export function maxLimit(v: number): ValidationResult {
  return v <= 2000 || 'Price can not exceed 2000'
}

export function negativeValueCheck(v: unknown): ValidationResult {
  if (v === '' || v == null) return true
  if (isNaN(Number(v))) return 'Invalid value'
  if (Number(v) < 0 || (typeof v === 'string' && v.startsWith('-'))) return 'Value cannot be negative'
  return true
}

export function AllowPositiveIntegers(v: unknown): ValidationResult {
  if (typeof v === 'string' && v.includes('.')) return 'Only integer value allowed'
  return true
}

export function greaterThanZero(v: unknown): ValidationResult {
  if (v === '' || v == null) return true
  if (isNaN(Number(v))) return 'Invalid value'
  if (Number(v) <= 0 || (typeof v === 'string' && v.startsWith('-'))) return 'Value should be greater than zero'
  return true
}

export function priceValidation(v: number): ValidationResult {
  if (v < 1) return "Price can't be zero"
  if (v < 0 || (typeof v === 'number' && v < 0)) return 'Price cannot be negative'
  if (v > 2000) return 'Price cannot exceed 2000'
  return true
}

export function minLimit(v: number): ValidationResult {
  return v >= 30 || 'Price can not be less than 30'
}

export function max(maxNum: number) {
  return (v: string | undefined): ValidationResult =>
    (v || '').length <= maxNum || `Must be ${maxNum} or Less Characters`
}

export function min(minNum: number) {
  return (v: string | undefined): ValidationResult =>
    (v || '').length >= minNum || `Must be ${minNum} or More Characters`
}

export function maxValue(maxNum: number) {
  return (v: number): ValidationResult =>
    (v || 0) <= maxNum || `Must be ${maxNum} or Less`
}

export function minValue(minNum: number) {
  return (v: number): ValidationResult =>
    (v || 0) >= minNum || `Must be ${minNum} or More`
}

export function yearValidation(year: number) {
  return (v: number): ValidationResult =>
    (v || 0) >= year || 'Invalid Year'
}

export function emailRule(v: string): ValidationResult {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
  return regex.test(v) || 'Invalid email!'
}

export function zipCodeValidation(v: string): ValidationResult {
  if (!v) return 'ZIP code is required.'
  const length = v.replace(/-/g, '').length
  if (length < 5) return 'Must be 5 digits.'
  if (length > 5 && length !== 9) return 'Must be 9 digits.'
  return true
}

export function validateField(value: unknown, rules: Array<(v: any) => ValidationResult>): string | null {
  for (const rule of rules) {
    const result = rule(value)
    if (result !== true) return result
  }
  return null
}

export function validateForm(
  fields: Record<string, { value: unknown; rules: Array<(v: any) => ValidationResult> }>
): Record<string, string | null> {
  const errors: Record<string, string | null> = {}
  for (const [key, { value, rules }] of Object.entries(fields)) {
    errors[key] = validateField(value, rules)
  }
  return errors
}

export function isFormValid(errors: Record<string, string | null>): boolean {
  return Object.values(errors).every((e) => e === null)
}
