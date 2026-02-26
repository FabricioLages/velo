import { test as base } from '@playwright/test'
import { createOrderLockupActions } from './actions/orderLockupActions'

type App = {
  orderLoockup: ReturnType<typeof createOrderLockupActions>
}

export const test = base.extend<{ app: App }>({
  app: async ({ page }, use) => {
    const app: App = {
      orderLoockup: createOrderLockupActions(page)
    }

    await use(app)
  }
})

export { expect } from '@playwright/test'

