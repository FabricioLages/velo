import { describe, it, expect } from 'vitest'
import { calculateTotalPrice, calculateInstallment, formatPrice, CarConfiguration } from './configuratorStore'

describe('configuratorStore utilities', () => {
  describe('calculateTotalPrice', () => {
    it('should calculate base price correctly', () => {
      const config: CarConfiguration = {
        exteriorColor: 'glacier-blue',
        interiorColor: 'carbon-black',
        wheelType: 'aero',
        optionals: [],
      }
      expect(calculateTotalPrice(config)).toBe(40000)
    })

    it('should calculate price with sport wheels', () => {
      const config: CarConfiguration = {
        exteriorColor: 'glacier-blue',
        interiorColor: 'carbon-black',
        wheelType: 'sport',
        optionals: [],
      }
      expect(calculateTotalPrice(config)).toBe(42000) // 40000 + 2000
    })

    it('should calculate price with optionals', () => {
      const config: CarConfiguration = {
        exteriorColor: 'glacier-blue',
        interiorColor: 'carbon-black',
        wheelType: 'aero',
        optionals: ['precision-park', 'flux-capacitor'],
      }
      expect(calculateTotalPrice(config)).toBe(50500) // 40000 + 5500 + 5000
    })

    it('should calculate price with sport wheels and all optionals', () => {
      const config: CarConfiguration = {
        exteriorColor: 'glacier-blue',
        interiorColor: 'carbon-black',
        wheelType: 'sport',
        optionals: ['precision-park', 'flux-capacitor'],
      }
      expect(calculateTotalPrice(config)).toBe(52500) // 40000 + 2000 + 5500 + 5000
    })
  })

  describe('calculateInstallment', () => {
    it('should calculate 12x installment with 2% monthly interest', () => {
      // 40000 * 0.02 * (1.02)^12 / ((1.02)^12 - 1)
      const expected = Math.round(40000 * 0.02 * Math.pow(1.02, 12) / (Math.pow(1.02, 12) - 1) * 100) / 100
      expect(calculateInstallment(40000)).toBe(expected)
      expect(calculateInstallment(40000)).toBe(3782.38)
    })
  })

  describe('formatPrice', () => {
    it('should format price as BRL currency', () => {
      // The exact space character can vary (e.g., standard space vs non-breaking space)
      // so we use a regex to match the expected format
      const formatted = formatPrice(40000)
      expect(formatted).toMatch(/R\$\s?40\.000,00/)

      const formatted2 = formatPrice(52500.50)
      expect(formatted2).toMatch(/R\$\s?52\.500,50/)
    })
  })
})
