import { Page, expect } from '@playwright/test'

export type OrderStatus = 'APROVADO' | 'REPROVADO' | 'EM_ANALISE'

export type OrderDetails = {
  number: string
  status: OrderStatus
  color: string
  wheels: string
  customer: { name: string; email: string }
  payment: string
}

export function createOrderLockupActions(page: Page) {
  const statusClasses = {
    APROVADO: {
      background: 'bg-green-100',
      text: 'text-green-700',
      icon: 'lucide-circle-check-big'
    },
    REPROVADO: {
      background: 'bg-red-100',
      text: 'text-red-700',
      icon: 'lucide-circle-x'
    },
    EM_ANALISE: {
      background: 'bg-amber-100',
      text: 'text-amber-700',
      icon: 'lucide-clock'
    }
  } as const

  const orderInput = page.getByRole('textbox', { name: 'Número do Pedido' })
  const searchButton = page.getByRole('button', { name: 'Buscar Pedido' })

  return {

    element: {
      orderInput,
      searchButton
    },

    async open() {
      await page.goto('/')
      const title = page.getByTestId('hero-section').getByRole('heading')
      await expect(title).toContainText('Velô Sprint')

      await page.getByRole('link', { name: 'Consultar Pedido' }).click()
      await expect(page.getByRole('heading')).toContainText('Consultar Pedido')
    },

    async searchOrder(code: string) {
      await orderInput.fill(code)
      await searchButton.click()
    },

    async validateStatusBadge(status: OrderStatus) {
      const classes = statusClasses[status]
      const statusBadge = page.getByRole('status').filter({ hasText: status })

      await expect(statusBadge).toHaveClass(new RegExp(classes.background))
      await expect(statusBadge).toHaveClass(new RegExp(classes.text))
      await expect(statusBadge.locator('svg')).toHaveClass(new RegExp(classes.icon))
    },

    async validateOrderNotFound() {
      await expect(page.locator('#root')).toMatchAriaSnapshot(`
      - img
      - heading "Pedido não encontrado" [level=3]
      - paragraph: Verifique o número do pedido e tente novamente
      `)
    },
  }
}

