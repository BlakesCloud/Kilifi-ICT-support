export const DEPARTMENTS = [
  'Outpatient (OPD)',
  'Maternity',
  'Laboratory',
  'Pharmacy',
  'Radiology',
  'ICU / HDU',
  'Medical Records',
  'Finance & Billing',
  'Administration',
  'Nursing Station',
  'Orthopaedic',
  'Telemedicine',
  'mortuary',
  'Newborn Unit',
  'Triage',
  'Other',
]

export const CATEGORIES = [
  { id: 'login',    label: 'Login / Account',         icon: '👤', description: 'Password issues, account locked, can\'t log in' },
  { id: 'hardware', label: 'Hardware(Mitambo)',                 icon: '🖥️', description: 'PC, printer, mouse, keyboard, screen' },
  { id: 'software', label: 'Software / App',           icon: '📦', description: 'App won\'t open, installation, crashes' },
  { id: 'network',  label: 'Internet / Network',       icon: '📡', description: 'No internet, slow connection, WiFi' },
  { id: 'email',    label: 'Email',                    icon: '✉️', description: 'Outlook setup, can\'t send or receive' },
  { id: 'emr',      label: 'Hospital System',          icon: '🏥', description: 'KenyaEMR, DHIS2, NHIF portal issues' },
  { id: 'other',    label: 'Other (Zinginezo)',                    icon: '❓', description: 'Anything else' },
]

export const STATUS = {
  OPEN:        'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED:    'Resolved',
}

export const PRIORITY = {
  NORMAL: 'Normal',
  URGENT: 'Urgent',
}

export const STATUS_STYLES = {
  'Open':        { bg: '#aecdf6', text: '#1D4ED8', dot: '#3B82F6' },
  'In Progress': { bg: '#faefc3', text: '#92400E', dot: '#F59E0B' },
  'Resolved':    { bg: '#d2fade', text: '#166534', dot: '#22C55E' },
}

export const PRIORITY_STYLES = {
  'Normal': { bg: '#c8ebdc', text: '#374151' },
  'Urgent': { bg: '#ecc7c7', text: '#991B1B' },
}
