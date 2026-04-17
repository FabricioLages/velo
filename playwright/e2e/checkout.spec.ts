
import { test, expect } from '../support/fixtures'
import { deleteSpecificOrder, deleteOrderByEmail } from '../support/database/orderRepository'

test.describe('Checkout', () => {
  test.describe('Pagamento e Confirmação', () => {


    test('deve criar um pedido com pagamento à vista com sucesso', async ({ app, page }) => {
      const customer = {
        name: 'Fabricio',
        lastname: 'Silva',
        email: 'fabricio.silva@example.com',
        document: '09968863033',
        phone: '(11) 99999-9999',
        store: 'Velô Paulista',
        paymentMethod: 'À Vista',
        totalPrice: 'R$ 40.000,00'
      }

      //await deleteSpecificOrder(customer)
      await deleteOrderByEmail(customer.email)

      // Arrange
      await page.goto('/')
      await page.getByRole('link', { name: /Configure Agora/i }).click()
      await app.configurator.expectPrice(customer.totalPrice)
      await app.configurator.finishConfigurator()
      await app.checkout.expectLoaded()


      await app.checkout.fillCustomerData(customer)
      await app.checkout.selectStore(customer.store)

      // Act
      await app.checkout.expectPaymentMethodValue(customer.paymentMethod, customer.totalPrice)
      await app.checkout.expectSummaryTotal(customer.totalPrice)
      await app.checkout.acceptTerms()
      await app.checkout.submit()

      // Assert
      await app.checkout.expectSuccessRoute()
      await app.checkout.expectOrderApprovedMessage()
    })

    test('deve aprovar automaticamente o crédito quando o score do CPF for maior que 700 no financiamento.', async ({ app, page }) => {
      const customer = {
        name: 'Steve',
        lastname: 'Woz',
        email: 'woz@velo.com',
        document: '75784457071',
        phone: '(11) 99999-9999',
        store: 'Velô Paulista',
        paymentMethod: 'Financiamento',
        totalPrice: 'R$ 40.000,00'
      }

      //await deleteSpecificOrder(customer)
      await deleteOrderByEmail(customer.email)

      await page.route('**/functions/v1/credit-analysis', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'Done',
            score: 701,
          }),
        })
      })

      // Arrange
      await page.goto('/')
      await page.getByRole('link', { name: /Configure Agora/i }).click()
      await app.configurator.expectPrice(customer.totalPrice)
      await app.configurator.finishConfigurator()
      await app.checkout.expectLoaded()


      await app.checkout.fillCustomerData(customer)
      await app.checkout.selectStore(customer.store)

      // Act     
      await app.checkout.selectPaymentMethod(customer.paymentMethod)
      // await app.checkout.expectSummaryTotal(customer.totalPrice)
      await app.checkout.acceptTerms()
      await app.checkout.submit()

      // Assert
      await app.checkout.expectSuccessRoute()
      await app.checkout.expectOrderApprovedMessage()
    })

    test('deve colocar o pedido em análise quando o score do CPF for entre 501 e 700 no financiamento. (CT07)', async ({ app, page }) => {
      const customer = {
        name: 'Woz',
        lastname: 'Steve',
        email: 'woz2@velo.com',
        document: '31331487021',
        phone: '(11) 99999-9999',
        store: 'Velô Paulista',
        paymentMethod: 'Financiamento',
        totalPrice: 'R$ 40.000,00'
      }

      await deleteOrderByEmail(customer.email)

      await page.route('**/functions/v1/credit-analysis', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'Done',
            score: 600,
          }),
        })
      })

      // Arrange
      await page.goto('/')
      await page.getByRole('link', { name: /Configure Agora/i }).click()
      await app.configurator.expectPrice(customer.totalPrice)
      await app.configurator.finishConfigurator()
      await app.checkout.expectLoaded()

      await app.checkout.fillCustomerData(customer)
      await app.checkout.selectStore(customer.store)

      // Act     
      await app.checkout.selectPaymentMethod(customer.paymentMethod)
      await app.checkout.acceptTerms()
      await app.checkout.submit()

      // Assert
      await app.checkout.expectSuccessRoute()
      await app.checkout.expectOrderInAnalysisMessage()
    })

  })


  test.describe('Validações de campos obrigatórios', () => {
    let alerts: any
    test.beforeEach(async ({ page, app }) => {
      await page.goto('/order')
      await expect(page.getByRole('heading', { name: 'Finalizar Pedido' })).toBeVisible()
      alerts = app.checkout.elements.alerts
    })

    test('deve validar obrigatoriedade de todos os campos em branco', async ({ app }) => {

      // Act
      await app.checkout.submit()

      // Assert
      await expect(alerts.name).toContainText('Nome deve ter pelo menos 2 caracteres')
      await expect(alerts.lastname).toContainText('Sobrenome deve ter pelo menos 2 caracteres')
      await expect(alerts.email).toContainText('Email inválido')
      await expect(alerts.phone).toContainText('Telefone inválido')
      await expect(alerts.document).toContainText('CPF inválido')
      await expect(alerts.store).toContainText('Selecione uma loja')
      await expect(alerts.terms).toHaveText('Aceite os termos')
    })

    test('deve validar limite mínimo de caracteres para Nome e Sobrenome', async ({ app }) => {

      const customer = {
        name: 'A',
        lastname: 'B',
        email: 'teste@teste.com',
        document: '51176040081',
        phone: '(11) 99999-9999',
      }

      // Arrange
      await app.checkout.fillCustomerData(customer)
      await app.checkout.selectStore('Velô Paulista')
      await app.checkout.acceptTerms()

      // Act
      await app.checkout.submit()

      // Assert
      await expect(alerts.name).toHaveText('Nome deve ter pelo menos 2 caracteres')
      await expect(alerts.lastname).toHaveText('Sobrenome deve ter pelo menos 2 caracteres')
    })

    test('deve exibir erro para e-mail com formato inválido', async ({ app }) => {
      const customer = {
        name: 'João',
        lastname: 'Silva',
        email: 'testeteste.com',
        phone: '(11) 99999-9999',
        document: '51176040081'
      }

      // Arrange
      await app.checkout.fillCustomerData(customer)
      await app.checkout.selectStore('Velô Paulista')
      await app.checkout.acceptTerms()

      // Act
      await app.checkout.submit()

      // Assert
      await expect(alerts.email).toHaveText('Email inválido')
    })

    test('deve exibir erro para CPF inválido', async ({ app }) => {

      const customer = {
        name: 'João',
        lastname: 'Silva',
        email: 'teste@teste.com',
        document: '123',
        phone: '(11) 99999-9999',
      }


      // Arrange
      await app.checkout.fillCustomerData(customer)
      await app.checkout.selectStore('Velô Paulista')
      await app.checkout.acceptTerms()

      // Act
      await app.checkout.submit()

      // Assert
      await expect(alerts.document).toHaveText('CPF inválido')
    })

    test('deve exigir o aceite dos termos ao finalizar com dados válidos', async ({ app }) => {

      const customer = {
        name: 'João',
        lastname: 'Silva',
        email: 'teste@teste.com',
        document: '01691447048',
        phone: '(11) 99999-9999',
      }

      // Arrange
      await app.checkout.fillCustomerData(customer)
      await app.checkout.selectStore('Velô Paulista')

      // Arrange  

      await expect(app.checkout.elements.terms).not.toBeChecked()

      // Act
      await app.checkout.submit()

      // Assert
      await expect(alerts.terms).toHaveText('Aceite os termos')
    })
  })

})