import { test, expect } from '@playwright/test'

import { generateOrderCode } from '../support/helpers'
import { Navbar } from '../support/components/Navbar'

import { OrderLockupPage } from '../support/pages/OrderLockupPage'
import { LandingPage } from '../support/pages/LandingPage'

test.describe('Consulta de Pedido', () => {
  let orderLockupPage: OrderLockupPage

  test.beforeEach(async ({ page }) => {    
    await new LandingPage(page).goto()
    await new Navbar(page).orderLockupLink()
    orderLockupPage = new OrderLockupPage(page)
    await new OrderLockupPage(page).validatePageLoaded()    
  })

  test('deve consultar um pedido aprovado', async ({ page }) => {

    const order = {
      number: 'VLO-0BWEV0',
      status: 'APROVADO' as const,
      color: 'Glacier Blue',
      wheels: 'aero Wheels',
      customer: {
        name: 'FABRICIO Lages',
        email: 'fabriciolagess@gmail.com'
      },
      payment: 'À Vista'
    }

    await orderLockupPage.searchOrder(order.number)

    await expect(page.getByTestId(`order-result-${order.number}`)).toMatchAriaSnapshot(`
      - img
      - paragraph: Pedido
      - paragraph: ${order.number} 
      - status:
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
      - paragraph: ${order.wheels}
      - heading "Dados do Cliente" [level=4]
      - paragraph: Nome
      - paragraph: ${order.customer.name}
      - paragraph: Email
      - paragraph: ${order.customer.email}
      - paragraph: Loja de Retirada
      - paragraph
      - paragraph: Data do Pedido
      - paragraph: /\\d+\\/\\d+\\/\\d+/
      - heading "Pagamento" [level=4]
      - paragraph: ${order.payment}
      - paragraph: /R\\$ \\d+\\.\\d+,\\d+/
      `)

    await orderLockupPage.validateStatusBadge(order.status)
  })

  test('deve consultar um pedido reprovado', async ({ page }) => {

    const order = {
      number: 'VLO-BYA1N6',
      status: 'REPROVADO' as const,
      color: 'Lunar White',
      wheels: 'sport Wheels',
      customer: {
        name: 'Carolina Neves',
        email: 'cnoliveira84@gmail.com'
      },
      payment: 'À Vista'
    }
   
    await orderLockupPage.searchOrder(order.number)

    await expect(page.getByTestId(`order-result-${order.number}`)).toMatchAriaSnapshot(`
      - img
      - paragraph: Pedido
      - paragraph: ${order.number}
      - status:
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
      - paragraph: ${order.wheels}
      - heading "Dados do Cliente" [level=4]
      - paragraph: Nome
      - paragraph: ${order.customer.name}
      - paragraph: Email
      - paragraph: ${order.customer.email}
      - paragraph: Loja de Retirada
      - paragraph
      - paragraph: Data do Pedido
      - paragraph: /\\d+\\/\\d+\\/\\d+/
      - heading "Pagamento" [level=4]
      - paragraph: ${order.payment}
      - paragraph: /R\\$ \\d+\\.\\d+,\\d+/
      `)
  
    await orderLockupPage.validateStatusBadge(order.status)
  })

  test('deve consultar um pedido em analise', async ({ page }) => {

    const order = {
      number: 'VLO-ZUB7MG',
      status: 'EM_ANALISE' as const,
      color: 'Lunar White',
      wheels: 'aero Wheels',
      customer: {
        name: 'João da Silva',
        email: 'joao@velo.dev'
      },
      payment: 'À Vista'    }


    await orderLockupPage.searchOrder(order.number)

    await expect(page.getByTestId(`order-result-${order.number}`)).toMatchAriaSnapshot(`
      - img
      - paragraph: Pedido
      - paragraph: ${order.number}
      - status:
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
      - paragraph: ${order.wheels}
      - heading "Dados do Cliente" [level=4]
      - paragraph: Nome
      - paragraph: ${order.customer.name}
      - paragraph: Email
      - paragraph: ${order.customer.email}
      - paragraph: Loja de Retirada
      - paragraph
      - paragraph: Data do Pedido
      - paragraph: /\\d+\\/\\d+\\/\\d+/
      - heading "Pagamento" [level=4]
      - paragraph: ${order.payment}
      - paragraph: /R\\$ \\d+\\.\\d+,\\d+/
      `)

    await orderLockupPage.validateStatusBadge(order.status)
  })

  test('deve exibir mensagem quando o pedido não é encontrado', async ({ page }) => {

    const order = generateOrderCode()
    
    await orderLockupPage.searchOrder(order)
    await orderLockupPage.validateOrderNotFound()
  })

  test('deve exibir mensagem quando o pedido tem código fora do padrão', async ({ page }) => {

    const orderCode = 'CODIGO-INVALIDO-999'
 
    await orderLockupPage.searchOrder(orderCode)
    await orderLockupPage.validateOrderNotFound()
  })
})