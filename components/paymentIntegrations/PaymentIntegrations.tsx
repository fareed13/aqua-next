// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { useOrgStore } from '@/store/orgStore';
import { useSecureCalls } from '@/hooks/apiCalls/useApiCalls';

interface PaymentIntegrationState {
  stripe: { api_key: string | null; publishable_key: string | null };
  braintree: {
    public_key: string | null;
    merchant_id: string | null;
    private_key: string | null;
    tokenization_key: string | null;
  };
  fat_zebra: { username: string | null; access_token: string | null };
  square: {
    application_id: string | null;
    access_token: string | null;
    location_id: string | null;
  };
  aquila: {
    apiKey: string | null;
    locationId: string | null;
    refreshToken: string | null;
  };
}

interface MethodChoice {
  text: string;
  value: string;
}

export function PaymentIntegrations() {
  const organization = useOrgStore(s => s.organization);
  const locations = useOrgStore(s => s.locations);
  const location = useOrgStore(s => s.location);
  const { getSecure: getApiCalls, putSecure: putApiCalls, secureEndpoint } = useSecureCalls();

  const [overlay, setOverlay] = useState<boolean>(false);
  const [show1, setShow1] = useState<boolean>(false);
  const [show2, setShow2] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [active_payment_method, setActivePaymentMethod] = useState<string>('');
  const [allIntegrations, setAllIntegrations] = useState<any>({});
  const [multipleAquilaLocations, setMultipleAquilaLocations] = useState<boolean>(false);
  const [aquila_locations, setAquilaLocations] = useState<any[]>([]);
  const [aquilaAuthUrl, setAquilaAuthUrl] = useState<string>('');
  const [openPanels, setOpenPanels] = useState<Record<string, boolean>>({});
  const [payment_integration, setPaymentIntegration] = useState<PaymentIntegrationState>({
    stripe: { api_key: null, publishable_key: null },
    braintree: {
      public_key: null,
      merchant_id: null,
      private_key: null,
      tokenization_key: null,
    },
    fat_zebra: { username: null, access_token: null },
    square: { application_id: null, access_token: null, location_id: null },
    aquila: { apiKey: null, locationId: null, refreshToken: null },
  });
  const [methodChoices] = useState<MethodChoice[]>([
    { text: 'Stripe', value: 'stripe' },
    { text: 'Braintree', value: 'braintree' },
    { text: 'Fat Zebra', value: 'fat_zebra' },
    { text: 'Square', value: 'square' },
    { text: 'Aquila', value: 'aquila' },
  ]);

  useEffect(() => {
    setSelectedLocation(location);
    getLocationPaymentIntegration();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getLocationPaymentIntegration = async () => {
    setOverlay(true);
    try {
      const endpoint =
        secureEndpoint?.LOCATION_SECURE ||
        `/api/locations/${selectedLocation?.id || location?.id}/payment-integrations`;
      const response = await getApiCalls(endpoint);
      if (response) {
        setAllIntegrations(response);
        setIntegrationData(response);
        if (response.active_payment_method) {
          setActivePaymentMethod(response.active_payment_method);
        }
      }

      const aquilaEndpoint =
        secureEndpoint?.LOCATION_AQUILA_PAYMENT_SETUP ||
        `/api/locations/${selectedLocation?.id || location?.id}/aquila-payment-setup`;
      const aquilaResponse = await getApiCalls(aquilaEndpoint);
      if (aquilaResponse) {
        if (aquilaResponse.auth_url) {
          setAquilaAuthUrl(aquilaResponse.auth_url);
        }
        if (aquilaResponse.locations && aquilaResponse.locations.length > 1) {
          setMultipleAquilaLocations(true);
          setAquilaLocations(aquilaResponse.locations);
        }
      }
    } catch (error) {
      console.error('Failed to fetch payment integrations:', error);
    } finally {
      setOverlay(false);
    }
  };

  const setIntegrationData = (data: any) => {
    setPaymentIntegration((prev) => ({
      stripe: {
        api_key: data?.stripe?.api_key ?? prev.stripe.api_key,
        publishable_key: data?.stripe?.publishable_key ?? prev.stripe.publishable_key,
      },
      braintree: {
        public_key: data?.braintree?.public_key ?? prev.braintree.public_key,
        merchant_id: data?.braintree?.merchant_id ?? prev.braintree.merchant_id,
        private_key: data?.braintree?.private_key ?? prev.braintree.private_key,
        tokenization_key: data?.braintree?.tokenization_key ?? prev.braintree.tokenization_key,
      },
      fat_zebra: {
        username: data?.fat_zebra?.username ?? prev.fat_zebra.username,
        access_token: data?.fat_zebra?.access_token ?? prev.fat_zebra.access_token,
      },
      square: {
        application_id: data?.square?.application_id ?? prev.square.application_id,
        access_token: data?.square?.access_token ?? prev.square.access_token,
        location_id: data?.square?.location_id ?? prev.square.location_id,
      },
      aquila: {
        apiKey: data?.aquila?.apiKey ?? prev.aquila.apiKey,
        locationId: data?.aquila?.locationId ?? prev.aquila.locationId,
        refreshToken: data?.aquila?.refreshToken ?? prev.aquila.refreshToken,
      },
    }));
  };

  const savePaymentSettings = async () => {
    setOverlay(true);
    try {
      const endpoint =
        secureEndpoint?.LOCATION_SECURE ||
        `/api/locations/${selectedLocation?.id || location?.id}/payment-integrations`;
      await putApiCalls(endpoint, {
        ...payment_integration,
        active_payment_method,
      });
    } catch (error) {
      console.error('Failed to save payment settings:', error);
    } finally {
      setOverlay(false);
    }
  };

  const createAuthCode = () => {
    if (aquilaAuthUrl) {
      window.open(aquilaAuthUrl, '_blank', 'width=600,height=700');
    }
  };

  const togglePanel = (key: string) => {
    setOpenPanels((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const inputClass =
    'w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500 mb-3';

  return (
    <div className="p-6">
      {overlay && (
        <div className="fixed inset-0 bg-white/70 flex items-center justify-center z-50">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
        </div>
      )}

      <h2 className="text-xl font-semibold mb-4">Payment Integration</h2>

      {locations && locations.length > 1 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <select
            className={inputClass}
            value={selectedLocation?.id || ''}
            onChange={(e) => {
              const loc = locations.find((l: any) => String(l.id) === e.target.value);
              setSelectedLocation(loc || null);
              getLocationPaymentIntegration();
            }}
          >
            {locations.map((loc: any) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <hr className="mb-4 border-gray-200" />

      {/* Stripe */}
      <div className="border border-gray-200 rounded mb-2">
        <div
          className="flex justify-between items-center cursor-pointer bg-gray-50 p-3 border-b border-gray-200"
          onClick={() => togglePanel('stripe')}
        >
          <span className="font-medium text-sm">Stripe</span>
          <span className="text-gray-500 text-xs">{openPanels['stripe'] ? '▼' : '▶'}</span>
        </div>
        {openPanels['stripe'] && (
          <div className="p-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">Secret Key</label>
            <div className="relative mb-3">
              <input
                type={show1 ? 'text' : 'password'}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500 pr-16"
                value={payment_integration.stripe.api_key || ''}
                onChange={(e) =>
                  setPaymentIntegration((prev) => ({
                    ...prev,
                    stripe: { ...prev.stripe, api_key: e.target.value },
                  }))
                }
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700"
                onClick={() => setShow1((v) => !v)}
              >
                {show1 ? 'Hide' : 'Show'}
              </button>
            </div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Publishable Key
            </label>
            <div className="relative mb-3">
              <input
                type={show2 ? 'text' : 'password'}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500 pr-16"
                value={payment_integration.stripe.publishable_key || ''}
                onChange={(e) =>
                  setPaymentIntegration((prev) => ({
                    ...prev,
                    stripe: { ...prev.stripe, publishable_key: e.target.value },
                  }))
                }
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700"
                onClick={() => setShow2((v) => !v)}
              >
                {show2 ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Braintree */}
      <div className="border border-gray-200 rounded mb-2">
        <div
          className="flex justify-between items-center cursor-pointer bg-gray-50 p-3 border-b border-gray-200"
          onClick={() => togglePanel('braintree')}
        >
          <span className="font-medium text-sm">Braintree</span>
          <span className="text-gray-500 text-xs">{openPanels['braintree'] ? '▼' : '▶'}</span>
        </div>
        {openPanels['braintree'] && (
          <div className="p-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">Public Key</label>
            <input
              type="text"
              className={inputClass}
              value={payment_integration.braintree.public_key || ''}
              onChange={(e) =>
                setPaymentIntegration((prev) => ({
                  ...prev,
                  braintree: { ...prev.braintree, public_key: e.target.value },
                }))
              }
            />
            <label className="block text-xs font-medium text-gray-600 mb-1">Merchant ID</label>
            <input
              type="text"
              className={inputClass}
              value={payment_integration.braintree.merchant_id || ''}
              onChange={(e) =>
                setPaymentIntegration((prev) => ({
                  ...prev,
                  braintree: { ...prev.braintree, merchant_id: e.target.value },
                }))
              }
            />
            <label className="block text-xs font-medium text-gray-600 mb-1">Private Key</label>
            <input
              type="text"
              className={inputClass}
              value={payment_integration.braintree.private_key || ''}
              onChange={(e) =>
                setPaymentIntegration((prev) => ({
                  ...prev,
                  braintree: { ...prev.braintree, private_key: e.target.value },
                }))
              }
            />
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Tokenization Key
            </label>
            <input
              type="text"
              className={inputClass}
              value={payment_integration.braintree.tokenization_key || ''}
              onChange={(e) =>
                setPaymentIntegration((prev) => ({
                  ...prev,
                  braintree: { ...prev.braintree, tokenization_key: e.target.value },
                }))
              }
            />
          </div>
        )}
      </div>

      {/* Fat Zebra */}
      <div className="border border-gray-200 rounded mb-2">
        <div
          className="flex justify-between items-center cursor-pointer bg-gray-50 p-3 border-b border-gray-200"
          onClick={() => togglePanel('fat_zebra')}
        >
          <span className="font-medium text-sm">Fat Zebra</span>
          <span className="text-gray-500 text-xs">{openPanels['fat_zebra'] ? '▼' : '▶'}</span>
        </div>
        {openPanels['fat_zebra'] && (
          <div className="p-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">Username</label>
            <input
              type="text"
              className={inputClass}
              value={payment_integration.fat_zebra.username || ''}
              onChange={(e) =>
                setPaymentIntegration((prev) => ({
                  ...prev,
                  fat_zebra: { ...prev.fat_zebra, username: e.target.value },
                }))
              }
            />
            <label className="block text-xs font-medium text-gray-600 mb-1">Access Token</label>
            <input
              type="text"
              className={inputClass}
              value={payment_integration.fat_zebra.access_token || ''}
              onChange={(e) =>
                setPaymentIntegration((prev) => ({
                  ...prev,
                  fat_zebra: { ...prev.fat_zebra, access_token: e.target.value },
                }))
              }
            />
          </div>
        )}
      </div>

      {/* Square */}
      <div className="border border-gray-200 rounded mb-2">
        <div
          className="flex justify-between items-center cursor-pointer bg-gray-50 p-3 border-b border-gray-200"
          onClick={() => togglePanel('square')}
        >
          <span className="font-medium text-sm">Square</span>
          <span className="text-gray-500 text-xs">{openPanels['square'] ? '▼' : '▶'}</span>
        </div>
        {openPanels['square'] && (
          <div className="p-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">Application ID</label>
            <input
              type="text"
              className={inputClass}
              value={payment_integration.square.application_id || ''}
              onChange={(e) =>
                setPaymentIntegration((prev) => ({
                  ...prev,
                  square: { ...prev.square, application_id: e.target.value },
                }))
              }
            />
            <label className="block text-xs font-medium text-gray-600 mb-1">Access Token</label>
            <input
              type="text"
              className={inputClass}
              value={payment_integration.square.access_token || ''}
              onChange={(e) =>
                setPaymentIntegration((prev) => ({
                  ...prev,
                  square: { ...prev.square, access_token: e.target.value },
                }))
              }
            />
            <label className="block text-xs font-medium text-gray-600 mb-1">Location ID</label>
            <input
              type="text"
              className={inputClass}
              value={payment_integration.square.location_id || ''}
              onChange={(e) =>
                setPaymentIntegration((prev) => ({
                  ...prev,
                  square: { ...prev.square, location_id: e.target.value },
                }))
              }
            />
          </div>
        )}
      </div>

      {/* Aquila */}
      <div className="border border-gray-200 rounded mb-4">
        <div
          className="flex justify-between items-center cursor-pointer bg-gray-50 p-3 border-b border-gray-200"
          onClick={() => togglePanel('aquila')}
        >
          <span className="font-medium text-sm">Aquila</span>
          <span className="text-gray-500 text-xs">{openPanels['aquila'] ? '▼' : '▶'}</span>
        </div>
        {openPanels['aquila'] && (
          <div className="p-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">API Key</label>
            <input
              type="text"
              className={inputClass}
              value={payment_integration.aquila.apiKey || ''}
              onChange={(e) =>
                setPaymentIntegration((prev) => ({
                  ...prev,
                  aquila: { ...prev.aquila, apiKey: e.target.value },
                }))
              }
            />
            <label className="block text-xs font-medium text-gray-600 mb-1">Location ID</label>
            <input
              type="text"
              className={inputClass}
              value={payment_integration.aquila.locationId || ''}
              onChange={(e) =>
                setPaymentIntegration((prev) => ({
                  ...prev,
                  aquila: { ...prev.aquila, locationId: e.target.value },
                }))
              }
            />
            <label className="block text-xs font-medium text-gray-600 mb-1">Refresh Token</label>
            <input
              type="text"
              className={inputClass}
              value={payment_integration.aquila.refreshToken || ''}
              onChange={(e) =>
                setPaymentIntegration((prev) => ({
                  ...prev,
                  aquila: { ...prev.aquila, refreshToken: e.target.value },
                }))
              }
            />
            <button
              type="button"
              className="bg-black text-white text-sm px-4 py-2 rounded hover:bg-gray-800 transition-colors"
              onClick={createAuthCode}
            >
              Generate Aquila Credentials
            </button>
          </div>
        )}
      </div>

      {/* Active Payment Method */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Active Payment Method
        </label>
        <select
          className={inputClass}
          value={active_payment_method}
          onChange={(e) => setActivePaymentMethod(e.target.value)}
        >
          <option value="">-- Select --</option>
          {methodChoices.map((choice) => (
            <option key={choice.value} value={choice.value}>
              {choice.text}
            </option>
          ))}
        </select>
      </div>

      {/* Save Button */}
      <button
        type="button"
        className="bg-black text-white text-sm px-6 py-2 rounded hover:bg-gray-800 transition-colors"
        onClick={savePaymentSettings}
      >
        Save
      </button>
    </div>
  );
}
