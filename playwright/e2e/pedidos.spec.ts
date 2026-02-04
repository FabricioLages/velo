import { test, expect } from '@playwright/test'
import { generateOrderCode } from '../support/helpers'

/// AAA - Arrange, Act, Assert
/// AAA - Preparar, Agir, Assertar

test.describe('Consulta de Pedido', () => {

  test.beforeEach(async ({ page }) => {
    //Arrange
    await page.goto('http://localhost:5173/')
    await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText('Velô Sprint')

    await page.getByRole('link', { name: 'Consultar Pedido' }).click()
    await expect(page.getByRole('heading')).toContainText('Consultar Pedido')
  })

  test('deve consultar um pedido aprovado', async ({ page }) => {
    // Test Data
    //const order = 'VLO-BYA1N6'
    const order = {
      number: 'VLO-WLO6NW',
      status: 'APROVADO',
      weels: 'aero Wheels',
      color: 'Glacier Blue',
      customer: {
        name: 'FABRICIO LAGES',
        email: 'fabriciolagess@gmail.com',
      },
      payment: 'À Vista'
    }

    //Act
    await page.getByRole('textbox', { name: 'Número do Pedido' }).fill(order.number)
    await page.getByRole('button', { name: 'Buscar Pedido' }).click()

    //Assert 
    // const containerPedido = page.getByRole('paragraph')
    //   .filter({ hasText: /^Pedido$/ })
    //   .locator('..') //Sobe para o elemento pai (a div que agrupo ambos)

    // await expect(containerPedido).toContainText(order, { timeout: 10_000 })
    // await expect(page.getByText('APROVADO')).toBeVisible()

    await expect(page.getByTestId(`order-result-${order.number}`)).toMatchAriaSnapshot(`
      - img
      - paragraph: Pedido
      - paragraph: ${order.number}
      - img
      - text: ${order.status}
      - img "Velô Sprint"
      - paragraph: Modelo
      - paragraph: Velô Sprint
      - paragraph: Cor
      - paragraph: ${order.color}
      - paragraph: Interior
      - paragraph: cream
      - paragraph: Rodas
      - paragraph:  ${order.weels}
      - heading "Dados do Cliente" [level=4]
      - paragraph: Nome
      - paragraph:  ${order.customer.name}
      - paragraph: Email
      - paragraph:  ${order.customer.email}
      - paragraph: Loja de Retirada
      - paragraph
      - paragraph: Data do Pedido
      - paragraph: /\\d+\\/\\d+\\/\\d+/
      - heading "Pagamento" [level=4]
      - paragraph:  ${order.payment}
      - paragraph: /R\\$ \\d+\\.\\d+,\\d+/
      `)
  })

  test('deve consultar um pedido reprovado', async ({ page }) => {
    // Test Data
    //const order = 'VLO-BYA1N6'
    const order = {
      number: 'VLO-BYA1N6',
      status: 'REPROVADO',
      weels: 'sport Wheels',
      color: 'Lunar White',
      customer: {
        name: 'Carolina Neves',
        email: 'cnoliveira84@gmail.com',
      },
      payment: 'À Vista'
    }

    //Act
    await page.getByRole('textbox', { name: 'Número do Pedido' }).fill(order.number)
    await page.getByRole('button', { name: 'Buscar Pedido' }).click()

    //Assert 
    // const containerPedido = page.getByRole('paragraph')
    //   .filter({ hasText: /^Pedido$/ })
    //   .locator('..') //Sobe para o elemento pai (a div que agrupo ambos)

    // await expect(containerPedido).toContainText(order, { timeout: 10_000 })
    // await expect(page.getByText('APROVADO')).toBeVisible()

    await expect(page.getByTestId(`order-result-${order.number}`)).toMatchAriaSnapshot(`
      - img
      - paragraph: Pedido
      - paragraph: ${order.number}
      - img
      - text: ${order.status}
      - img "Velô Sprint"
      - paragraph: Modelo
      - paragraph: Velô Sprint
      - paragraph: Cor
      - paragraph: ${order.color}
      - paragraph: Interior
      - paragraph: cream
      - paragraph: Rodas
      - paragraph:  ${order.weels}
      - heading "Dados do Cliente" [level=4]
      - paragraph: Nome
      - paragraph:  ${order.customer.name}
      - paragraph: Email
      - paragraph:  ${order.customer.email}
      - paragraph: Loja de Retirada
      - paragraph
      - paragraph: Data do Pedido
      - paragraph: /\\d+\\/\\d+\\/\\d+/
      - heading "Pagamento" [level=4]
      - paragraph:  ${order.payment}
      - paragraph: /R\\$ \\d+\\.\\d+,\\d+/
      `)
  })

  test('deve exibir mensagem quando o pedido não é encontrado', async ({ page }) => {

    const order = generateOrderCode()

    await page.getByRole('textbox', { name: 'Número do Pedido' }).fill(order)
    await page.getByRole('button', { name: 'Buscar Pedido' }).click()

    await expect(page.locator('#root')).toMatchAriaSnapshot(`
      - img
      - heading "Pedido não encontrado" [level=3]
      - paragraph: Verifique o número do pedido e tente novamente
      `)
  })
})

