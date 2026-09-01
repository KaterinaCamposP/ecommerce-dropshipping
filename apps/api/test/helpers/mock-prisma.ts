export const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    findUniqueOrThrow: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  refreshToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    deleteMany: jest.fn(),
  },
  product: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $connect: jest.fn(),
  $disconnect: jest.fn(),
};

export type MockPrismaService = typeof mockPrismaService;

/**
 * Resetea todos los mocks entre tests.
 * Llamar en `beforeEach` de cada describe.
 */
export function resetPrismaMock() {
  Object.values(mockPrismaService.user).forEach((fn) => fn.mockReset());
  Object.values(mockPrismaService.refreshToken).forEach((fn) => fn.mockReset());
  Object.values(mockPrismaService.product).forEach((fn) => fn.mockReset());
}
