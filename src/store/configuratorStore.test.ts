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

describe('Estado do Configurator Store', () => {
  it('deve alternar os opcionais corretamente', () => {
    // Redefinir para o padrão
    useConfiguratorStore.getState().resetConfiguration()
    
    // Inicialmente os opcionais devem estar vazios
    expect(useConfiguratorStore.getState().configuration.optionals).toEqual([])

    // Alternar 'precision-park'
    useConfiguratorStore.getState().toggleOptional('precision-park')
    expect(useConfiguratorStore.getState().configuration.optionals).toContain('precision-park')

    // Alternar 'flux-capacitor'
    useConfiguratorStore.getState().toggleOptional('flux-capacitor')
    expect(useConfiguratorStore.getState().configuration.optionals).toContain('precision-park')
    expect(useConfiguratorStore.getState().configuration.optionals).toContain('flux-capacitor')

    // Alternar 'precision-park' novamente para removê-lo
    useConfiguratorStore.getState().toggleOptional('precision-park')
    expect(useConfiguratorStore.getState().configuration.optionals).not.toContain('precision-park')
    expect(useConfiguratorStore.getState().configuration.optionals).toContain('flux-capacitor')
  })

  it('deve redefinir a configuração para o padrão', () => {
    // Alterar algum estado
    useConfiguratorStore.getState().setExteriorColor('midnight-black')
    useConfiguratorStore.getState().setWheelType('sport')
    useConfiguratorStore.getState().toggleOptional('precision-park')

    // Verificar se o estado foi alterado
    expect(useConfiguratorStore.getState().configuration.exteriorColor).toBe('midnight-black')

    // Redefinir
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
    
    // Deve falhar o login se não existirem pedidos para o email
    const loginResult1 = useConfiguratorStore.getState().login(email)
    expect(loginResult1).toBe(false)
    expect(useConfiguratorStore.getState().currentUserEmail).toBeNull()

    // Adicionar um pedido com o email fornecido
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

    // Agora o login deve ser bem sucedido
    const loginResult2 = useConfiguratorStore.getState().login(email)
    expect(loginResult2).toBe(true)
    expect(useConfiguratorStore.getState().currentUserEmail).toBe(email)

    // Deve realizar o logout com sucesso
    useConfiguratorStore.getState().logout()
    expect(useConfiguratorStore.getState().currentUserEmail).toBeNull()
  })
})
