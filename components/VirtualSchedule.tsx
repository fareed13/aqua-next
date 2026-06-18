'use client';

import type { SectionProps } from '@/components/sections/registry';
import { VirtualScheduleDefault } from '@/components/schedule/VirtualScheduleDefault';

export function VirtualSchedule({ headline, ...props }: SectionProps) {
  return <VirtualScheduleDefault headline={headline} {...props} />;
}
