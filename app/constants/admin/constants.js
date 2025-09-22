import { Trophy, Tags, Target, Users } from 'lucide-react'

export const ADMIN_LOGIN_DATA = {
  images: [
    '/pageant-college/pg-1.png',
    '/pageant-college/pg-2.png',
    '/pageant-college/pg-3.png',
    '/pageant-college/pg-4.png'
  ],

  content: {
    mainTitle: 'Lyceum of Alabang',
    subtitle: 'Administrator'
  }
}

export const ADMIN_DASHBOARD_DATA = [
  {
    id: 'competition',
    title: 'Competitions',
    description: 'Manage competition events and levels',
    icon: Trophy,
    color: 'from-red-600 via-red-500 to-pink-400 dark:from-red-400 dark:via-red-300 dark:to-pink-200'
  },
  {
    id: 'category',
    title: 'Categories',
    description: 'Configure competition categories',
    icon: Tags,
    color: 'from-purple-600 via-purple-500 to-indigo-400 dark:from-purple-400 dark:via-purple-300 dark:to-indigo-200'
  },
  {
    id: 'criteria',
    title: 'Criteria',
    description: 'Set judging criteria and weights',
    icon: Target,
    color: 'from-green-600 via-green-500 to-emerald-400 dark:from-green-400 dark:via-green-300 dark:to-emerald-200'
  },
  {
    id: 'candidate',
    title: 'Candidates',
    description: 'Manage competition participants',
    icon: Users,
    color: 'from-blue-600 via-blue-500 to-cyan-400 dark:from-blue-400 dark:via-blue-300 dark:to-cyan-200'
  }
]
