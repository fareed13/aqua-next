const PLURAL_MAP: Record<string, string> = {
  Class: 'Classes',
  Week: 'Weeks',
  Month: 'Months',
  Day: 'Days',
}

export function arrangeUnitOfTime(amountOfUnits: number, unitOfTime: string): string {
  if (amountOfUnits > 1 && PLURAL_MAP[unitOfTime]) {
    return PLURAL_MAP[unitOfTime]
  }
  return unitOfTime
}
