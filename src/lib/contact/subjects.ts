export const CONTACT_SUBJECT_OPTIONS = [
  { value: 'project', label: 'Project enquiry' },
  { value: 'availability', label: 'Availability' },
  { value: 'general', label: 'General contact' },
  { value: 'collaboration', label: 'Collaboration' },
] as const

export type ContactSubjectValue = (typeof CONTACT_SUBJECT_OPTIONS)[number]['value']

const SUBJECT_LABELS: Record<ContactSubjectValue, string> = {
  project: 'Project enquiry',
  availability: 'Availability',
  general: 'General contact',
  collaboration: 'Collaboration',
}

export function contactSubjectLabel(value: string): string {
  return SUBJECT_LABELS[value as ContactSubjectValue] ?? 'General contact'
}
