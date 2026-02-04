/**
 * @jest-environment jsdom
 */

const JibliData = require('../../../js/data');

describe('JibliData Client', () => {
    beforeEach(() => {
        // Mock localStorage
        const localStorageMock = (function () {
            let store = {};
            return {
                getItem: function (key) {
                    return store[key] || null;
                },
                setItem: function (key, value) {
                    store[key] = value.toString();
                },
                removeItem: function (key) {
                    delete store[key];
                },
                clear: function () {
                    store = {};
                }
            };
        })();
        Object.defineProperty(window, 'localStorage', { value: localStorageMock });

        // Mock fetch
        global.fetch = jest.fn();

        // Reset state
        JibliData.trips = [];
        JibliData.requests = [];
    });

    test('should manage auth token', () => {
        JibliData.setToken('fake-token');
        expect(JibliData.getToken()).toBe('fake-token');
        expect(window.localStorage.getItem('jibli_token')).toBe('fake-token');

        JibliData.clearToken();
        expect(JibliData.getToken()).toBeNull();
    });

    test('should fetch data successfully', async () => {
        const mockTrips = [{ id: 1, from: 'Paris' }];
        const mockRequests = [{ id: 1, item: 'Laptop' }];

        global.fetch
            .mockImplementationOnce(() => Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ data: mockTrips })
            }))
            .mockImplementationOnce(() => Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ data: mockRequests })
            }));

        const result = await JibliData.fetchData();

        expect(result).toBe(true);
        expect(JibliData.trips).toEqual(mockTrips);
        expect(JibliData.requests).toEqual(mockRequests);
        expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    test('should create trip successfully', async () => {
        const tripData = { from: 'Tunis', to: 'Paris' };
        const createdTrip = { id: 123, ...tripData };

        JibliData.setToken('auth-token');

        global.fetch.mockImplementationOnce(() => Promise.resolve({
            ok: true,
            json: () => Promise.resolve(createdTrip)
        }));

        const result = await JibliData.createTrip(tripData);

        expect(result).toEqual(createdTrip);
        expect(JibliData.trips[0]).toEqual(createdTrip);
        expect(global.fetch).toHaveBeenCalledWith('/api/trips', expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
                'Authorization': 'Bearer auth-token'
            })
        }));
    });

    test('should login user', async () => {
        const mockResponse = { user: { id: 1, token: 'new-token', name: 'Test' } };

        global.fetch.mockImplementationOnce(() => Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockResponse)
        }));

        const data = await JibliData.login('test@test.com', '123456');

        expect(data).toEqual(mockResponse);
        expect(JibliData.getToken()).toBe('new-token');
    });
});
