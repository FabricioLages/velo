import { test, expect } from '@playwright/test'

/// AAA - Arrange, Act, Assert
/// AAA - Preparar, Agir, Assertar

test('deve consultar um pedido aprovado', async ({ page }) => {
  //Arrange
  await page.goto('http://localhost:5173/')
  await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText('Velô Sprint')
  await page.getByRole('link', { name: 'Consultar Pedido' }).click()
  await expect(page.getByRole('heading')).toContainText('Consultar Pedido')
  
  //Act
  await page.getByRole('textbox', { name: 'Número do Pedido' }).fill('VLO-WLO6NW')   
  await page.getByRole('button', { name: 'Buscar Pedido' }).click()
  
  //Assert
  
  await expect(page.locator('p.font-mono', { hasText: 'VLO-WLO6NW' })).toContainText('VLO-WLO6NW')
  await expect(page.getByText('APROVADO', { exact: true })).toBeVisible()
})