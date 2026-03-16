import { test, expect } from '../support/fixtures'

test.describe('Configuração de adicionais do Veículo', () => {
  test.beforeEach(async ({ app }) => {
    await app.configurator.open()
  })

  test('deve atualizar o preço dinamicamente ao adicionar e remover opcionais e navegar para o checkout', async ({ page, app }) => {
    await app.configurator.expectPrice('R$ 40.000,00')

    await app.configurator.toggleOption('Precision Park')
    await app.configurator.expectPrice('R$ 45.500,00')

    await app.configurator.toggleOption('Flux Capacitor')
    await app.configurator.expectPrice('R$ 50.500,00')

    await app.configurator.toggleOption('Precision Park')
    await app.configurator.expectPrice('R$ 45.000,00')

    await app.configurator.toggleOption('Flux Capacitor')
    await app.configurator.expectPrice('R$ 40.000,00')

    await expect(page.getByRole('button', { name: 'Monte o Seu' })).toBeVisible()
    await page.getByRole('button', { name: 'Monte o Seu' }).click()

    await expect(page).toHaveURL(/.*\/order/)
  })
})
