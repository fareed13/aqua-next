// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { useSecureCalls } from '@/hooks/apiCalls/useApiCalls';
import { useOrgStore } from '@/store/orgStore';
import LocationDetail from './dialogs/LocationDetail';
import DialogPost from './dialogs/DialogPost';

interface StorefrontAddress {
  addressLines: string[];
  locality: string;
  postalCode: string;
}

interface Verification {
  state: string;
}

interface Metadata {
  newReviewUri?: string;
  placeId?: string;
}

interface Location {
  id: string;
  storeCode: string;
  title: string;
  storefrontAddress: StorefrontAddress;
  verifications: Verification[];
  metadata: Metadata;
  phoneNumbers?: { primaryPhone: string };
}

interface Account {
  name: string;
  accountName: string;
}

const SuspendedIcon = () => (
  <svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" width="18" height="18">
    <circle fill="#D93025" cx="9" cy="9" r="9" />
    <path fill="#DADADA" d="M9.0001 2.39941L3.6001 4.79941V8.39941C3.6001 11.7294 5.9041 14.8434 9.0001 15.5994C12.0961 14.8434 14.4001 11.7294 14.4001 8.39941V4.79941L9.0001 2.39941Z" />
    <path fill="#D93025" d="M13.2 8.39987C13.2 11.1119 11.412 13.6139 9.00005 14.3579C6.58805 13.6139 4.80005 11.1119 4.80005 8.39987V5.57987L9.00005 3.71387L13.2 5.57987V8.39987Z" />
    <path fill="white" d="M9.60015 6V9.6H8.40015V6H9.60015Z" />
    <path fill="white" d="M9.60015 10.8V12H8.40015V10.8H9.60015Z" />
  </svg>
);

const VerifiedIcon = () => (
  <svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" width="18" height="18">
    <path fill="#1A73E8" d="M17.6261 9.70416L17.914 9.375L17.6261 9.04584L15.9373 7.1148L16.1726 4.56088L16.2129 4.12449L15.7855 4.02742L13.2882 3.46016L11.9803 1.24573L11.7566 0.867028L11.3525 1.04057L8.99975 2.05085L6.64704 1.04057L6.24347 0.867267L6.01959 1.24514L4.71213 3.4519L2.21529 4.01213L1.78666 4.10831L1.82685 4.54575L2.06228 7.10776L0.372801 9.04651L0.0860338 9.37559L0.373384 9.70416L2.06223 11.6353L1.82685 14.1967L1.78676 14.633L2.214 14.7301L4.71174 15.2974L6.01959 17.5049L6.24403 17.8837L6.64818 17.7089L9.00043 16.6919L11.3525 17.7019L11.756 17.8752L11.9799 17.4974L13.2878 15.2899L15.7855 14.7226L16.2129 14.6255L16.1726 14.1891L15.9373 11.6352L17.6261 9.70416ZM5.82649 9.65537L7.21294 11.0478L7.5671 11.4035L7.92141 11.048L11.9554 7.00021L12.1562 7.20105L12.3581 7.40298L7.56724 12.2069L5.4239 10.058L5.82649 9.65537Z" stroke="white" />
  </svg>
);

