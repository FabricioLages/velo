import { test, expect } from '../support/fixtures'

test.describe('Configuração do Veículo', () => {
  test.beforeEach(async ({ app }) => {
    await app.configurator.open()
  })

  test('deve atualizar a imagem e manter o preço base ao trocar a cor do veículo', async ({ app }) => {
    await app.configurator.expectPrice('R$ 40.000,00')

    await app.configurator.selectColor('Midnight Black')
    await app.configurator.expectPrice('R$ 40.000,00')
    await app.configurator.expectCarImageSrc('/src/assets/midnight-black-aero-wheels.png')
  })

  test('deve atualizar o preço e a imagem ao alterar as rodas, e restaurar os valores padrão', async ({ app }) => {
    await app.configurator.expectPrice('R$ 40.000,00')

    await app.configurator.selectWheels(/Sport Wheels/)
    await app.configurator.expectPrice('R$ 42.000,00')
    await app.configurator.expectCarImageSrc('/src/assets/glacier-blue-sport-wheels.png')

    await app.configurator.selectWheels(/Aero Wheels/)
    await app.configurator.expectPrice('R$ 40.000,00')
    await app.configurator.expectCarImageSrc('/src/assets/glacier-blue-aero-wheels.png')
  })

  test('deve atualizar o preço dinamicamente ao adicionar e remover opcionais e navegar para o checkout', async ({ page, app }) => {
    await app.configurator.expectPrice('R$ 40.000,00')

    await app.configurator.checkOptional(/Precision Park/)
    await app.configurator.expectPrice('R$ 45.500,00')

    await app.configurator.checkOptional(/Flux Capacitor/)
    await app.configurator.expectPrice('R$ 50.500,00')

    await app.configurator.uncheckOptional('Precision Park')
    await app.configurator.uncheckOptional('Flux Capacitor')
    await app.configurator.expectPrice('R$ 40.000,00')

    await app.configurator.finishConfigurator()
    await app.checkout.expectLoaded()
    await app.checkout.expectSummaryTotal('R$ 40.000,00')
  })
})

