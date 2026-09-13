/**
 * demoStore.js — the preloaded "Meera Fashion" demo catalogue.
 * Product visuals are local static assets (no network, no backend).
 */
import sareeImg from '../assets/demo/saree.jpg'
import kurtiImg from '../assets/demo/kurti.jpg'
import earringsImg from '../assets/demo/earrings.jpg'
import suitImg from '../assets/demo/suit.jpg'
import festivalImg from '../assets/demo/festival.jpg'
import saree2Img from '../assets/demo/saree2.jpg'
import necklaceImg from '../assets/demo/necklace.jpg'

const now = Date.now()

export function getDemoStore() {
  return {
    version: 1,
    shop: {
      name: 'Meera Fashion',
      ownerName: 'Meera Reddy',
      phone: '919876543210',
      description: 'Handpicked sarees, kurtis & festive jewellery — stitched with love in Vijayawada.',
      address: 'Gandhi Road, Vijayawada, Andhra Pradesh 520001',
      instagram: 'meerafashion',
      website: ''
    },
    brand: {
      logo: null,
      theme: 'modern',
      accent: null,
      buttonStyle: 'gradient',
      cardRadius: 20,
      font: 'modern'
    },
    products: [
      {
        id: 'demo-saree-1',
        name: 'Blue Silk Saree',
        description: 'Pure silk blend saree in royal blue with a subtle gold zari border. Comes with matching blouse piece.',
        price: 1499,
        discountPrice: 1199,
        category: 'Sarees',
        image: sareeImg,
        stock: 'available',
        sku: 'MF-SAR-01',
        size: '',
        color: 'Royal Blue',
        material: 'Pure silk blend',
        createdAt: now - 6 * 86400000
      },
      {
        id: 'demo-kurti-1',
        name: 'Pink Designer Kurti',
        description: 'Blush pink kurti with delicate gold embroidery. Perfect for festivals and everyday office wear.',
        price: 899,
        discountPrice: 699,
        category: 'Kurtis',
        image: kurtiImg,
        stock: 'available',
        sku: 'MF-KUR-02',
        size: 'S–XL',
        color: 'Blush Pink',
        material: 'Rayon blend',
        createdAt: now - 5 * 86400000
      },
      {
        id: 'demo-ear-1',
        name: 'Gold-Plated Jhumka Earrings',
        description: 'Traditional jhumkas in gold-plated brass with intricate filigree. Lightweight, tangle-free hooks.',
        price: 399,
        discountPrice: 299,
        category: 'Jewellery',
        image: earringsImg,
        stock: 'available',
        sku: 'MF-JWL-03',
        size: 'One size',
        color: 'Gold',
        material: 'Brass, gold-plated',
        createdAt: now - 10 * 86400000
      },
      {
        id: 'demo-suit-1',
        name: 'Cotton Suit Set',
        description: 'Teal & cream three-piece cotton suit: kurti, salwar and matching dupatta. Breathable summer cotton.',
        price: 1299,
        discountPrice: 999,
        category: 'Suits',
        image: suitImg,
        stock: 'available',
        sku: 'MF-SUT-04',
        size: 'S / M / L',
        color: 'Teal & Cream',
        material: '100% cotton',
        createdAt: now - 12 * 86400000
      },
      {
        id: 'demo-fest-1',
        name: 'Festival Gift Hamper',
        description: 'Diwali-ready hamper with brass diyas, dry fruits, chocolates and a hand-tied gift box. Ships in 48 hrs.',
        price: 1999,
        discountPrice: 1599,
        category: 'Giftings',
        image: festivalImg,
        stock: 'available',
        sku: 'MF-FEST-05',
        size: '',
        color: '',
        material: '',
        createdAt: now - 2 * 86400000
      },
      {
        id: 'demo-saree-2',
        name: 'Handwoven Cotton Saree',
        description: 'Maroon handloom cotton-silk with white checks, woven by artisans in Kanchipuram.',
        price: 1099,
        discountPrice: 899,
        category: 'Sarees',
        image: saree2Img,
        stock: 'available',
        sku: 'MF-SAR-06',
        size: '',
        color: 'Maroon',
        material: 'Cotton-silk handloom',
        createdAt: now - 1 * 86400000
      },
      {
        id: 'demo-neck-1',
        name: 'Silver Oxidised Necklace',
        description: 'Antique-finish oxidised silver choker with dangling beads. Hypoallergenic clasp.',
        price: 599,
        discountPrice: 449,
        category: 'Jewellery',
        image: necklaceImg,
        stock: 'out',
        sku: 'MF-JWL-07',
        size: 'One size',
        color: 'Silver',
        material: 'Oxidised silver-plated',
        createdAt: now - 20 * 86400000
      }
    ]
  }
}

/** Compact copy used inside the landing-page phone mockup. */
export const DEMO_PHONE_PRODUCTS = [
  { name: 'Blue Silk Saree', price: '₹1,199', image: sareeImg },
  { name: 'Pink Kurti', price: '₹699', image: kurtiImg },
  { name: 'Gold Jhumkas', price: '₹299', image: earringsImg },
  { name: 'Cotton Suit', price: '₹999', image: suitImg }
]