const GoogleIcon = () => (
  <svg width="25" height="25" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill="#4285F4" fillRule="evenodd" clipRule="evenodd" d="M14.832 9.04956C14.832 8.61936 14.7933 8.2057 14.7215 7.80859H9V10.1554H12.2695C12.1286 10.9138 11.7006 11.5563 11.0572 11.9865V13.5087H13.0205C14.1693 12.4525 14.832 10.8972 14.832 9.04956Z" />
    <path fill="#34A853" fillRule="evenodd" clipRule="evenodd" d="M9.00013 14.9787C10.6404 14.9787 12.0155 14.4354 13.0207 13.5088L11.0573 11.9866C10.5134 12.3506 9.81749 12.5657 9.00013 12.5657C7.41787 12.5657 6.07861 11.4985 5.60089 10.0645H3.57129V11.6363C4.5709 13.6191 6.62536 14.9787 9.00013 14.9787Z" />
    <path fill="#FBBC05" fillRule="evenodd" clipRule="evenodd" d="M5.60081 10.0638C5.47931 9.69982 5.41028 9.31099 5.41028 8.91112C5.41028 8.51126 5.47931 8.12242 5.60081 7.75841V6.18652H3.57121C3.15976 7.00556 2.92505 7.93214 2.92505 8.91112C2.92505 9.89011 3.15976 10.8167 3.57121 11.6357L5.60081 10.0638Z" />
    <path fill="#EA4335" fillRule="evenodd" clipRule="evenodd" d="M9.00013 5.25771C9.89205 5.25771 10.6928 5.56381 11.3224 6.16499L13.0649 4.42488C12.0128 3.4459 10.6376 2.84473 9.00013 2.84473C6.62536 2.84473 4.5709 4.20427 3.57129 6.18705L5.60089 7.75894C6.07861 6.32494 7.41787 5.25771 9.00013 5.25771Z" />
  </svg>
);

function getVerificationState(item: Location): 'FAILED' | 'COMPLETED' | 'NONE' {
  if (item.verifications.length && item.verifications[0].state === 'FAILED') return 'FAILED';
  if (item.verifications.length && item.verifications[0].state === 'COMPLETED') return 'COMPLETED';
  return 'NONE';
}

