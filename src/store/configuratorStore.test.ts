import { describe, it, expect } from 'vitest'
import { calculateTotalPrice, calculateInstallment, formatPrice, CarConfiguration, useConfiguratorStore } from './configuratorStore'

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
      expect(calculateTotalPrice(config)).toBe(42000)
    })

    it('should calculate price with optionals', () => {
      const config: CarConfiguration = {
        exteriorColor: 'glacier-blue',
        interiorColor: 'carbon-black',
        wheelType: 'aero',
        optionals: ['precision-park', 'flux-capacitor'],
      }
      expect(calculateTotalPrice(config)).toBe(50500)
    })

    it('should calculate price with sport wheels and all optionals', () => {
      const config: CarConfiguration = {
        exteriorColor: 'glacier-blue',
        interiorColor: 'carbon-black',
        wheelType: 'sport',
        optionals: ['precision-park', 'flux-capacitor'],
      }
      expect(calculateTotalPrice(config)).toBe(52500)
    })
  })

  describe('calculateInstallment', () => {
    it('should calculate 12x installment with 2% monthly interest', () => {
      const expected = Math.round(40000 * 0.02 * Math.pow(1.02, 12) / (Math.pow(1.02, 12) - 1) * 100) / 100
      expect(calculateInstallment(40000)).toBe(expected)
      expect(calculateInstallment(40000)).toBe(3782.38)
    })
  })

  describe('formatPrice', () => {
    it('should format price as BRL currency', () => {
      const formatted = formatPrice(40000)
      expect(formatted).toMatch(/R\$\s?40\.000,00/)

      const formatted2 = formatPrice(52500.50)
      expect(formatted2).toMatch(/R\$\s?52\.500,50/)
    })
  })
})

describe('Estado do Configurator Store', () => {
  it('deve alternar os opcionais corretamente', () => {
    useConfiguratorStore.getState().resetConfiguration()

    expect(useConfiguratorStore.getState().configuration.optionals).toEqual([])

    useConfiguratorStore.getState().toggleOptional('precision-park')
    expect(useConfiguratorStore.getState().configuration.optionals).toContain('precision-park')

    useConfiguratorStore.getState().toggleOptional('flux-capacitor')
    expect(useConfiguratorStore.getState().configuration.optionals).toContain('precision-park')
    expect(useConfiguratorStore.getState().configuration.optionals).toContain('flux-capacitor')
    useConfiguratorStore.getState().toggleOptional('precision-park')
    expect(useConfiguratorStore.getState().configuration.optionals).not.toContain('precision-park')
    expect(useConfiguratorStore.getState().configuration.optionals).toContain('flux-capacitor')
  })

  it('deve redefinir a configuração para o padrão', () => {
    useConfiguratorStore.getState().setExteriorColor('midnight-black')
    useConfiguratorStore.getState().setWheelType('sport')
    useConfiguratorStore.getState().toggleOptional('precision-park')
    expect(useConfiguratorStore.getState().configuration.exteriorColor).toBe('midnight-black')
    useConfiguratorStore.getState().resetConfiguration()

    const config = useConfiguratorStore.getState().configuration
    expect(config.exteriorColor).toBe('glacier-blue')
    expect(config.interiorColor).toBe('carbon-black')
    expect(config.wheelType).toBe('aero')
    expect(config.optionals).toEqual([])
  })

  it('deve lidar com o login corretamente com base nos pedidos existentes', () => {
    useConfiguratorStore.getState().resetConfiguration()
    useConfiguratorStore.setState({ orders: [], currentUserEmail: null })

    const email = 'test@example.com'

    const loginResult1 = useConfiguratorStore.getState().login(email)
    expect(loginResult1).toBe(false)
    expect(useConfiguratorStore.getState().currentUserEmail).toBeNull()
    useConfiguratorStore.getState().addOrder({
      id: 'VLO-123456',
      configuration: useConfiguratorStore.getState().configuration,
      totalPrice: 40000,
      customer: {
        name: 'John',
        surname: 'Doe',
        email: email,
        phone: '11999999999',
        cpf: '12345678901',
        store: 'sao-paulo'
      },
      paymentMethod: 'avista',
      status: 'APROVADO',
      createdAt: new Date().toISOString()
    })

    const loginResult2 = useConfiguratorStore.getState().login(email)
    expect(loginResult2).toBe(true)
    expect(useConfiguratorStore.getState().currentUserEmail).toBe(email)
    useConfiguratorStore.getState().logout()
    expect(useConfiguratorStore.getState().currentUserEmail).toBeNull()
  })
})
