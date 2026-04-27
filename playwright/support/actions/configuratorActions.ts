import { Page, expect } from '@playwright/test'

export function createConfiguratorActions(page: Page) {
  const optionalCheckbox = (name: string | RegExp) => page.getByRole('checkbox', { name })
  const priceElement = page.getByTestId('total-price')

  return {
    elements: {
      priceElement,
    },

    async open() {
      await page.goto('/configure')
    },

    async selectColor(colorName: string) {
      await page.getByRole('button', { name: colorName }).click()
    },

    async selectWheels(wheelName: string | RegExp) {
      await page.getByRole('button', { name: wheelName }).click()
    },

    async expectPrice(price: string) {
      const priceElement = page.getByTestId('total-price')
      await expect(priceElement).toBeVisible()
      await expect(priceElement).toHaveText(price)

    },

    async expectCarImageSrc(scr: string) {
      await expect(page.locator('img[alt^="Velô Sprint"]')).toHaveAttribute('src', scr)
    },

    async checkOptional(name: string | RegExp) {
      await expect(optionalCheckbox(name)).toBeVisible()
      await optionalCheckbox(name).check()
    },

    async uncheckOptional(name: string | RegExp) {
      await expect(optionalCheckbox(name)).toBeVisible()
      await optionalCheckbox(name).uncheck()
    },

    async finishConfigurator() {
      await page.getByRole('button', { name: 'Monte o Seu' }).click()
    },
  }
}