export default function GmbList() {
  const { secureEndpoint, getSecure, postSecure } = useSecureCalls();
  const orgStore = useOrgStore();

  const [loader, setLoader] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [dialog, setDialog] = useState(false);
  const [dialogPosts, setDialogPosts] = useState(false);
  const [selectedBusinessLocation, setSelectedBusinessLocation] = useState<Location | null>(null);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const paginatedLocations = locations.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(locations.length / itemsPerPage);

  const resyncGmbOrganizations = async () => {
    try {
      await postSecure(secureEndpoint.GMB_RESYNC_ORGANIZATIONS);
    } catch (error) {
      console.error('Error resyncing GMB organizations:', error);
    }
  };

  const GetAccounts = async () => {
    try {
      setLoader(true);
      const response = await getSecure(secureEndpoint.GMB_ALL_ACCOUNT, {
        organization_id: orgStore.organization?.id,
        location_id: orgStore.location?.id,
      });
      response.accounts[0].accountName = 'ungroup';
      setAccounts(response.accounts);
      setSelectedAccount(response.accounts[0].name);
      setLoader(false);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setLoader(false);
    }
  };

  const getGroupLocation = async (account?: string) => {
    try {
      setLoader(true);
      const response = await getSecure(secureEndpoint.GMB_GROUP_ACCOUNT_LOCATIONS, {
        account: account ?? selectedAccount,
      });
      setLocations(response.locations ?? []);
      setLoader(false);
    } catch (error) {
      console.error('Error fetching locations:', error);
      setLoader(false);
    }
  };

  useEffect(() => {
    (async () => {
      await resyncGmbOrganizations();
      await GetAccounts();
      await getGroupLocation();
    })();
  }, []);

  const openProfileUrl = (url?: string) => {
    if (url) window.open(url, '_blank');
  };

  const redirectToGMB = (businessTitle: string) => {
    if (!businessTitle) return;
    const encoded = encodeURIComponent(businessTitle);
    const mat = 'CVILMsUzYsd1EkoBEKoLaSMmWKwKctl-iBKe1ZK4cuupy3_VRlHu6VS90f9eMSRElBWoIOiEwTFpKXx83fgGbvfwfmxF-NQQkd_I2D719ZBCpqQNjQ';
    window.open(`https://www.google.com/search?q=${encoded}&mat=${mat}&hl=en&authuser=0`, '_blank');
  };

  const editLocation = (item: Location) => {
    setSelectedBusinessLocation(item);
    setDialog(true);
  };

  const createPost = (item: Location) => {
    setSelectedBusinessLocation(item);
    setDialogPosts(true);
  };

  return (
    <div className="relative">
      {loader && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Account selector */}
      <div className="mb-4 max-w-xs">
        <label className="block text-sm font-medium text-gray-700 mb-1">Choose group</label>
        <select
          value={selectedAccount}
          onChange={(e) => { setSelectedAccount(e.target.value); getGroupLocation(e.target.value); }}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {accounts.map((acc) => (
            <option key={acc.name} value={acc.name}>{acc.accountName}</option>
          ))}
        </select>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto shadow rounded">
        <table className="min-w-full bg-white text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Store Code', 'Business', 'Status', '', ''].map((h, i) => (
                <th key={i} className="px-4 py-3 text-left font-semibold text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {locations.map((item) => {
              const state = getVerificationState(item);
              return (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{item.storeCode}</td>
                  <td className="px-4 py-3">
                    <span className="font-medium">{item.title}</span>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {item.storefrontAddress.addressLines[0]}, {item.storefrontAddress.locality}, {item.storefrontAddress.postalCode}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {state === 'FAILED' ? <><SuspendedIcon /><span className="text-xs text-gray-500">Suspended</span></> :
                       state === 'COMPLETED' ? <><VerifiedIcon /><span className="text-xs text-gray-500">Verified</span></> :
                       <><SuspendedIcon /><span className="text-xs text-gray-500">Verification required</span></>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {state === 'COMPLETED' && (
                      <div className="flex items-center gap-2">
                        <button onClick={() => editLocation(item)} className="p-1 hover:bg-gray-100 rounded" title="Edit">
                          <svg viewBox="0 0 24 24" width="22" height="22" fill="#5f6368">
                            <path fillRule="evenodd" clipRule="evenodd" d="M19.06 3.59L20.41 4.94C21.2 5.72 21.2 6.99 20.41 7.77L7.18 21H3V16.82L16.23 3.59C17.01 2.81 18.28 2.81 19.06 3.59ZM5 19L6.41 19.06L16.23 9.23L14.82 7.82L5 17.64V19Z" />
                          </svg>
                        </button>
                        <button onClick={() => createPost(item)} className="p-1 hover:bg-gray-100 rounded" title="Create Post">
                          <svg viewBox="0 0 24 24" width="22" height="22" fill="#5f6368">
                            <path d="M17 19.22H5V7H12V5H5C3.9 5 3 5.9 3 7V19C3 20.1 3.9 21 5 21H17C18.1 21 19 20.1 19 19V12H17V19.22Z" />
                            <path d="M19 2H17V5H14C14.01 5.01 14 7 14 7H17V9.99C17.01 10 19 9.99 19 9.99V7H22V5H19V2Z" />
                            <path d="M15 9H7V11H15V9Z" />
                            <path d="M7 12V14H15V12H7Z" />
                            <path d="M15 15H7V17H15V15Z" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {state === 'FAILED' ? (
                      <button onClick={() => redirectToGMB(item.title)} className="flex items-center gap-1 border border-gray-300 rounded px-2 py-1 text-blue-600 text-xs font-medium hover:bg-gray-50">
                        Manage profile
                      </button>
                    ) : state === 'COMPLETED' ? (
                      <button onClick={() => openProfileUrl(item.metadata.newReviewUri)} className="flex items-center gap-1 border border-gray-300 rounded px-2 py-1 text-blue-600 text-xs font-medium hover:bg-gray-50">
                        <GoogleIcon />
                        <span>See Your Profile</span>
                      </button>
                    ) : (
                      <button onClick={() => openProfileUrl(`https://business.google.com/verify/l/${item.storeCode}`)} className="flex items-center gap-1 border border-gray-300 rounded px-2 py-1 text-blue-600 text-xs font-medium hover:bg-gray-50">
                        Get verified
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-4">
        {paginatedLocations.map((item) => {
          const state = getVerificationState(item);
          return (
            <div key={item.id} className="bg-white rounded shadow border border-gray-200 p-4">
              <p className="text-sm font-medium text-gray-700">#{item.storeCode}</p>
              <p className="font-semibold">{item.title}</p>
              <p className="text-xs text-gray-500">
                {item.storefrontAddress.addressLines[0]}, {item.storefrontAddress.locality}, {item.storefrontAddress.postalCode}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm font-medium">Status:</span>
                {state === 'FAILED' ? <><SuspendedIcon /><span className="text-xs">Suspended</span></> :
                 state === 'COMPLETED' ? <><VerifiedIcon /><span className="text-xs">Verified</span></> :
                 <><SuspendedIcon /><span className="text-xs">Verification required</span></>}
              </div>
              <div className="flex items-center justify-between mt-3">
                {state === 'COMPLETED' && (
                  <div className="flex gap-2">
                    <button onClick={() => editLocation(item)} className="p-1 hover:bg-gray-100 rounded">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="#5f6368">
                        <path fillRule="evenodd" clipRule="evenodd" d="M19.06 3.59L20.41 4.94C21.2 5.72 21.2 6.99 20.41 7.77L7.18 21H3V16.82L16.23 3.59C17.01 2.81 18.28 2.81 19.06 3.59ZM5 19L6.41 19.06L16.23 9.23L14.82 7.82L5 17.64V19Z" />
                      </svg>
                    </button>
                    <button onClick={() => createPost(item)} className="p-1 hover:bg-gray-100 rounded">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="#5f6368">
                        <path d="M17 19.22H5V7H12V5H5C3.9 5 3 5.9 3 7V19C3 20.1 3.9 21 5 21H17C18.1 21 19 20.1 19 19V12H17V19.22Z" />
                        <path d="M19 2H17V5H14C14.01 5.01 14 7 14 7H17V9.99C17.01 10 19 9.99 19 9.99V7H22V5H19V2Z" />
                        <path d="M15 9H7V11H15V9Z" />
                      </svg>
                    </button>
                  </div>
                )}
                {state === 'FAILED' ? (
                  <button onClick={() => redirectToGMB(item.title)} className="text-blue-600 text-sm border border-gray-300 px-2 py-1 rounded">Manage profile</button>
                ) : state === 'COMPLETED' ? (
                  <button onClick={() => openProfileUrl(item.metadata.newReviewUri)} className="flex items-center gap-1 text-blue-600 text-sm border border-gray-300 px-2 py-1 rounded">
                    <GoogleIcon /><span>See Your Profile</span>
                  </button>
                ) : (
                  <button onClick={() => openProfileUrl(`https://business.google.com/verify/l/${item.storeCode}`)} className="text-blue-600 text-sm border border-gray-300 px-2 py-1 rounded">Get verified</button>
                )}
              </div>
            </div>
          );
        })}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 py-4">
            <button onClick={() => setPage(1)} disabled={page <= 1} className="px-2 py-1 border rounded disabled:opacity-40">&laquo;</button>
            <button onClick={() => setPage(p => p - 1)} disabled={page <= 1} className="px-2 py-1 border rounded disabled:opacity-40">&lt;</button>
            <span className="text-sm">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages} className="px-2 py-1 border rounded disabled:opacity-40">&gt;</button>
            <button onClick={() => setPage(totalPages)} disabled={page >= totalPages} className="px-2 py-1 border rounded disabled:opacity-40">&raquo;</button>
          </div>
        )}
      </div>

      {dialog && selectedBusinessLocation && (
        <LocationDetail
          dialog={dialog}
          selectedLocation={selectedBusinessLocation}
          onClose={() => setDialog(false)}
        />
      )}
      {dialogPosts && selectedBusinessLocation && (
        <DialogPost
          dialogPosts={dialogPosts}
          selectedLocation={selectedBusinessLocation}
          onClose={() => setDialogPosts(false)}
        />
      )}
    </div>
  );
}
