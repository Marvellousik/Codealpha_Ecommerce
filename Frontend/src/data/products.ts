export interface Product {
  id: number
  name: string
  category: string
  collection: string
  color: string
  price: number
  badge: string
  isLimited: boolean
  description: string
  specs: string[]
}

export const products: Product[] = [
  {
    id: 1,
    name: 'iPhone 15 Pro Max',
    category: 'IPHONES',
    collection: 'Latest Series',
    color: 'Natural Titanium',
    price: 1199,
    badge: 'New Drop',
    isLimited: true,
    description: 'Forged in titanium. The most powerful iPhone ever with A17 Pro chip. Pro camera system with 48MP main camera. 5x telephoto zoom. USB-C connector.',
    specs: ['DISPLAY: 6.7" SUPER RETINA XDR', 'CHIP: A17 PRO', 'CAMERA: 48MP MAIN / 5X ZOOM']
  },
  {
    id: 2,
    name: 'iPhone 15 Pro',
    category: 'IPHONES',
    collection: 'Pro Lineup',
    color: 'Blue Titanium',
    price: 999,
    badge: '',
    isLimited: false,
    description: 'Titanium design. A17 Pro chip. Advanced camera system with 48MP main camera. 3x telephoto zoom. Action button. USB-C.',
    specs: ['DISPLAY: 6.1" SUPER RETINA XDR', 'CHIP: A17 PRO', 'CAMERA: 48MP MAIN / 3X ZOOM']
  },
  {
    id: 3,
    name: 'iPad Pro 12.9"',
    category: 'IPADS',
    collection: 'Pro Series',
    color: 'Space Gray',
    price: 1099,
    badge: '',
    isLimited: false,
    description: 'M2 chip. 12.9" Liquid Retina XDR display. Pro cameras. Thunderbolt / USB 4. Supports Apple Pencil hover.',
    specs: ['DISPLAY: 12.9" LIQUID RETINA XDR', 'CHIP: M2', 'CONNECTOR: THUNDERBOLT / USB 4']
  },
  {
    id: 4,
    name: 'iPad Air',
    category: 'IPADS',
    collection: 'Air Lineup',
    color: 'Starlight',
    price: 599,
    badge: 'Restock',
    isLimited: false,
    description: 'M1 chip. 10.9" Liquid Retina display. All-screen design. USB-C. Supports Apple Pencil 2nd generation.',
    specs: ['DISPLAY: 10.9" LIQUID RETINA', 'CHIP: M1', 'CONNECTOR: USB-C']
  },
  {
    id: 5,
    name: 'AirPods Pro 2',
    category: 'AIRPODS',
    collection: 'Pro Audio',
    color: 'White',
    price: 249,
    badge: 'New Drop',
    isLimited: true,
    description: 'Active Noise Cancellation. Adaptive Transparency. Personalized Spatial Audio. H2 chip. USB-C charging case.',
    specs: ['NOISE CANCELLATION: ACTIVE', 'CHIP: H2', 'BATTERY: 6H LISTENING']
  },
  {
    id: 6,
    name: 'AirPods Max',
    category: 'AIRPODS',
    collection: 'Over-Ear',
    color: 'Silver',
    price: 549,
    badge: '',
    isLimited: false,
    description: 'High-fidelity audio. Active Noise Cancellation. Computational audio. Digital Crown control. Premium over-ear design.',
    specs: ['DRIVER: APPLE-DESIGNED', 'NOISE CANCELLATION: ACTIVE', 'BATTERY: 20H LISTENING']
  },
  {
    id: 7,
    name: 'MagSafe Charger',
    category: 'ACCESSORIES',
    collection: 'Power & Cables',
    color: 'White',
    price: 39,
    badge: '',
    isLimited: false,
    description: 'Fast wireless charging up to 15W. Magnetic alignment snaps into place. Compatible with iPhone 12 and later. USB-C cable.',
    specs: ['POWER: UP TO 15W', 'CONNECTOR: USB-C', 'COMPATIBILITY: IPHONE 12+']
  },
  {
    id: 8,
    name: 'Apple Watch Ultra 2',
    category: 'ACCESSORIES',
    collection: 'Wearables',
    color: 'Titanium',
    price: 799,
    badge: 'Restock',
    isLimited: false,
    description: 'Rugged titanium case. 3000-nit display. Precision dual-frequency GPS. Depth and water temperature sensors. S9 SiP.',
    specs: ['DISPLAY: 3000 NITS', 'CASE: TITANIUM 49MM', 'SENSORS: DEPTH & TEMP']
  }
]

export function getProductById(id: number | string): Product | null {
  return products.find(p => p.id === Number(id)) || null
}

export function getRelatedProducts(category: string, excludeId: number | string): Product[] {
  return products.filter(p => p.category === category && p.id !== Number(excludeId)).slice(0, 3)
}

export const categorySlides: Record<string, { icon: string; label: string }[]> = {
  IPHONES: [
    { icon: 'smartphone', label: 'Front View' },
    { icon: 'photo_camera', label: 'Camera System' },
    { icon: 'deployed_code', label: 'Side Profile' },
    { icon: 'memory', label: 'Internals' }
  ],
  IPADS: [
    { icon: 'tablet_mac', label: 'Front View' },
    { icon: 'stylus', label: 'Apple Pencil' },
    { icon: 'deployed_code', label: 'Side Profile' },
    { icon: 'splitscreen', label: 'Multitasking' }
  ],
  AIRPODS: [
    { icon: 'headphones', label: 'Design' },
    { icon: 'hearing', label: 'Spatial Audio' },
    { icon: 'bluetooth', label: 'Connectivity' },
    { icon: 'battery_full', label: 'Battery Life' }
  ],
  ACCESSORIES: [
    { icon: 'watch', label: 'Design' },
    { icon: 'sensors', label: 'Sensors' },
    { icon: 'deployed_code', label: 'Build' },
    { icon: 'battery_full', label: 'Battery' }
  ]
}

export const iconMap: Record<string, string> = {
  IPHONES: 'smartphone',
  IPADS: 'tablet_mac',
  AIRPODS: 'headphones',
  ACCESSORIES: 'watch'
}

export function getIcon(category: string): string {
  return iconMap[category] || 'devices'
}
