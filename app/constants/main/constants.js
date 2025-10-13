import { Trophy, Flag, Music, Sparkles, Users, Star } from 'lucide-react'

export const COMPETITION_DATA = [
  {
    title: 'Pageant College',
    src: '/main/pageant-college.png',
    link: '/pageant'
  },
  {
    title: 'Singing',
    src: '/main/singing-main.png',
    link: '/singing'
  },
  {
    title: 'Flag Twirling',
    src: '/main/flag-twirling.jpg',
    link: '/flag-twirling'
  },
  {
    title: 'Hip-Hop',
    src: '/main/hiphop-main.png',
    link: '/hiphop'
  },
  {
    title: 'Bench-Cheering',
    src: '/main/bench-cheering-main.png',
    link: '/bench-cheering'
  },
  {
    title: 'Little Lycean Star',
    src: '/main/admin.jpg',
    link: '/little-lycean-stars'
  },
  {
    title: 'Lycean Teen Model',
    src: '/main/admin.jpg',
    link: '/lycean-teen-model'
  },
  {
    title: 'Admin Page',
    src: '/main/admin.jpg',
    link: '/admin'
  }
]

export const COMPETITIONS_CHIPS = [
  { id: 'pageantry', label: 'Pageantry', icon: Sparkles },
  { id: 'flag_twirling', label: 'Flag Twirling', icon: Flag },
  { id: 'hiphop', label: 'Hip-Hop', icon: Music },
  { id: 'singing', label: 'Singing', icon: Trophy },
  { id: 'bench_cheering', label: 'Bench Cheering', icon: Users },
  { id: 'little_lycean_stars', label: 'Little Lycean Stars', icon: Star },
  { id: 'lycean_teen_model', label: 'Lycean Teen Model', icon: Sparkles }
]
