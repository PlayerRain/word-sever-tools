import { RemoveCharsetMiddleware } from './remove-charset.middleware';

describe('RemoveCharsetMiddleware', () => {
  it('should be defined', () => {
    expect(new RemoveCharsetMiddleware()).toBeDefined();
  });
});
