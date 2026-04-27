import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createOrder, getOrderByNumber } from './useOrders';

vi.mock('@/integrations/supabase/client', () => {
  const mockSingle = vi.fn();
  const mockMaybeSingle = vi.fn();
  const mockEq = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
  const mockSelectInsert = vi.fn(() => ({ single: mockSingle }));
  const mockSelectGet = vi.fn(() => ({ eq: mockEq }));
  const mockInsert = vi.fn(() => ({ select: mockSelectInsert }));

  return {
    supabase: {
      from: vi.fn((table) => {
        if (table === 'orders') {
          return {
            insert: mockInsert,
            select: mockSelectGet,
          };
        }
        return {};
      }),
    },
    mockSingle,
    mockMaybeSingle,
    mockEq,
    mockSelectInsert,
    mockSelectGet,
    mockInsert,
  };
});

describe('Hooks do useOrders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getOrderByNumber', () => {
    it('deve mapear dbOrder para Order corretamente quando encontrado', async () => {
      const { mockMaybeSingle } = await import('@/integrations/supabase/client') as any;

      const mockDbOrder = {
        id: '123-uuid',
        order_number: 'VLO-ABCDEF',
        color: 'midnight-black',
        wheel_type: 'sport',
        optionals: ['precision-park'],
        customer_name: 'John Doe Silva',
        customer_email: 'john@example.com',
        customer_phone: '11999999999',
        customer_cpf: '12345678901',
        payment_method: 'financiamento',
        total_price: 47500,
        status: 'EM_ANALISE',
        created_at: '2023-10-01T12:00:00Z',
        updated_at: '2023-10-01T12:00:00Z',
      };

      mockMaybeSingle.mockResolvedValueOnce({ data: mockDbOrder, error: null });

      const { order, error } = await getOrderByNumber('VLO-ABCDEF');

      expect(error).toBeNull();
      expect(order).not.toBeNull();
      expect(order?.id).toBe('VLO-ABCDEF');

      expect(order?.customer.name).toBe('John');
      expect(order?.customer.surname).toBe('Doe Silva');
      expect(order?.customer.email).toBe('john@example.com');

      expect(order?.configuration.exteriorColor).toBe('midnight-black');
      expect(order?.configuration.wheelType).toBe('sport');
      expect(order?.configuration.optionals).toEqual(['precision-park']);

      expect(order?.paymentMethod).toBe('financiamento');
      expect(order?.totalPrice).toBe(47500);
      expect(order?.status).toBe('EM_ANALISE');
    });

    it('deve retornar nulo quando o pedido não for encontrado', async () => {
      const { mockMaybeSingle } = await import('@/integrations/supabase/client') as any;
      mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null });

      const { order, error } = await getOrderByNumber('INVALID');

      expect(error).toBeNull();
      expect(order).toBeNull();
    });

    it('deve lidar com erros do supabase de forma elegante', async () => {
      const { mockMaybeSingle } = await import('@/integrations/supabase/client') as any;
      mockMaybeSingle.mockResolvedValueOnce({ data: null, error: { message: 'Database error' } });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

      const { order, error } = await getOrderByNumber('VLO-ERROR');

      expect(order).toBeNull();
      expect(error).toBe('Database error');

      consoleSpy.mockRestore();
    });
  });

  describe('createOrder', () => {
    it('deve criar um pedido e mapear a resposta corretamente', async () => {
      const { mockSingle, mockInsert } = await import('@/integrations/supabase/client') as any;

      const orderData = {
        configuration: {
          exteriorColor: 'lunar-white' as const,
          interiorColor: 'carbon-black' as const,
          wheelType: 'aero' as const,
          optionals: [],
        },
        totalPrice: 40000,
        customer: {
          name: 'Jane',
          surname: 'Doe',
          email: 'jane@example.com',
          phone: '11888888888',
          cpf: '09876543210',
          store: 'rio-de-janeiro'
        },
        paymentMethod: 'avista' as const,
        status: 'APROVADO' as const,
      };

      const mockDbRow = {
        id: 'some-uuid',
        order_number: 'VLO-XYZ123',
        color: 'lunar-white',
        wheel_type: 'aero',
        optionals: [],
        customer_name: 'Jane Doe',
        customer_email: 'jane@example.com',
        customer_phone: '11888888888',
        customer_cpf: '09876543210',
        payment_method: 'avista',
        total_price: 40000,
        status: 'APROVADO',
        created_at: '2023-10-01T15:00:00Z',
      };

      mockSingle.mockResolvedValueOnce({ data: mockDbRow, error: null });

      const { order, error } = await createOrder(orderData);

      expect(error).toBeNull();
      expect(order).not.toBeNull();

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          customer_name: 'Jane Doe',
          color: 'lunar-white',
          total_price: 40000,
        })
      );

      const insertArg = mockInsert.mock.calls[0][0];
      expect(insertArg.order_number).toMatch(/^VLO-[A-Z0-9]{6}$/);

      expect(order?.customer.store).toBe('rio-de-janeiro');
      expect(order?.id).toBe('VLO-XYZ123');
    });
  });
});
