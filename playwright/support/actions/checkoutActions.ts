import { Page, expect } from '@playwright/test'

export function createCheckoutActions(page: Page) {

  const alerts = {
    name: page.getByTestId('error-name'),
    lastname: page.getByTestId('error-lastname'),
    email: page.getByTestId('error-email'),
    phone: page.getByTestId('error-phone'),
    document: page.getByTestId('error-document'),
    store: page.getByTestId('error-store'),
    terms: page.getByTestId('error-terms')
  }

  const terms = page.getByTestId('checkout-terms')

  return {
    elements: {
      terms,
      alerts
    },

    async expectLoaded() {
      await expect(page.getByRole('heading', { name: 'Finalizar Pedido' })).toBeVisible()
    },

    async expectSummaryTotal(price: string) {
      await expect(page.getByTestId('summary-total-price')).toHaveText(price)
    },

    async fillCustomerData(data: {
      name: string
      lastname: string
      email: string
      document: string
      phone: string
    }) {
      await page.getByTestId('checkout-name').fill(data.name)
      await page.getByTestId('checkout-lastname').fill(data.lastname)
      await page.getByTestId('checkout-email').fill(data.email)
      await page.getByTestId('checkout-phone').fill(data.phone)
      await page.getByTestId('checkout-document').fill(data.document)
    },

    async selectStore(store: string) {
      await page.getByTestId('checkout-store').click()
      await page.getByRole('option', { name: store }).click()
    },

    async selectPaymentMethod(method: string) {
      await page.getByRole('button', { name: new RegExp(method, 'i') }).click()
    },

    async expectPaymentMethodValue(method: string, value: string) {
      const tab = page.getByRole('button', { name: new RegExp(method, 'i') })
      await expect(tab).toContainText(value)
    },

    async acceptTerms() {
      await terms.check()
    },

    async submit() {
      await page.getByRole('button', { name: 'Confirmar Pedido' }).click()
    },

    async expectSuccessRoute() {
      await expect(page).toHaveURL(/.*\/success/)
    },

    async expectOrderApprovedMessage() {
      await expect(page.getByRole('heading', { name: 'Pedido Aprovado!' })).toBeVisible()
    }
  }
}