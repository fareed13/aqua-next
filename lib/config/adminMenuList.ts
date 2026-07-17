/**
 * Admin "All Settings" section tree — the Next port of Nuxt's
 * `utils/adminsMenuList.js`. Titles, descriptions, ids and structure mirror Nuxt
 * exactly. (Nuxt stores a Vue `component` path per leaf; Next instead maps ids to
 * ported React components in AllSettings, so leaves carry `component: true`.)
 */

export interface SettingsItem {
  id: number
  title: string
  description?: string
  component?: boolean
  nested?: SettingsItem[]
}

export interface SettingsSection {
  id: number
  title: string
  items: SettingsItem[]
}

export const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    id: 1, title: 'Business Essentials',
    items: [
      { id: 101, title: 'Organization Profile', nested: [
        { id: 1011, title: 'Edit Organization', component: true, description: 'Update organization details like name, domain, school type, time zone, and logo.' },
        { id: 1012, title: 'Edit Location', component: true, description: "Add and manage your organization's operating locations for efficient operations." },
        { id: 1013, title: 'Program Settings', component: true, description: 'Configure program eligibility, applications, and preferences.' },
        { id: 1014, title: 'Staff Management', component: true, description: 'Manage and add new instructors to your website.' },
        { id: 1015, title: 'Organization PWA', component: true, description: 'Customize the Progressive Web App for better mobile and web user experience.' },
      ]},
      { id: 102, title: 'Customer Management', nested: [
        { id: 1021, title: 'Bulk Member Upload', component: true, description: 'Efficiently upload member data in bulk.' },
        { id: 1022, title: 'Belts System', component: true, description: 'Track and manage student belt progression.' },
        { id: 1023, title: 'Class Attendance', component: true, description: 'Record and manage student attendance.' },
        { id: 1024, title: 'Class Reservations', component: true, description: 'Enable students to reserve spots in classes.' },
        { id: 1025, title: 'Agreements', component: true, description: 'Manage and track member agreements for legal compliance.' },
      ]},
    ],
  },
  {
    id: 2, title: 'Payments & Billing',
    items: [
      { id: 201, title: 'Purchase History', component: true, description: 'View the purchase history of members.' },
      { id: 202, title: 'Trial Receipts', component: true, description: 'Manage and issue trial receipts for your organization.' },
      { id: 203, title: 'Payment Settings', component: true, description: 'Configure payment integration settings.' },
      { id: 204, title: 'Refund Policy', component: true, description: "Define and manage your organization's refund policy." },
      { id: 205, title: 'Booking Receipts', component: true, description: 'Manage and issue booking receipts for your organization.' },
    ],
  },
  {
    id: 3, title: 'Marketing & Analytics',
    items: [
      { id: 301, title: 'Reports Dashboard', nested: [
        { id: 3011, title: 'Keywords/SEO Report', component: true, description: "Track and optimize your organization's SEO rankings." },
        { id: 3012, title: 'Last 15 Days Report', component: true, description: 'View performance data from the last 15 days.' },
        { id: 3013, title: 'No Show Report', component: true, description: 'Monitor and analyze no-show data for students who have been absent for 15' },
        { id: 3014, title: 'New Member Report', component: true, description: 'Track new member sign-ups and activity.' },
        { id: 3015, title: 'Renewal Report', component: true, description: 'Track and manage member renewal statuses.' },
        { id: 3016, title: 'Birthdays Report', component: true, description: 'View and manage member birthdays.' },
        { id: 3017, title: 'Abbi Leads Report', component: true, description: 'Track and analyze user traffic, page sources and conversions by day and device.' },
        { id: 3018, title: 'Analytics', component: true, description: 'Access in-depth analytics of users for performance tracking.' },
      ]},
      { id: 302, title: 'Advertising', nested: [
        { id: 3021, title: 'Facebook Ad Manager', component: true, description: 'Manage and analyze Facebook ad campaigns.' },
        { id: 3022, title: 'Facebook Ad Builder', component: true, description: 'Create custom Facebook ads.' },
        { id: 3023, title: 'Google Ads', component: true, description: 'Manage and analyze Google ad campaigns.' },
        { id: 3024, title: 'Ad Library', component: true, description: 'View and manage all your advertising materials.' },
        { id: 3025, title: 'Target Market Settings', component: true, description: 'Set and manage target market settings for ads.' },
      ]},
      { id: 303, title: 'Google Business', nested: [
        { id: 3031, title: 'Media Manager', component: true, description: 'Manage media for your Google Business profile.' },
        { id: 3032, title: 'Location Settings', component: true, description: 'Configure location settings for Google Business.' },
        { id: 3033, title: 'Automation Rules', component: true, description: 'Set up automation rules for Google Business.' },
        { id: 3034, title: 'Performance Logs', component: true, description: 'Track performance logs and data from Google Business.' },
      ]},
    ],
  },
  {
    id: 4, title: 'Website Management',
    items: [
      { id: 400, title: 'Feature Toggles', component: true, description: 'Configure feature toggles for your website.' },
      { id: 401, title: 'Design', nested: [
        { id: 4011, title: 'Service Intro', component: true, description: 'Manage and update your service introduction content.' },
        { id: 4012, title: 'Style Settings', component: true, description: 'Customize the style settings for your website.' },
        { id: 4013, title: 'Landing Pages', component: true, description: 'Create and manage landing pages for your site.' },
        { id: 4014, title: 'Media Library', component: true, description: 'Organize and manage media assets for your website.' },
        { id: 4015, title: 'Labels', component: true, description: 'Manage and create labels for content organization.' },
        { id: 4016, title: 'Social Media Add/Edit', component: true, description: 'Manage and edit your social media integrations.' },
        { id: 4017, title: 'Additional Settings', component: true, description: 'Configure miscellaneous website settings.' },
        { id: 4018, title: 'PDF Builder', component: true, description: 'Create and manage pdf pages for your site.' },
        { id: 4019, title: 'Chatbot', component: true, description: 'Create and manage chatbot for your site.' },
      ]},
      { id: 402, title: 'Content', nested: [
        { id: 4021, title: 'Blog Management', component: true, description: 'Manage blog posts and content on your site.' },
        { id: 4022, title: 'Curriculum Editor', component: true, description: 'Create and manage curriculum content.' },
        { id: 4023, title: 'Curriculums', component: true, description: 'Manage and view curriculum resources.' },
        { id: 4024, title: 'Custom Scripts', component: true, description: 'Add and manage custom scripts on your website.' },
        { id: 4025, title: 'FAQ Management', component: true, description: 'Create and manage frequently asked questions.' },
      ]},
      { id: 403, title: 'Communication', nested: [
        { id: 4031, title: 'SMS', component: true, description: 'View and manage SMS communications.' },
        { id: 4032, title: 'Email', component: true, description: 'View and manage email communications.' },
        { id: 4033, title: 'Mass Communication', component: true, description: 'Send mass communication messages to users.' },
        { id: 4034, title: 'Templates', component: true, description: 'Create and manage communication templates.' },
      ]},
    ],
  },
  {
    id: 5, title: 'System Settings',
    items: [
      { id: 501, title: 'Users', component: true, description: 'Manage system users and their access levels.' },
      { id: 502, title: 'Service Integrations', component: true, description: 'Set up and manage third-party integrations.' },
      { id: 504, title: 'Automations', component: true, description: 'Set up automations for system processes.' },
      { id: 505, title: 'SEO & Analytics Settings', component: true, description: 'Add and manage your social media handlers.' },
      { id: 506, title: 'Redirect Urls', component: true, description: 'Manage and configure URL redirects for your website.' },
      { id: 507, title: 'SEO Page Meta', component: true, description: 'Manage SEO title and description for each page and slug.' },
    ],
  },
  {
    id: 6, title: 'Guidelines',
    items: [
      { id: 601, title: 'External Lead Integration', component: true, description: 'Configure external lead integration steps.' },
      { id: 602, title: 'Google Leads', component: true, description: 'Configure google leads integration steps.' },
    ],
  },
]
