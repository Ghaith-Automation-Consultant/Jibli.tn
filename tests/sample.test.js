// Sample test to verify Jest setup
describe('Jest Setup', () => {
    test('should run tests successfully', () => {
        expect(true).toBe(true);
    });

    test('should have access to Jest globals', () => {
        expect(describe).toBeDefined();
        expect(test).toBeDefined();
        expect(expect).toBeDefined();
    });
});
