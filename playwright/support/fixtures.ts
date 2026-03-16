import { test as base } from '@playwright/test'
import { createOrderLockupActions } from './actions/orderLockupActions'
import { createConfiguratorActions } from './actions/configuratorActions'

type App = {
  orderLoockup: ReturnType<typeof createOrderLockupActions>;
  configurator: ReturnType<typeof createConfiguratorActions>;
}

export const test = base.extend<{ app: App }>({
  app: async ({ page }, use) => {
    const app: App = {
      orderLoockup: createOrderLockupActions(page),
      configurator: createConfiguratorActions(page)
    }

    await use(app)
  }
})

export { expect } from '@playwright/test'

