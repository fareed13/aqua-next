// @ts-nocheck
'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSecureCalls } from '@/hooks/apiCalls/useApiCalls'
import { useOrgStore } from '@/store/orgStore'
import SendBulkMessage from './SendBulkMessage'

interface Tag {
  id: string | null
  name: string
}

interface ServiceType {
  id: string | null
  name: string
}

interface Customer {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  tags: Tag[]
  primary_service: string
}

export default function MassCommunication() {
  const { getSecure, postSecure, secureEndpoint } = useSecureCalls()
  const orgStore = useOrgStore()

  const [loading, setLoading] = useState(false)
  const [messagePopup, setMessagePopup] = useState(false)
  const [search] = useState<string | null>(null)
  const [selectedCustomers, setSelectedCustomers] = useState<Customer[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [tags, setTags] = useState<Tag[]>([{ id: null, name: 'All' }])
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([{ id: null, name: 'All' }])
  const [organizationServices, setOrganizationServices] = useState<any[]>([{ name: 'All', id: null }])
  const [selectedLabel, setSelectedLabel] = useState<(string | null)[]>([])
  const [selectedService, setSelectedService] = useState<(string | null)[]>([])
  const [serviceMap, setServiceMap] = useState<Record<string, string>>({})
  const [page, setPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [rowsPerPage, setRowsPerPage] = useState<string>('10')
  const [totalCount, setTotalCount] = useState(0)
  const [finalCount, setFinalCount] = useState(0)

  const rowsPerPageOptions = ['5', '10', '15', 'All']

  const paginationRange = useMemo(() => {
    const start = (page - 1) * itemsPerPage + 1
    const end = Math.min(page * itemsPerPage, totalCount)
    return `${start} - ${end} of ${totalCount}`
  }, [page, itemsPerPage, totalCount])

  useEffect(() => {
    initData()
  }, [])

  useEffect(() => {
    setCustomers([])
    setPage(1)
    getCustomers()
  }, [selectedLabel, selectedService])

  async function initData() {
    await getCustomers()
    try {
      const services = orgStore.getServices ?? []
      const map: Record<string, string> = {}
      services.forEach((s: any) => { map[`${s.id}`] = s.name })
      setServiceMap(map)
      setOrganizationServices([{ name: 'All', id: null }, ...services.filter((s: any) => !s.parent_service)])
      const fetchedTags = await getSecure(secureEndpoint.TAGS)
      setTags([{ id: null, name: 'All' }, ...(Array.isArray(fetchedTags) ? fetchedTags : [])])
    } catch (error) {
      console.error(error)
    }
  }

  async function getCustomers() {
    try {
      setLoading(true)
      const { count, results } = await getSecure(secureEndpoint.CUSTOMER, {
        page,
        size: itemsPerPage,
        tags: selectedLabel.length ? selectedLabel.join(',') : null,
        services: selectedService.length ? selectedService.join(',') : null,
      })
      setTotalCount(count)
      setFinalCount(Math.ceil(count / itemsPerPage))
      setCustomers(results ?? [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  function changeItemPerPage(val: string) {
    setRowsPerPage(val)
    if (val === 'All') {
      setItemsPerPage(totalCount || 1000)
    } else {
      setItemsPerPage(parseInt(val))
    }
    setPage(1)
    getCustomers()
  }

  function handlePaginationChange(newPage: number) {
    setPage(newPage)
    getCustomers()
  }

  async function toggleMessagePopup(val: boolean) {
    if (val && selectedCustomers.length === 0) {
      alert('Please select customers first')
      return
    }
    if (!val) setSelectedCustomers([])
    setMessagePopup(val)
  }

  function toggleCustomerSelection(customer: Customer, checked: boolean) {
    if (checked) {
      setSelectedCustomers((prev) => [...prev, customer])
    } else {
      setSelectedCustomers((prev) => prev.filter((c) => c.id !== customer.id))
    }
  }

  function toggleSelectAll(checked: boolean) {
    if (checked) {
      setSelectedCustomers(customers)
    } else {
      setSelectedCustomers([])
    }
  }

  const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Tags', 'Service']

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#124e66] p-5">
        <div className="flex flex-wrap items-center gap-4">
          <h3 className="text-white text-2xl font-semibold flex items-center gap-2">
            <span>📚</span> Mass Communication
          </h3>
          <div className="flex-1 flex flex-wrap gap-3 justify-center">
            <select
              multiple
              value={selectedLabel as string[]}
              onChange={(e) => setSelectedLabel(Array.from(e.target.selectedOptions, o => o.value === 'null' ? null : o.value))}
              className="border border-white/40 rounded px-3 py-1 text-sm bg-transparent text-white min-w-[150px]"
            >
              {tags.map((t) => (
                <option key={t.id ?? 'all'} value={t.id ?? 'null'} className="text-black">{t.name}</option>
              ))}
            </select>
            <select
              multiple
              value={selectedService as string[]}
              onChange={(e) => setSelectedService(Array.from(e.target.selectedOptions, o => o.value === 'null' ? null : o.value))}
              className="border border-white/40 rounded px-3 py-1 text-sm bg-transparent text-white min-w-[150px]"
            >
              {organizationServices.map((s) => (
                <option key={s.id ?? 'all'} value={s.id ?? 'null'} className="text-black">{s.name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => toggleMessagePopup(true)}
            className="bg-white text-black font-semibold px-5 py-2 rounded hover:bg-gray-100 transition-colors"
          >
            Create Message
          </button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block p-4">
        {loading ? (
          <p className="text-center text-gray-500 py-10">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-white border border-gray-200 rounded shadow-sm text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase text-gray-600">
                <tr>
                  <th className="px-4 py-3 border-b">
                    <input
                      type="checkbox"
                      onChange={(e) => toggleSelectAll(e.target.checked)}
                      checked={selectedCustomers.length === customers.length && customers.length > 0}
                    />
                  </th>
                  {headers.map((h) => (
                    <th key={h} className="px-4 py-3 border-b">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={headers.length + 1} className="text-center text-gray-500 py-10">No Customers Found</td>
                  </tr>
                ) : (
                  customers.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <input
                          type="checkbox"
                          checked={selectedCustomers.some((c) => c.id === item.id)}
                          onChange={(e) => toggleCustomerSelection(item, e.target.checked)}
                        />
                      </td>
                      <td className="px-4 py-2">{item.first_name}</td>
                      <td className="px-4 py-2">{item.last_name}</td>
                      <td className="px-4 py-2">{item.email}</td>
                      <td className="px-4 py-2">{item.phone}</td>
                      <td className="px-4 py-2">
                        <div className="flex flex-wrap gap-1">
                          {item.tags?.map((chp, i) => (
                            <span key={i} className="bg-[#fb0062] text-white text-xs px-2 py-0.5 rounded-full">{chp.name}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-2">{serviceMap[`${item.primary_service}`]}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        {/* Pagination */}
        {customers.length > 0 && (
          <div className="flex flex-wrap items-center justify-end gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <span>Rows Per Page:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => changeItemPerPage(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1"
              >
                {rowsPerPageOptions.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <span>{paginationRange}</span>
            <div className="flex gap-1">
              <button disabled={page === 1} onClick={() => handlePaginationChange(page - 1)} className="px-2 py-1 disabled:opacity-40">‹</button>
              <button disabled={page >= finalCount} onClick={() => handlePaginationChange(page + 1)} className="px-2 py-1 disabled:opacity-40">›</button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden p-4">
        {customers.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg font-semibold text-gray-500">No Customers Found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {customers.map((item) => (
              <div
                key={item.id}
                className={`bg-white border rounded p-4 transition-shadow ${selectedCustomers.some((c) => c.id === item.id) ? 'border-blue-500 shadow-md' : 'border-gray-200'}`}
              >
                <div className="flex items-center gap-2 text-sm mb-1">
                  <span>👤</span><span>{item.first_name} {item.last_name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm mb-1">
                  <span>📧</span><span>{item.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm mb-1">
                  <span>📞</span><span>{item.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm mb-1">
                  <span>🏷️</span>
                  <div className="flex flex-wrap gap-1">
                    {item.tags?.map((chp, i) => (
                      <span key={i} className="bg-[#fb0062] text-white text-xs px-2 py-0.5 rounded-full">{chp.name}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span>💼</span><span>{serviceMap[`${item.primary_service}`]}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <SendBulkMessage
        toggleDialog={toggleMessagePopup}
        customers={selectedCustomers}
        dialogFlag={messagePopup}
        tags={tags}
        types={serviceTypes}
      />
    </div>
  )
}
